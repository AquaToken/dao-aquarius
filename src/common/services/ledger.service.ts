import LedgerTransport from '@ledgerhq/hw-transport-webusb';
import LedgerStr from '@ledgerhq/hw-app-str';
import Str from '@ledgerhq/hw-app-str';
import * as StellarSdk from 'stellar-sdk';
import { ModalService } from './globalServices';
import EventService from './event.service';
import LedgerError from '../modals/LedgerModals/LedgerError';

const LEDGER_DEFAULT_ACCOUNT = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';
export const LEDGER_CANCEL_ERROR = 'Transaction approval request was rejected';

export enum LedgerEvents {
    login = 'login',
    logout = 'logout',
}

export default class LedgerServiceClass {
    api: null | Str = null;
    bipSlot: number | null = null;
    bipPath: null | string;
    event: EventService = new EventService();
    accountId: string = '';

    constructor() {}

    get isSupported(): Promise<boolean> {
        return LedgerTransport.isSupported();
    }

    async login(bipPath: number) {
        try {
            const transport = await LedgerTransport.create();
            this.api = new LedgerStr(transport);

            await this.api.getAppConfiguration();

            const path = `44'/148'/${bipPath}'`;
            const { publicKey } = await this.api.getPublicKey(path);

            if (!publicKey || publicKey === LEDGER_DEFAULT_ACCOUNT) {
                throw new Error();
            }

            this.bipSlot = bipPath;
            this.bipPath = path;
            this.accountId = publicKey;
            this.event.trigger({
                type: LedgerEvents.login,
                publicKey,
            });
        } catch (e) {
            ModalService.openModal(LedgerError, {});
        }
    }

    async signTx(tx: StellarSdk.Transaction) {
        await this.login(this.bipSlot);

        const { signature } = await this.api.signTransaction(this.bipPath, tx.signatureBase());

        const keypair = StellarSdk.Keypair.fromPublicKey(this.accountId);
        const hint = keypair.signatureHint();

        const decorated = new StellarSdk.xdr.DecoratedSignature({ hint, signature });

        tx.signatures.push(decorated);

        return tx;
    }
}
