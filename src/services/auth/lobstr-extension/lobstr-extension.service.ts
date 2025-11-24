import { isConnected, getPublicKey, signTransaction } from '@lobstrco/signer-extension-api';
import * as StellarSdk from '@stellar/stellar-sdk';

import { LOBSTR_CONNECTION_KEY } from 'constants/session-storage';

import { getNetworkPassphrase } from 'helpers/env';

import { getSavedAuthData } from 'store/authStore/auth-helpers';

import { AuthEvent, AuthPayload } from 'services/auth/events/events';

import EventService from '../../event.service';

export default class LobstrExtensionServiceClass {
    private readonly event: EventService<AuthEvent, AuthPayload>;

    constructor(event: EventService<AuthEvent, AuthPayload>) {
        this.event = event;
    }

    get isConnected(): Promise<boolean> {
        return isConnected();
    }

    async login() {
        const publicKey = await getPublicKey();

        this.event.trigger({
            type: AuthEvent.lobstrExtensionLogin,
            publicKey,
        });
    }

    async signTx(tx: StellarSdk.Transaction): Promise<StellarSdk.Transaction> {
        if (!sessionStorage.getItem(LOBSTR_CONNECTION_KEY)) {
            const { lobstrConnectionKey } = getSavedAuthData();
            sessionStorage.setItem(LOBSTR_CONNECTION_KEY, lobstrConnectionKey);
        }

        const signedXDR = await signTransaction(tx.toEnvelope().toXDR('base64'));

        return new StellarSdk.Transaction(signedXDR, getNetworkPassphrase());
    }
}
