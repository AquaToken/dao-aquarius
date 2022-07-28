import AccountRecord, * as StellarSdk from 'stellar-sdk';
import { AccountResponse, Horizon } from 'stellar-sdk';
import { LoginTypes } from '../store/authStore/types';
import { ModalService, StellarService, ToastService, WalletConnectService } from './globalServices';
import { AQUA_CODE, AQUA_ISSUER, ICE_ASSETS } from './stellar.service';
import { BuildSignAndSubmitStatuses } from './wallet-connect.service';
import SignWithPublic from '../modals/SignWithPublic';

export default class AccountService extends AccountResponse {
    authType?: LoginTypes;
    num_sponsoring: number;
    num_sponsored: number;

    constructor(account: typeof AccountRecord, authType: LoginTypes) {
        super(account);
        this.authType = authType;
    }

    signAndSubmitTx(
        tx: StellarSdk.Transaction,
        withResult?: boolean,
    ): Promise<Horizon.SubmitTransactionResponse | void | { status: BuildSignAndSubmitStatuses }> {
        if (this.authType === LoginTypes.public) {
            const xdr = tx.toEnvelope().toXDR('base64');
            ModalService.openModal(SignWithPublic, { xdr, account: this });
            return Promise.resolve({ status: BuildSignAndSubmitStatuses.pending });
        } else if (this.authType === LoginTypes.secret) {
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

    getAssetBalance(asset) {
        if (asset.isNative()) {
            const nativeBalance = this.balances.find(
                ({ asset_type }) => asset_type === 'native',
            ) as Horizon.BalanceLineNative;

            return +nativeBalance.balance;
        }
        const assetBalance = this.balances.find(
            (balance) =>
                (balance as Horizon.BalanceLineAsset).asset_code == asset.code &&
                (balance as Horizon.BalanceLineAsset).asset_issuer === asset.issuer,
        ) as Horizon.BalanceLineAsset;

        if (!assetBalance) {
            return null;
        }

        return Number(assetBalance.balance) - Number(assetBalance.selling_liabilities);
    }

    hasAllIceTrustlines() {
        return ICE_ASSETS.map((asset) => {
            const [code, issuer] = asset.split(':');
            const stellarAsset = StellarService.createAsset(code, issuer);
            return this.getAssetBalance(stellarAsset);
        }).every((asset) => asset !== null);
    }

    getUntrustedIceAssets() {
        return ICE_ASSETS.reduce((acc, asset) => {
            const [code, issuer] = asset.split(':');
            const stellarAsset = StellarService.createAsset(code, issuer);
            if (this.getAssetBalance(stellarAsset) === null) {
                acc.push(stellarAsset);
                return acc;
            }
            return acc;
        }, []);
    }

    async getAmmAquaBalance(): Promise<number> {
        const aquaAlias = 'AQUA:GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA';

        const liquidityPoolsBalances: Horizon.BalanceLineLiquidityPool[] = this.balances.filter(
            (balance) => balance.asset_type === 'liquidity_pool_shares',
        ) as Horizon.BalanceLineLiquidityPool[];

        const liquidityPoolsForAccount = await StellarService.getLiquidityPoolForAccount(
            this.accountId(),
            200,
        );

        return liquidityPoolsBalances.reduce((acc, item) => {
            const pool = liquidityPoolsForAccount.find(({ id }) => id === item.liquidity_pool_id);
            if (!pool) {
                return acc;
            }

            const aquaReserve = pool.reserves.find(({ asset }) => asset === aquaAlias);

            if (aquaReserve) {
                const balance =
                    (Number(item.balance) * Number(aquaReserve.amount)) / Number(pool.total_shares);
                acc += balance;
            }

            return acc;
        }, 0);
    }

    getAquaBalance(): number | null {
        const aquaBalance = this.balances.find(
            (balance) =>
                (balance as Horizon.BalanceLineAsset).asset_code == AQUA_CODE &&
                (balance as Horizon.BalanceLineAsset).asset_issuer === AQUA_ISSUER,
        ) as Horizon.BalanceLineAsset;

        if (!aquaBalance) {
            return null;
        }

        return Number(aquaBalance.balance) - Number(aquaBalance.selling_liabilities);
    }

    getAvailableNativeBalance(): number | null {
        const nativeBalance = this.balances.find(
            ({ asset_type }) => asset_type === 'native',
        ) as Horizon.BalanceLineNative;

        const reserve = (2 + this.subentry_count + this.num_sponsoring - this.num_sponsored) * 0.5;

        const available =
            Number(nativeBalance.balance) - reserve - Number(nativeBalance.selling_liabilities);

        return available > 0 ? available : 0;
    }
}
