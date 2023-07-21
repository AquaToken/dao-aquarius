import AccountRecord, * as StellarSdk from 'stellar-sdk';
import { AccountResponse, Horizon } from 'stellar-sdk';
import * as SorobanClient from 'soroban-client';
import { LoginTypes } from '../../store/authStore/types';
import {
    LedgerService,
    ModalService,
    SorobanService,
    StellarService,
    ToastService,
    WalletConnectService,
} from './globalServices';
import { AQUA_CODE, AQUA_ISSUER, ICE_ASSETS } from './stellar.service';
import { BuildSignAndSubmitStatuses } from './wallet-connect.service';
import SignWithPublic from '../modals/SignWithPublic';
import LedgerSignTx from '../modals/LedgerModals/LedgerSignTx';
import SentToVault from '../modals/MultisigModals/SentToVault';

const VAULT_MARKER = 'GA2T6GR7VXXXBETTERSAFETHANSORRYXXXPROTECTEDBYLOBSTRVAULT';

export default class AccountService extends AccountResponse {
    authType?: LoginTypes;
    num_sponsoring: number;
    num_sponsored: number;

    constructor(account: typeof AccountRecord, authType: LoginTypes) {
        super(account);
        this.authType = authType;
    }

    get isMultisigEnabled() {
        return Boolean(this.signers.length > 1);
    }

    get isVaultEnabled() {
        if (this.signers.length === 1) {
            return false;
        }

        const vaultMarker = this.signers.find(({ key }) => key === VAULT_MARKER);

        return Boolean(vaultMarker);
    }

    async signAndSubmitTx(
        tx: StellarSdk.Transaction,
        withResult?: boolean,
    ): Promise<Horizon.SubmitTransactionResponse | void | { status: BuildSignAndSubmitStatuses }> {
        if (this.authType === LoginTypes.public) {
            const xdr = tx.toEnvelope().toXDR('base64');
            ModalService.openModal(SignWithPublic, { xdr, account: this });
            return Promise.resolve({ status: BuildSignAndSubmitStatuses.pending });
        }

        if (this.authType === LoginTypes.walletConnect && !withResult) {
            return WalletConnectService.signAndSubmitTx(tx);
        }

        let signedTx;

        if (this.authType === LoginTypes.secret) {
            signedTx = StellarService.signWithSecret(tx);
        }

        if (this.authType === LoginTypes.walletConnect && withResult) {
            const signedXDR = await WalletConnectService.signTx(tx);
            signedTx = new StellarSdk.Transaction(signedXDR, StellarSdk.Networks.PUBLIC);
        }

        if (this.authType === LoginTypes.ledger && !this.isMultisigEnabled) {
            const result = LedgerService.signTx(tx).then((signed) =>
                StellarService.submitTx(signed),
            );
            ModalService.openModal(LedgerSignTx, { result });
            return result;
        }

        if (this.authType === LoginTypes.ledger) {
            const signPromise = LedgerService.signTx(tx);
            ModalService.openModal(LedgerSignTx, { result: signPromise });
            signedTx = await signPromise;
        }

        if (
            !this.isMultisigEnabled ||
            !StellarService.isMoreSignaturesNeeded(signedTx, {
                signers: this.signers,
                thresholds: this.thresholds,
                account_id: this.account_id,
            })
        ) {
            if (this.authType === LoginTypes.ledger) {
                ModalService.closeAllModals();
            }
            return StellarService.submitTx(signedTx);
        }

        ModalService.closeAllModals();

        const xdr = tx.toEnvelope().toXDR('base64');

        if (!this.isVaultEnabled) {
            ModalService.openModal(SignWithPublic, { xdr, account: this });

            return Promise.resolve({ status: BuildSignAndSubmitStatuses.pending });
        }

        return StellarService.sendToVault(xdr)
            .then(() => {
                ModalService.openModal(SentToVault, {});
                return Promise.resolve({ status: BuildSignAndSubmitStatuses.pending });
            })
            .catch(() => {
                ModalService.openModal(SignWithPublic, { xdr, account: this });
                return Promise.resolve({ status: BuildSignAndSubmitStatuses.pending });
            });
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

    getPoolBalance(id: string) {
        const poolBalance = this.balances.find(
            (balance) => (balance as Horizon.BalanceLineLiquidityPool).liquidity_pool_id === id,
        ) as Horizon.BalanceLineLiquidityPool;

        if (!poolBalance) {
            return null;
        }

        return Number(poolBalance.balance);
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

        return Number(
            (Number(aquaBalance.balance) - Number(aquaBalance.selling_liabilities)).toFixed(7),
        );
    }

    getAquaInOffers(): number | null {
        const aquaBalance = this.balances.find(
            (balance) =>
                (balance as Horizon.BalanceLineAsset).asset_code == AQUA_CODE &&
                (balance as Horizon.BalanceLineAsset).asset_issuer === AQUA_ISSUER,
        ) as Horizon.BalanceLineAsset;

        if (!aquaBalance) {
            return null;
        }

        return Number(aquaBalance.selling_liabilities);
    }

    getAvailableNativeBalance(): number | null {
        const nativeBalance = this.balances.find(
            ({ asset_type }) => asset_type === 'native',
        ) as Horizon.BalanceLineNative;

        const reserve = (2 + this.subentry_count + this.num_sponsoring - this.num_sponsored) * 0.5;

        const available = Number(
            (
                Number(nativeBalance.balance) -
                reserve -
                Number(nativeBalance.selling_liabilities)
            ).toFixed(7),
        );

        return available > 0 ? available : 0;
    }

    getBalances() {
        return Promise.all(
            this.balances
                .filter(
                    ({ asset_type }) =>
                        asset_type !== 'liquidity_pool_shares' && asset_type !== 'native',
                )
                .map((balance) => {
                    const asset = SorobanService.getAsset(
                        (balance as Horizon.BalanceLineAsset).asset_code,
                        (balance as Horizon.BalanceLineAsset).asset_issuer,
                    );
                    return {
                        contractId: SorobanService.getAssetContractId(asset),
                        asset,
                        balance: balance.balance,
                    };
                })
                .map(async ({ contractId, asset, balance }) => {
                    return {
                        isDeployed: await SorobanService.checkContractDeployed(contractId),
                        contractId,
                        asset,
                        balance,
                    };
                }),
        ).then((balances) => {
            const nativeBalance = this.balances.find(
                ({ asset_type }) => asset_type === 'native',
            ).balance;
            const native = SorobanClient.Asset.native();
            const contractId = SorobanService.getAssetContractId(native);
            return [
                { asset: native, balance: nativeBalance, isDeployed: true, contractId },
                ...balances.sort((a, b) => +b.balance - +a.balance),
            ];
        });
    }

    async signContact(tx: SorobanClient.Transaction, isSimulate?: boolean): Promise<any> {
        if (this.authType === LoginTypes.walletConnect || this.authType === LoginTypes.ledger) {
            ToastService.showErrorToast('');
        }
        if (this.authType === LoginTypes.public) {
            const xdr = tx.toEnvelope().toXDR('base64');
            ModalService.openModal(SignWithPublic, { xdr, account: this });
            return Promise.resolve({ status: BuildSignAndSubmitStatuses.pending });
        }

        if (this.authType === LoginTypes.secret) {
            const signedTx = SorobanService.signWithSecret(tx);

            return isSimulate
                ? SorobanService.simulateTx(signedTx)
                : SorobanService.submitTx(signedTx);
        }
    }
}
