import AccountRecord, * as StellarSdk from 'stellar-sdk';
import { AccountResponse, Horizon } from 'stellar-sdk';
import { LoginTypes } from '../store/authStore/types';
import { StellarService, ToastService, WalletConnectService } from './globalServices';
import { AQUA_CODE, AQUA_ISSUER } from './stellar.service';

export default class AccountService extends AccountResponse {
    authType?: LoginTypes;

    constructor(account: typeof AccountRecord, authType?: LoginTypes) {
        super(account);
        if (authType) {
            this.authType = authType;
        }
    }

    async signAndSubmitTx(tx: StellarSdk.Transaction): Promise<void> {
        if (this.authType === LoginTypes.secret && this.signers.length > 1) {
            ToastService.showErrorToast('Accounts with multisig are not supported yet');
            return Promise.resolve();
        }

        if (this.authType === LoginTypes.secret) {
            await StellarService.signAndSubmit(tx);
        } else if (this.authType === LoginTypes.walletConnect) {
            WalletConnectService.signTx(tx);
            return Promise.resolve();
        }
    }

    getAquaBalance(): number | null {
        const aquaBalance = this.balances.find(
            (balance) =>
                (balance as Horizon.BalanceLineAsset).asset_code == AQUA_CODE &&
                (balance as Horizon.BalanceLineAsset).asset_issuer === AQUA_ISSUER,
        );

        if (!aquaBalance) {
            return null;
        }

        return +aquaBalance.balance;
    }
}
