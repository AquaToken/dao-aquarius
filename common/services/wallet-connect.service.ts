import WalletConnectClient, { CLIENT_EVENTS } from '@walletconnect/client';
import { AppMetadata, PairingTypes, SessionTypes } from '@walletconnect/types';
import { ERROR } from '@walletconnect/utils';
import * as StellarSdk from 'stellar-sdk';
import QRModal from '../modals/WalletConnectModals/QRModal';
import PairingModal from '../modals/WalletConnectModals/PairingModal';
import SessionRequestModal from '../modals/WalletConnectModals/SessionRequestModal';
import EventService from './event.service';
import { ModalService, ToastService } from './globalServices';

const METADATA = {
    name: 'Aqua Vote',
    description: 'Aqua vote description',
    url: 'https://aqua-vote.com',
    icons: [
        'data:image/jpeg;base64,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',
    ],
};

const STELLAR_METHODS = {
    SIGN: 'stellar_signAndSubmitXDR',
};
const PUBNET = 'stellar:pubnet';

export enum WalletConnectEvents {
    login = 'login',
    logout = 'logout',
}

export default class WalletConnectServiceClass {
    appMeta: AppMetadata | null = null;
    client: WalletConnectClient | null = null;
    session: SessionTypes.Settled | null = null;
    isPairCreated = false;
    event: EventService = new EventService();

    async initWalletConnect(): Promise<boolean> {
        if (this.client) {
            return false;
        }
        this.client = await WalletConnectClient.init({
            // logger: 'debug',
            relayProvider: 'wss://relay.walletconnect.org',
        });

        // there is a problem with updating the states in wallet connect, a small timeout solves this problem
        // TODO delete this when it is fixed in the library
        await new Promise((resolve) => {
            setTimeout(() => resolve(void 0), 500);
        });

        this.listenWalletConnectEvents();

        if (!this.client.session.topics.length) {
            return false;
        }

        this.session = await this.client.session.get(this.client.session.topics[0]);

        const [_chain, _reference, publicKey] = this.session.state.accounts[0].split(':');
        this.appMeta = this.session.peer.metadata;

        this.event.trigger({
            type: WalletConnectEvents.login,
            publicKey,
            metadata: this.appMeta,
        });

        ModalService.closeAllModals();

        return true;
    }

    listenWalletConnectEvents(): void {
        this.client.on(CLIENT_EVENTS.pairing.created, (res) => this.onPairCreated(res));

        this.client.on(CLIENT_EVENTS.pairing.updated, (res) => this.onPairUpdated(res));

        this.client.on(CLIENT_EVENTS.session.deleted, (session) => this.onSessionDeleted(session));

        this.client.on(CLIENT_EVENTS.pairing.proposal, (proposal) => this.onPairProposal(proposal));
    }

    onPairCreated(res: PairingTypes.Settled): void {
        this.appMeta = res.state.metadata;
        this.isPairCreated = true;
    }

    onPairUpdated(res: PairingTypes.Settled): void {
        this.appMeta = res.state.metadata;

        if (this.isPairCreated) {
            this.isPairCreated = false;

            ModalService.confirmAllModals();

            ModalService.openModal(SessionRequestModal, {
                name: this.appMeta.name,
                icon: this.appMeta.icons[0],
            });
        }
    }

    onSessionDeleted(session: SessionTypes.Settled): void {
        if (this.session && this.session.topic === session.topic) {
            this.session = null;
            this.appMeta = null;

            this.event.trigger({ type: WalletConnectEvents.logout });
        }
    }

    async onPairProposal(proposal: PairingTypes.Proposal): Promise<void> {
        const { uri } = proposal.signal.params;

        const { isConfirmed } = await ModalService.openModal(QRModal, { uri });

        if (!isConfirmed) {
            await this.client.pairing.pending.update(proposal.topic, {
                outcome: {
                    reason: ERROR.UNKNOWN.format(),
                },
                status: 'responded',
            });
            await this.client.crypto.keychain.del(proposal.proposer.publicKey);
        }
    }

    async login(): Promise<void> {
        const isLogged = await this.initWalletConnect();

        if (isLogged) {
            return;
        }

        // ModalService.closeAllModals();

        if (this.client.pairing.topics.length > 3) {
            const deletePromises = [];
            this.client.pairing.topics.slice(0, -3).forEach((topic) => {
                deletePromises.push(
                    this.client.pairing.delete({ topic, reason: ERROR.DELETED.format() }),
                );
            });

            await Promise.all(deletePromises);
        }

        if (this.client.pairing.topics.length) {
            ModalService.closeAllModals();
            ModalService.openModal(PairingModal, {
                pairings: this.client.pairing.values.reverse(),
                connect: this.connect.bind(this),
                deletePairing: this.deletePairing.bind(this),
            });
            return;
        }

        await this.connect();
    }

    async deletePairing(topic: string): Promise<void> {
        await this.client.pairing.delete({ topic, reason: ERROR.DELETED.format() });
    }

    async connect(pairing?: PairingTypes.Settled): Promise<void> {
        ModalService.closeAllModals();

        if (pairing) {
            ModalService.openModal(SessionRequestModal, {
                name: pairing.state.metadata.name,
                icon: pairing.state.metadata.icons[0],
            });
        }

        try {
            this.session = await this.client.connect({
                metadata: METADATA,
                pairing: pairing ? { topic: pairing.topic } : undefined,
                permissions: {
                    blockchain: {
                        chains: [PUBNET],
                    },
                    jsonrpc: {
                        methods: Object.values(STELLAR_METHODS),
                    },
                },
            });
        } catch (e) {
            if (this.session) {
                return;
            }
            this.appMeta = null;

            if (e.message === ERROR.UNKNOWN.stringify()) {
                return;
            }
            const errorMessage =
                e.message === 'Session not approved'
                    ? 'Connection canceled by the user'
                    : e.message;

            ToastService.showErrorToast(errorMessage);

            console.log(errorMessage);

            ModalService.closeAllModals();
            return;
        }

        ModalService.closeAllModals();

        this.appMeta = this.session.peer.metadata;

        const [chain, reference, publicKey] = this.session.state.accounts[0].split(':');

        this.event.trigger({
            type: WalletConnectEvents.login,
            publicKey,
            metadata: this.appMeta,
        });

        if (pairing) {
            await this.client.pairing.settled.update(pairing.topic, {
                state: { metadata: this.appMeta },
            });
        }
    }

    async logout(): Promise<void> {
        if (this.session) {
            await this.client.disconnect({
                topic: this.session.topic,
                reason: ERROR.USER_DISCONNECTED.format(),
            });
        }
    }

    signTx(tx: StellarSdk.Transaction): void {
        const xdr = tx.toEnvelope().toXDR('base64');

        // this.driver.modal.handlers.activate('WalletConnectRequestModal', {
        //     title: this.appMeta.name,
        //     logo: this.appMeta.icons[0],
        //     result: this.client
        //         .request({
        //             topic: this.session.topic,
        //             chainId: PUBNET,
        //             request: {
        //                 jsonrpc: '2.0',
        //                 method: STELLAR_METHODS.SIGN,
        //                 params: {
        //                     xdr,
        //                 },
        //             },
        //         })
        //         .then((result) => {
        //             return result;
        //         }),
        // });
    }
}
