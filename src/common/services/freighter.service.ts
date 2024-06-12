import { isConnected, requestAccess, signTransaction } from '@stellar/freighter-api';
import * as StellarSdk from '@stellar/stellar-sdk';
import EventService from './event.service';

export enum FreighterEvents {
    login = 'login',
}
export default class FreighterServiceClass {
    event: EventService = new EventService();
    get isConnected(): Promise<boolean> {
        return isConnected();
    }

    async login() {
        const publicKey = await requestAccess();

        this.event.trigger({
            type: FreighterEvents.login,
            publicKey,
        });
    }

    async signTx(tx: StellarSdk.Transaction): Promise<StellarSdk.Transaction> {
        const signedXDR = await signTransaction(tx.toEnvelope().toXDR('base64'));

        return new StellarSdk.Transaction(signedXDR, StellarSdk.Networks.PUBLIC);
    }
}
