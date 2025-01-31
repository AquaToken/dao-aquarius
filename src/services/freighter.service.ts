import {
    isConnected,
    signTransaction,
    requestAccess,
    isAllowed,
    WatchWalletChanges,
} from '@stellar/freighter-api';
import * as StellarSdk from '@stellar/stellar-sdk';

import { getNetworkPassphrase } from 'helpers/env';

import EventService from './event.service';

export enum FreighterEvents {
    login = 'login',
    accountChanged = 'accountChanged',
}

type FreighterPayload = {
    publicKey: string;
};

export default class FreighterServiceClass {
    event: EventService<FreighterEvents, FreighterPayload> = new EventService();
    watcher: WatchWalletChanges | null = null;
    get isConnected(): Promise<boolean> {
        return isConnected()
            .then(({ isConnected }) => isConnected)
            .catch(() => false);
    }

    async login() {
        let publicKey = (await requestAccess()).address;
        const isAccessGranted = await isAllowed();

        // After idle timeout freighter don't return public key, we try again
        if (!publicKey && isAccessGranted) {
            publicKey = (await requestAccess()).address;
        }

        this.event.trigger({
            type: FreighterEvents.login,
            publicKey,
        });

        this.startWatching(publicKey);
    }

    startWatching(publicKey: string) {
        if (!this.watcher) {
            this.watcher = new WatchWalletChanges(1000);
        }
        this.watcher.watch(({ address }) => {
            if (publicKey === address) {
                return;
            }
            this.event.trigger({
                type: FreighterEvents.accountChanged,
                publicKey: address,
            });
        });
    }

    stopWatching() {
        this.watcher?.stop();
        this.watcher = null;
    }

    async signTx(tx: StellarSdk.Transaction): Promise<StellarSdk.Transaction> {
        const { signedTxXdr, error } = await signTransaction(tx.toEnvelope().toXDR('base64'), {
            networkPassphrase: getNetworkPassphrase(),
        });

        if (error) {
            throw error;
        }

        return new StellarSdk.Transaction(signedTxXdr, getNetworkPassphrase());
    }
}
