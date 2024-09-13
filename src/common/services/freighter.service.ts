import { isConnected, signTransaction, requestAccess, isAllowed } from '@stellar/freighter-api';
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
        let publicKey = await requestAccess();
        const isAccessGranted = await isAllowed();

        // After idle timeout freighter don't return public key, we try again
        if (!publicKey && isAccessGranted) {
            publicKey = await requestAccess();
        }

        this.event.trigger({
            type: FreighterEvents.login,
            publicKey,
        });
    }

    async signTx(tx: StellarSdk.Transaction): Promise<StellarSdk.Transaction> {
        const signedXDR = await signTransaction(tx.toEnvelope().toXDR('base64'));

        return new StellarSdk.Transaction(signedXDR, StellarSdk.Networks.TESTNET);
    }
}
