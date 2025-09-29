import {
    AlbedoModule,
    FREIGHTER_ID,
    FreighterModule,
    HanaModule,
    HotWalletModule,
    RabetModule,
    StellarWalletsKit,
    WalletNetwork,
    xBullModule,
} from '@creit.tech/stellar-wallets-kit';
import { WatchWalletChanges } from '@stellar/freighter-api';
import * as StellarSdk from '@stellar/stellar-sdk';
import { TransactionBuilder } from '@stellar/stellar-sdk';

import { getNetworkPassphrase } from 'helpers/env';

import { AuthEvent, AuthPayload } from 'services/auth/events/events';
import { ModalService, ToastService } from 'services/globalServices';

import ChooseLoginMethodModal from 'modals/auth/ChooseLoginMethodModal';
import WalletKitModal from 'modals/WalletKitModal';

import EventService from '../../event.service';

export default class WalletKitServiceClass {
    private readonly event: EventService<AuthEvent, AuthPayload>;

    walletKit: StellarWalletsKit;
    watcher: WatchWalletChanges | null = null;

    constructor(event: EventService<AuthEvent, AuthPayload>) {
        this.event = event;

        this.walletKit = new StellarWalletsKit({
            network: getNetworkPassphrase() as unknown as WalletNetwork,
            modules: [
                new FreighterModule(),
                new HotWalletModule(),
                new xBullModule(),
                new AlbedoModule(),
                new HanaModule(),
                new RabetModule(),
            ],
            selectedWalletId: FREIGHTER_ID,
        });
    }

    startFreighterWatching(publicKey: string) {
        if (!this.watcher) {
            this.watcher = new WatchWalletChanges(1000);
        }
        this.watcher.watch(({ address }) => {
            if (publicKey === address || !address) {
                return;
            }
            this.event.trigger({
                type: AuthEvent.walletKitAccountChanged,
                publicKey: address,
            });
        });
    }

    stopFreighterWatching() {
        this.watcher?.stop();
        this.watcher = null;
    }

    showWalletKitModal() {
        ModalService.closeAllModals();
        ModalService.openModal(
            WalletKitModal,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            { modules: this.walletKit.modules },
            false,
            null,
            false,
            () => ModalService.openModal(ChooseLoginMethodModal),
        );
    }

    async login(id: string) {
        try {
            this.walletKit.setWallet(id);

            const { address } = await this.walletKit.getAddress();

            if (id === FREIGHTER_ID) {
                this.startFreighterWatching(address);
            }

            this.event.trigger({
                type: AuthEvent.walletKitLogin,
                publicKey: address,
                id,
            });
        } catch (e) {
            ToastService.showErrorToast(e.message);
        }
    }

    restoreLogin(id: string, publicKey: string) {
        this.walletKit.setWallet(id);

        if (id === FREIGHTER_ID) {
            this.startFreighterWatching(publicKey);
        }
    }

    async signTx(tx: StellarSdk.Transaction) {
        const xdr = tx.toEnvelope().toXDR('base64');
        const { signedTxXdr } = await this.walletKit.signTransaction(xdr);

        return TransactionBuilder.fromXDR(signedTxXdr, getNetworkPassphrase());
    }
}
