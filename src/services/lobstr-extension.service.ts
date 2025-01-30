import { isConnected, getPublicKey, signTransaction } from '@lobstrco/signer-extension-api';
import * as StellarSdk from '@stellar/stellar-sdk';

import { getNetworkPassphrase } from 'helpers/env';

import EventService from './event.service';

export enum LobstrExtensionEvents {
    login = 'login',
}

type LobstrExtensionPayload = {
    publicKey: string;
};
export default class LobstrExtensionServiceClass {
    event: EventService<LobstrExtensionEvents, LobstrExtensionPayload> = new EventService();
    get isConnected(): Promise<boolean> {
        return isConnected();
    }

    async login() {
        const publicKey = await getPublicKey();

        this.event.trigger({
            type: LobstrExtensionEvents.login,
            publicKey,
        });
    }

    async signTx(tx: StellarSdk.Transaction): Promise<StellarSdk.Transaction> {
        const signedXDR = await signTransaction(tx.toEnvelope().toXDR('base64'));

        return new StellarSdk.Transaction(signedXDR, getNetworkPassphrase());
    }
}
