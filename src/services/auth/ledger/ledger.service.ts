import LedgerStr from '@ledgerhq/hw-app-str';
import LedgerTransport from '@ledgerhq/hw-transport-webusb';
import * as StellarSdk from '@stellar/stellar-sdk';

import { LEDGER_DEFAULT_ACCOUNT } from 'constants/ledger';

import { AuthEvent, AuthPayload } from 'services/auth/events/events';
import EventService from 'services/event.service';
import { ModalService } from 'services/globalServices';

import LedgerError from 'modals/ledger/LedgerError';

export default class LedgerServiceClass {
    private readonly event: EventService<AuthEvent, AuthPayload>;
    api: null | LedgerStr = null;
    bipSlot: number | null = null;
    bipPath: null | string;
    accountId: string = '';

    constructor(event: EventService<AuthEvent, AuthPayload>) {
        this.event = event;
    }

    get isSupported(): Promise<boolean> {
        return LedgerTransport.isSupported();
    }

    async login(bipPath: number) {
        try {
            const transport = await LedgerTransport.create();
            this.api = new LedgerStr(transport);

            await this.api.getAppConfiguration();

            const path = `44'/148'/${bipPath}'`;
            const { rawPublicKey } = await this.api.getPublicKey(path);
            const publicKey = StellarSdk.StrKey.encodeEd25519PublicKey(rawPublicKey);

            if (!publicKey || publicKey === LEDGER_DEFAULT_ACCOUNT) {
                throw new Error();
            }

            this.bipSlot = bipPath;
            this.bipPath = path;
            this.accountId = publicKey;
            this.event.trigger({
                type: AuthEvent.ledgerLogin,
                publicKey,
                bipPath,
            });
        } catch {
            ModalService.openModal(LedgerError, {});
        }
    }

    async reLogin(bipPath: number, pubKey: string) {
        try {
            const transport = await LedgerTransport.create();
            this.api = new LedgerStr(transport);

            await this.api.getAppConfiguration();

            const path = `44'/148'/${bipPath}'`;

            this.bipSlot = bipPath;
            this.bipPath = path;
            this.accountId = pubKey;
            this.event.trigger({
                type: AuthEvent.ledgerLogout,
                publicKey: pubKey,
                bipPath,
            });
        } catch {
            ModalService.openModal(LedgerError, {});
        }
    }

    async signTx(tx: StellarSdk.Transaction) {
        await this.login(this.bipSlot);

        const isSoroban = tx.operations.some(
            op =>
                op.type === 'invokeHostFunction' ||
                op.type === 'restoreFootprint' ||
                op.type === 'extendFootprintTtl',
        );

        try {
            const { signature } = isSoroban
                ? await this.api.signHash(this.bipPath, tx.hash())
                : await this.api.signTransaction(this.bipPath, tx.signatureBase());

            const keypair = StellarSdk.Keypair.fromPublicKey(this.accountId);
            const hint = keypair.signatureHint();

            const decorated = new StellarSdk.xdr.DecoratedSignature({ hint, signature });

            tx.signatures.push(decorated);

            return tx;
        } catch (e) {
            throw e.message;
        }
    }
}
