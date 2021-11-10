import AccountRecord, * as StellarSdk from 'stellar-sdk';
import { AccountResponse, Horizon } from 'stellar-sdk';
import { LoginTypes } from '../store/authStore/types';
import { StellarService, ToastService, WalletConnectService } from './globalServices';
import { AQUA_CODE, AQUA_ISSUER } from './stellar.service';
import { BuildSignAndSubmitStatuses } from './wallet-connect.service';

export default class AccountService extends AccountResponse {
    authType?: LoginTypes;

    constructor(account: typeof AccountRecord, authType: LoginTypes) {
        super(account);
        this.authType = authType;
    }

    signAndSubmitTx(
        tx: StellarSdk.Transaction,
        withResult?: boolean,
    ): Promise<Horizon.SubmitTransactionResponse | void | { status: BuildSignAndSubmitStatuses }> {
        if (this.authType === LoginTypes.secret) {
            return StellarService.signAndSubmit(tx, {
                signers: this.signers,
                thresholds: this.thresholds,
                account_id: this.account_id,
            });
        } else if (this.authType === LoginTypes.walletConnect && !withResult) {
            return WalletConnectService.signAndSubmitTx(tx);
        } else if (this.authType === LoginTypes.walletConnect && withResult) {
            return WalletConnectService.signTx(tx).then((xdr) => {
                const tx = new StellarSdk.Transaction(xdr, StellarSdk.Networks.PUBLIC);
                if (
                    StellarService.isMoreSignaturesNeeded(tx, {
                        signers: this.signers,
                        thresholds: this.thresholds,
                        account_id: this.account_id,
                    })
                ) {
                    ToastService.showErrorToast('Accounts with multisig are not supported yet');
                    return Promise.reject();
                }
                return StellarService.submitXDR(xdr);
            });
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
