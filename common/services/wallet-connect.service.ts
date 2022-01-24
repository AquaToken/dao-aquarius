import WalletConnectClient, { CLIENT_EVENTS } from '@walletconnect/client';
import { AppMetadata, PairingTypes, SessionTypes } from '@walletconnect/types';
import { ERROR } from '@walletconnect/utils';
import * as StellarSdk from 'stellar-sdk';
import QRModal from '@walletconnect/legacy-modal';
import PairingModal from '../modals/WalletConnectModals/PairingModal';
import SessionRequestModal from '../modals/WalletConnectModals/SessionRequestModal';
import EventService from './event.service';
import { ModalService, ToastService } from './globalServices';
import RequestModal from '../modals/WalletConnectModals/RequestModal';

const METADATA = {
    vote: {
        name: 'Aquarius Voting Tool',
        description:
            'Lock your AQUA to create immutable and transparent votes direct on the Stellar blockchain',
        url: 'https://vote.aqua.network',
        icons: [`${location.origin}/favicon.png`],
    },
    governance: {
        name: 'Aquarius Governance',
        description:
            'Aquarius protocol is governed by DAO voting with AQUA tokens. Vote and participate in discussions to shape the future of Aquarius.',
        url: 'https://gov.aqua.network',
        icons: [`${location.origin}/favicon.png`],
    },
    lock: {
        name: 'Aquarius Locker',
        description: 'Lock your AQUA token to get bonuses',
        url: 'https://locker.aqua.network',
        icons: [`${location.origin}/favicon.png`],
    },
};

const STELLAR_METHODS = {
    SIGN_AND_SUBMIT: 'stellar_signAndSubmitXDR',
    SIGN: 'stellar_signXDR',
};
const PUBNET = 'stellar:pubnet';

export enum WalletConnectEvents {
    login = 'login',
    logout = 'logout',
}

export enum BuildSignAndSubmitStatuses {
    success = 'success',
    pending = 'pending',
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
            relayUrl: 'wss://relay.walletconnect.org',
            projectId: 'f5279d443cff4b7901250e5b2e0e84f4',
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
            QRModal.close();

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

        QRModal.open(uri, async () => {
            await this.client.pairing.pending.update(proposal.topic, {
                outcome: {
                    reason: ERROR.UNKNOWN.format(),
                },
                status: 'responded',
            });
            await this.client.crypto.keychain.del(proposal.proposer.publicKey);
        });
    }

    async login(): Promise<void> {
        const isLogged = await this.initWalletConnect();

        if (isLogged) {
            return;
        }

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
                metadata: METADATA[process.env.PROJECT],
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

    signAndSubmitTx(tx: StellarSdk.Transaction): Promise<void> {
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
}
