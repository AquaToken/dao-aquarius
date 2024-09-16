import WalletConnectClient, { SIGN_CLIENT_EVENTS } from '@walletconnect/sign-client';
import { PairingTypes, SessionTypes, SignClientTypes } from '@walletconnect/types';
import { getInternalError, getSdkError } from '@walletconnect/utils';
import * as StellarSdk from '@stellar/stellar-sdk';
import QRModal from '../modals/WalletConnectModals/QRModal';
import PairingModal from '../modals/WalletConnectModals/PairingModal';
import SessionRequestModal from '../modals/WalletConnectModals/SessionRequestModal';
import EventService from './event.service';
import { ModalService, ToastService } from './globalServices';
import RequestModal from '../modals/WalletConnectModals/RequestModal';
import {
    clearCurrentWallet,
    savePairingToDeepLinkHistory,
    sendUriToWalletWebView,
    sessionExistsInStorage,
} from '../helpers/wallet-connect-helpers';

import {
    CLIENT_TIMEOUT_MESSAGE,
    CONNECTION_REJECTED_MESSAGE,
    CONNECTION_TIMEOUT,
    CONNECTION_TIMEOUT_ERROR,
    INTERNET_CONNECTION_ERROR,
    METADATA,
    PUBNET,
    REQUIRED_NAMESPACES,
    SESSION_TIMEOUT_ERROR,
    STELLAR_METHODS,
} from 'constants/wallet-connect';
import { WalletConnectEvents } from 'types/wallet-connect';

// TODO:  Move to WC types, add function to check pending status
export enum BuildSignAndSubmitStatuses {
    success = 'success',
    pending = 'pending',
}

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
                // reinitialize the client after reconnect
                await this.setClient();
            }
        });
    }

    //  This method is called when app has mounted,
    //  if there is a saved session in the  WalletConnect storage, we start the WalletConnect initialization
    //
    //  If we want to disconnect all the established sessions, we pass the parameter disconnectAll.
    //  Used for the auto-connect page
    onAppStart(disconnectAll: boolean): Promise<any> {
        if (!sessionExistsInStorage()) {
            return Promise.resolve();
        }

        return this.initWalletConnect(disconnectAll);
    }

    async initWalletConnect(disconnectAll?: boolean): Promise<boolean> {
        try {
            if (this.isOffline) {
                ToastService.showErrorToast(INTERNET_CONNECTION_ERROR);
                return;
            }
            if (this.client) {
                clearCurrentWallet();
                return false;
            }

            await this.setClient();

            const disconnectPromises = [];

            //  disconnect all the established sessions
            if (disconnectAll) {
                this.client.session.getAll().forEach(session => {
                    disconnectPromises.push(
                        this.client.disconnect({
                            topic: session.topic,
                            reason: getSdkError('USER_REJECTED'),
                        }),
                    );
                });
            }

            await Promise.all(disconnectPromises);

            this.listenWalletConnectEvents();

            return this.checkPersistedState();
        } catch (e) {
            ToastService.showErrorToast('WalletConnect initialization failed');
            return true;
        }
    }

    async checkPersistedState(): Promise<boolean> {
        if (!this.client.session.length) {
            clearCurrentWallet();
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
            clearCurrentWallet();

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
                .forEach(pairing => {
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

    // Method for auto-connection with the wallet inside the mobile WebView
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

    // if this is an auto-connect don't show QR-modal, just send URI to the WebView
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
                sendUriToWalletWebView(uri);
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
                    ? CONNECTION_REJECTED_MESSAGE
                    : e.message;

            ToastService.showErrorToast(
                errorMessage ??
                    (e === SESSION_TIMEOUT_ERROR || e === PAIRING_TIMEOUT_ERROR
                        ? CONNECTION_TIMEOUT_ERROR
                        : e),
            );

            ModalService.closeAllModals();
            return;
        }

        ModalService.closeAllModals();

        this.processSessionAndTriggerEvent();

        // fix deep links issue, cause sometimes this.client.pairing is being updated through some time
        setTimeout(() => {
            const latestPairing = this.client.pairing.getAll({ active: true })[
                this.client.pairing.getAll({ active: true }).length - 1
            ];

            if (latestPairing) {
                savePairingToDeepLinkHistory(latestPairing.topic);
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
        // If the client initialization is broken, the init-method does not throw an error
        // We manually start the race with a timeout throwing an error
        this.client = await Promise.race([
            WalletConnectClient.init({
                projectId: process.env.WALLET_CONNECT_PROJECT_ID,
                metadata: this.selfMeta,
            }),
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject(CLIENT_TIMEOUT_MESSAGE);
                }, CONNECTION_TIMEOUT);
            }) as Promise<WalletConnectClient>,
        ]);
    }
}
