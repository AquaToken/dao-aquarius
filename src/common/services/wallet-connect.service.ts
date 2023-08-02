import WalletConnectClient, { SIGN_CLIENT_EVENTS } from '@walletconnect/sign-client';
import { PairingTypes, SessionTypes, SignClientTypes } from '@walletconnect/types';
import { getInternalError, getSdkError } from '@walletconnect/utils';
import * as StellarSdk from 'stellar-sdk';
import QRModal from '../modals/WalletConnectModals/QRModal';
import PairingModal from '../modals/WalletConnectModals/PairingModal';
import SessionRequestModal from '../modals/WalletConnectModals/SessionRequestModal';
import EventService from './event.service';
import { ModalService, ToastService } from './globalServices';
import RequestModal from '../modals/WalletConnectModals/RequestModal';

const METADATA = {
    name: 'Aquarius',
    description: 'Aquarius - liquidity management layer for Stellar',
    url: 'https://aqua.network',
    icons: [`https://aqua.network/favicon.png`],
};

const PUBNET = 'stellar:pubnet';

const STELLAR_METHODS = {
    SIGN_AND_SUBMIT: 'stellar_signAndSubmitXDR',
    SIGN: 'stellar_signXDR',
};

const REQUIRED_NAMESPACES = {
    stellar: {
        chains: [PUBNET],
        methods: Object.values(STELLAR_METHODS),
        events: [],
    },
};

export enum WalletConnectEvents {
    login = 'login',
    logout = 'logout',
}

export enum BuildSignAndSubmitStatuses {
    success = 'success',
    pending = 'pending',
}

export const WC_APP_ALIAS = 'WC_APP';
const WC_DEEP_LINK_APPS = 'WC_DEEP_LINK_APPS';

const INTERNET_CONNECTION_ERROR = 'Make sure you are connected to the internet and try again.';
const SESSION_TIMEOUT_ERROR = 'Session failed to settle after 300 seconds';
const PAIRING_TIMEOUT_ERROR = 'Pairing failed to settle after 300 seconds';

const CONNECTION_TIMEOUT = 60000;

function getLocalStorage(): Storage | undefined {
    let res: Storage | undefined = undefined;
    if (typeof window !== 'undefined' && typeof window['localStorage'] !== 'undefined') {
        res = window['localStorage'];
    }
    return res;
}

export const saveAppToLS = (name, uri) => {
    const focusUri = uri.split('?')[0];
    const LS = getLocalStorage();
    if (LS) {
        LS.setItem(
            WC_APP_ALIAS,
            JSON.stringify({
                name,
                uri: focusUri,
            }),
        );
    }
};

export const getSavedApp = () => {
    const LS = getLocalStorage();
    if (!LS) {
        return null;
    }
    return JSON.parse(LS.getItem(WC_APP_ALIAS) || 'null');
};

export const clearApp = () => {
    const LS = getLocalStorage();
    if (LS) {
        LS.removeItem(WC_APP_ALIAS);
    }
};

export const openApp = () => {
    const saved = getSavedApp();
    if (saved) {
        window.open(saved.uri, '_blank');
    }
};

const getAppsDeepLinkList = () => {
    const LS = getLocalStorage();
    if (!LS) {
        return new Map();
    }

    return new Map(JSON.parse(LS.getItem(WC_DEEP_LINK_APPS) || '[]'));
};

const setAppsDeepLinkList = (list) => {
    const LS = getLocalStorage();
    if (!LS) {
        return;
    }

    LS.setItem(WC_DEEP_LINK_APPS, JSON.stringify(Array.from(list.entries())));
};

const addAppToDeepLinkListIfNeeded = (topic: string) => {
    const app = getSavedApp();

    if (!app) {
        return;
    }
    const appList = getAppsDeepLinkList();
    appList.set(topic, JSON.stringify(app));
    setAppsDeepLinkList(appList);
};

export const getAppFromDeepLinkList = (topic) => {
    const appsList = getAppsDeepLinkList();

    return appsList.has(topic) ? JSON.parse(appsList.get(topic)) : null;
};

const wcSessionAlias = 'wc@2:client:0.3//session';

const isSessionExist = (): boolean => {
    const LS = getLocalStorage();

    if (!LS) {
        return;
    }

    const sessionList = JSON.parse(LS.getItem(wcSessionAlias) || '[]');

    return Boolean(sessionList.length);
};

const customPostMessage = (data) => {
    const stringify = JSON.stringify(data);

    try {
        // IOS
        // @ts-ignore
        if (window.webkit) {
            // @ts-ignore
            window.webkit.messageHandlers.submitToiOS.postMessage(stringify);
        }

        // android
        // @ts-ignore
        if (window.android) {
            // @ts-ignore
            window.android.postMessage(stringify);
        }

        // web
        console.log(stringify);
    } catch (e) {
        // do nothing
    }
};

export default class WalletConnectServiceClass {
    appMeta: SignClientTypes.Metadata | null = null;
    client: WalletConnectClient | null = null;
    session: SessionTypes.Struct | null = null;
    event: EventService = new EventService();
    selfMeta = METADATA;
    isOffline = false;

    constructor() {
        window.addEventListener('offline', () => {
            this.client = null;
            this.isOffline = true;
        });
        window.addEventListener('online', async () => {
            this.isOffline = false;
            if (this.session) {
                await this.setClient();
            }
        });
    }

    async loginIfSessionExist(): Promise<any> {
        if (!isSessionExist()) {
            return Promise.resolve();
        }

        return this.initWalletConnect(true);
    }

    async initWalletConnect(withTimeout?: boolean): Promise<boolean> {
        try {
            if (this.isOffline) {
                ToastService.showErrorToast(INTERNET_CONNECTION_ERROR);
                return;
            }
            if (this.client) {
                clearApp();
                return false;
            }

            await this.setClient();

            this.listenWalletConnectEvents();

            // This dirty code is needed for the case when a logout is performed from the wallet
            // while the dapp is inactive and after launching the dapp the logout event comes 2 seconds later
            if (withTimeout) {
                await new Promise((resolve) => {
                    setTimeout(() => resolve(void 0), 2500);
                });
            }

            return this.checkPersistedState();
        } catch (e) {
            ToastService.showErrorToast('WalletConnect initialization failed');
            return true;
        }
    }

    async checkPersistedState(): Promise<boolean> {
        if (!this.client.session.length) {
            clearApp();
            return false;
        }

        this.session = await this.client.session.getAll()[0];

        this.processSessionAndTriggerEvent();

        ModalService.closeAllModals();

        return true;
    }

    listenWalletConnectEvents(): void {
        this.client.on(SIGN_CLIENT_EVENTS.session_delete, ({ topic }: any) => {
            this.onSessionDeleted(topic);
        });
    }

    onSessionDeleted(topic: string): void {
        if (this.session && this.session.topic === topic) {
            this.session = null;
            this.appMeta = null;
            clearApp();

            this.event.trigger({ type: WalletConnectEvents.logout });
        }
    }

    async login(): Promise<void> {
        const isLogged = await this.initWalletConnect();

        if (isLogged) {
            return;
        }

        ModalService.closeAllModals();

        if (
            this.client.pairing
                .getAll({ active: true })
                .filter(({ peerMetadata }) => Boolean(peerMetadata)).length > 3
        ) {
            const deletePromises = [];
            this.client.pairing
                .getAll({ active: true })
                .filter(({ peerMetadata }) => Boolean(peerMetadata))
                .slice(0, -3)
                .forEach((pairing) => {
                    deletePromises.push(
                        this.client.pairing.delete(pairing.topic, getInternalError('UNKNOWN_TYPE')),
                    );
                });

            await Promise.all(deletePromises);
        }

        if (
            this.client.pairing
                .getAll({ active: true })
                .filter(({ peerMetadata }) => Boolean(peerMetadata)).length
        ) {
            ModalService.closeAllModals();
            ModalService.openModal(PairingModal, {
                pairings: this.client.pairing
                    .getAll({ active: true })
                    .filter(({ peerMetadata }) => Boolean(peerMetadata))
                    .reverse(),
                connect: this.connect.bind(this),
                deletePairing: this.deletePairing.bind(this),
            });
            return;
        }

        await this.connect();
    }

    async autoLogin() {
        if (this.session) {
            return Promise.resolve();
        }
        if (this.isOffline) {
            ToastService.showErrorToast(INTERNET_CONNECTION_ERROR);
            return Promise.reject();
        }
        await this.initWalletConnect();

        return this.connect(null, true);
    }

    async deletePairing(topic: string): Promise<void> {
        await this.client.pairing.delete(topic, getInternalError('UNKNOWN_TYPE'));
    }

    async connect(pairing?: PairingTypes.Struct, isAutoConnect?: boolean): Promise<void> {
        if (this.isOffline) {
            ToastService.showErrorToast(INTERNET_CONNECTION_ERROR);
            return;
        }
        ModalService.closeAllModals();

        if (pairing) {
            ModalService.openModal(SessionRequestModal, {
                name: pairing.peerMetadata.name,
                icon: pairing.peerMetadata.icons[0],
            });
        }

        try {
            const { uri, approval } = await this.client.connect({
                requiredNamespaces: REQUIRED_NAMESPACES,
                pairingTopic: pairing?.topic,
            });

            if (!pairing && !isAutoConnect) {
                ModalService.openModal(QRModal, { uri });
            }

            if (isAutoConnect) {
                customPostMessage(uri);
            }

            this.session = await approval();
        } catch (e) {
            if (this.session) {
                return;
            }
            this.appMeta = null;

            const errorMessage =
                e.message === 'rejected' ||
                e.message === '' ||
                getSdkError('USER_REJECTED').code === e?.code
                    ? 'Connection cancelled by the user'
                    : e.message;

            ToastService.showErrorToast(
                errorMessage ??
                    (e === SESSION_TIMEOUT_ERROR || e === PAIRING_TIMEOUT_ERROR
                        ? 'Connection could not be established. Please try connecting again.'
                        : e),
            );

            ModalService.closeAllModals();
            return;
        }

        ModalService.closeAllModals();

        this.processSessionAndTriggerEvent();

        setTimeout(() => {
            const latestPairing = this.client.pairing.getAll({ active: true })[
                this.client.pairing.getAll({ active: true }).length - 1
            ];

            if (latestPairing) {
                addAppToDeepLinkListIfNeeded(latestPairing.topic);
            }
        }, 1000);

        if (pairing) {
            await this.client.pairing.update(pairing.topic, {
                peerMetadata: this.appMeta,
            });
        }
    }

    async logout(): Promise<void> {
        if (this.isOffline) {
            ToastService.showErrorToast(INTERNET_CONNECTION_ERROR);
            return;
        }
        if (this.session) {
            await this.client.disconnect({
                topic: this.session.topic,
                reason: getSdkError('USER_DISCONNECTED'),
            });
            this.onSessionDeleted(this.session.topic);
        }
    }

    signAndSubmitTx(tx: StellarSdk.Transaction): Promise<any> {
        const xdr = tx.toEnvelope().toXDR('base64');

        const request = this.client.request({
            topic: this.session.topic,
            chainId: PUBNET,
            request: {
                method: STELLAR_METHODS.SIGN_AND_SUBMIT,
                params: {
                    xdr,
                },
            },
        });

        ModalService.openModal(RequestModal, {
            name: this.appMeta.name,
            result: request,
        });

        return request;
    }

    signTx(tx: StellarSdk.Transaction): Promise<any> {
        const xdr = tx.toEnvelope().toXDR('base64');

        const request = this.client.request({
            topic: this.session.topic,
            chainId: PUBNET,
            request: {
                method: STELLAR_METHODS.SIGN,
                params: {
                    xdr,
                },
            },
        });

        ModalService.openModal(RequestModal, {
            name: this.appMeta.name,
            result: request,
        });

        return request.then(({ signedXDR }) => signedXDR);
    }

    private processSessionAndTriggerEvent() {
        this.appMeta = this.session.peer.metadata;

        const [, , publicKey] = this.session.namespaces.stellar.accounts[0].split(':');

        this.event.trigger({
            type: WalletConnectEvents.login,
            publicKey: publicKey.toUpperCase(),
            metadata: this.appMeta,
            topic: this.session.topic,
        });
    }

    private async setClient() {
        this.client = await Promise.race([
            WalletConnectClient.init({
                projectId: process.env.WALLET_CONNECT_PROJECT_ID,
                metadata: this.selfMeta,
            }),
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject('Connection timeout');
                }, CONNECTION_TIMEOUT);
            }) as Promise<WalletConnectClient>,
        ]);
    }
}
