import AccountRecord, * as StellarSdk from 'stellar-sdk';
import { AccountResponse, Horizon } from 'stellar-sdk';
import { LoginTypes } from '../store/authStore/types';
import { StellarService, WalletConnectService } from './globalServices';

const AQUA_CODE = 'AQUA';
const AQUA_ISSUER = 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA';

export default class AccountService extends AccountResponse {
    authType?: LoginTypes;

    constructor(account: typeof AccountRecord, authType?: LoginTypes) {
        super(account);
        if (authType) {
            this.authType = authType;
        }
    }

    signAndSubmitTx(tx: StellarSdk.Transaction) {
        if (this.authType === LoginTypes.secret) {
            const signed = StellarService.signWithSecret(tx);
            console.log(signed);
        } else if (this.authType === LoginTypes.walletConnect) {
            WalletConnectService.signTx(tx);
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
