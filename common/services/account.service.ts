import AccountRecord, * as StellarSdk from 'stellar-sdk';
import { AccountResponse, Horizon } from 'stellar-sdk';
import { LoginTypes } from '../store/authStore/types';
import { StellarService, ToastService, WalletConnectService } from './globalServices';
import { AQUA_CODE, AQUA_ISSUER } from './stellar.service';
import { BuildSignAndSubmitStatuses } from './wallet-connect.service';

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
            window.open(
                `https://laboratory.stellar.org/#txsigner?xdr=${encodeURIComponent(
                    xdr,
                )}&network=public`,
                '_blank',
            );
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
        );

        if (!assetBalance) {
            return null;
        }

        return +assetBalance.balance;
    }

    async getAmmBalancesForAirdrop2(): Promise<{ AQUA: number; XLM: number; yXLM: number }> {
        const nativeAlias = 'native';
        const aquaAlias = 'AQUA:GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA';
        const yXlmAlias = 'yXLM:GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55';

        const liquidityPoolsBalances: Horizon.BalanceLineLiquidityPool[] = this.balances.filter(
            (balance) => balance.asset_type === 'liquidity_pool_shares',
        ) as Horizon.BalanceLineLiquidityPool[];

        const liquidityPoolsForAccount = await StellarService.getLiquidityPoolForAccount(
            this.accountId(),
            200,
        );

        return liquidityPoolsBalances.reduce(
            (acc, item) => {
                const pool = liquidityPoolsForAccount.find(
                    ({ id }) => id === item.liquidity_pool_id,
                );
                if (!pool) {
                    return acc;
                }
                const nativeReserve = pool.reserves.find(({ asset }) => asset === nativeAlias);

                if (nativeReserve) {
                    const balance =
                        (Number(item.balance) * Number(nativeReserve.amount)) /
                        Number(pool.total_shares);
                    acc.XLM += balance;
                }

                const yXlmReserve = pool.reserves.find(({ asset }) => asset === yXlmAlias);

                if (yXlmReserve) {
                    const balance =
                        (Number(item.balance) * Number(yXlmReserve.amount)) /
                        Number(pool.total_shares);
                    acc.yXLM += balance;
                }

                const aquaReserve = pool.reserves.find(({ asset }) => asset === aquaAlias);

                if (aquaReserve) {
                    const balance =
                        (Number(item.balance) * Number(aquaReserve.amount)) /
                        Number(pool.total_shares);
                    acc.AQUA += balance;
                }

                return acc;
            },
            { AQUA: 0, XLM: 0, yXLM: 0 },
        );
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
