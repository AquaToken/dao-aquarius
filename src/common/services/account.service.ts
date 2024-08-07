import AccountRecord, * as StellarSdk from '@stellar/stellar-sdk';
import { Asset, Horizon } from '@stellar/stellar-sdk';
import { LoginTypes } from '../../store/authStore/types';
import {
    FreighterService,
    LedgerService,
    LobstrExtensionService,
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
import { getNativePrices } from '../../pages/amm/api/api';
import { getAssetString } from '../helpers/helpers';
import BigNumber from 'bignumber.js';

const VAULT_MARKER = 'GA2T6GR7VXXXBETTERSAFETHANSORRYXXXPROTECTEDBYLOBSTRVAULT';

export default class AccountService extends Horizon.AccountResponse {
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

    async signAndSubmitTx(tx: StellarSdk.Transaction, withResult?: boolean): Promise<any> {
        if (this.authType === LoginTypes.public) {
            const xdr = tx.toEnvelope().toXDR('base64');
            ModalService.openModal(SignWithPublic, { xdr, account: this });
            return Promise.resolve({ status: BuildSignAndSubmitStatuses.pending });
        }

        if (this.authType === LoginTypes.walletConnect && !withResult) {
            return WalletConnectService.signAndSubmitTx(tx as StellarSdk.Transaction);
        }

        let signedTx;

        if (this.authType === LoginTypes.secret) {
            signedTx = SorobanService.signWithSecret(tx);
        }

        if (this.authType === LoginTypes.freighter) {
            signedTx = await FreighterService.signTx(tx);
        }

        if (this.authType === LoginTypes.lobstr) {
            signedTx = await LobstrExtensionService.signTx(tx);
        }

        if (this.authType === LoginTypes.walletConnect && withResult) {
            const signedXDR = await WalletConnectService.signTx(tx as StellarSdk.Transaction);
            signedTx = new StellarSdk.Transaction(signedXDR, StellarSdk.Networks.PUBLIC);
        }

        if (this.authType === LoginTypes.ledger && !this.isMultisigEnabled) {
            const result = LedgerService.signTx(tx as StellarSdk.Transaction).then((signed) =>
                withResult ? SorobanService.submitTx(signed) : StellarService.submitTx(signed),
            );
            ModalService.openModal(LedgerSignTx, { result });
            return result;
        }

        if (this.authType === LoginTypes.ledger) {
            const signPromise = LedgerService.signTx(tx as StellarSdk.Transaction);
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
            return withResult
                ? SorobanService.submitTx(signedTx)
                : StellarService.submitTx(signedTx);
        }

        ModalService.closeAllModals();

        const xdr = signedTx.toEnvelope().toXDR('base64');

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

    getAssetBalance(asset: Asset): number | null {
        if (asset.isNative()) {
            const nativeBalance = this.balances.find(
                ({ asset_type }) => asset_type === 'native',
            ) as Horizon.HorizonApi.BalanceLineNative;

            return new BigNumber(nativeBalance.balance)
                .minus(nativeBalance.selling_liabilities)
                .toNumber();
        }
        const assetBalance = this.balances.find(
            (balance) =>
                (balance as Horizon.HorizonApi.BalanceLineAsset).asset_code == asset.code &&
                (balance as Horizon.HorizonApi.BalanceLineAsset).asset_issuer === asset.issuer,
        ) as Horizon.HorizonApi.BalanceLineAsset;

        if (!assetBalance) {
            return null;
        }

        return new BigNumber(assetBalance.balance)
            .minus(assetBalance.selling_liabilities)
            .toNumber();
    }

    getPoolBalance(id: string) {
        const poolBalance = this.balances.find(
            (balance) =>
                (balance as Horizon.HorizonApi.BalanceLineLiquidityPool).liquidity_pool_id === id,
        ) as Horizon.HorizonApi.BalanceLineLiquidityPool;

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

        const liquidityPoolsBalances: Horizon.HorizonApi.BalanceLineLiquidityPool[] =
            this.balances.filter(
                (balance) => balance.asset_type === 'liquidity_pool_shares',
            ) as Horizon.HorizonApi.BalanceLineLiquidityPool[];

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
                (balance as Horizon.HorizonApi.BalanceLineAsset).asset_code == AQUA_CODE &&
                (balance as Horizon.HorizonApi.BalanceLineAsset).asset_issuer === AQUA_ISSUER,
        ) as Horizon.HorizonApi.BalanceLineAsset;

        if (!aquaBalance) {
            return null;
        }

        return new BigNumber(aquaBalance.balance).minus(aquaBalance.selling_liabilities).toNumber();
    }

    getAquaInOffers(): number | null {
        const aquaBalance = this.balances.find(
            (balance) =>
                (balance as Horizon.HorizonApi.BalanceLineAsset).asset_code == AQUA_CODE &&
                (balance as Horizon.HorizonApi.BalanceLineAsset).asset_issuer === AQUA_ISSUER,
        ) as Horizon.HorizonApi.BalanceLineAsset;

        if (!aquaBalance) {
            return null;
        }

        return Number(aquaBalance.selling_liabilities);
    }

    getAvailableNativeBalance(): number | null {
        const nativeBalance = this.balances.find(
            ({ asset_type }) => asset_type === 'native',
        ) as Horizon.HorizonApi.BalanceLineNative;

        const reserve = (2 + this.subentry_count + this.num_sponsoring - this.num_sponsored) * 0.5;

        const available = new BigNumber(nativeBalance.balance)
            .minus(new BigNumber(reserve))
            .minus(new BigNumber(nativeBalance.selling_liabilities))
            .toNumber();

        return available > 0 ? available : 0;
    }

    async getSortedBalances() {
        const assetsBalances = this.balances.filter(
            (asset): asset is Horizon.HorizonApi.BalanceLineAsset =>
                asset.asset_type !== 'liquidity_pool_shares' && asset.asset_type !== 'native',
        );
        const nativeBalanceInstance = this.balances.find(
            ({ asset_type }) => asset_type === 'native',
        );
        const nativePrices = await getNativePrices(
            assetsBalances.map(({ asset_code, asset_issuer }) =>
                StellarService.createAsset(asset_code, asset_issuer),
            ),
        );

        const balances = assetsBalances
            .map((balance) => {
                const asset = StellarService.createAsset(balance.asset_code, balance.asset_issuer);
                const assetString = getAssetString(asset);

                return {
                    ...balance,
                    nativeBalance: nativePrices.has(assetString)
                        ? +balance.balance * +nativePrices.get(assetString)
                        : 0,
                    code: balance.asset_code,
                    issuer: balance.asset_issuer,
                    asset: StellarService.createAsset(balance.asset_code, balance.asset_issuer),
                };
            })
            .sort(
                (a, b) =>
                    b.nativeBalance - a.nativeBalance ||
                    +b.balance - +a.balance ||
                    a.asset_code.localeCompare(b.asset_code),
            );

        return [
            {
                ...nativeBalanceInstance,
                nativeBalance: +nativeBalanceInstance.balance,
                code: 'XLM',
                issuer: undefined,
                asset: StellarService.createLumen(),
            },
            ...balances,
        ];
    }

    getAvailableForSwapBalance(asset: Asset) {
        const FEE_RESERVE = 2; // reserve for fee
        if (asset.isNative()) {
            const available = this.getAvailableNativeBalance();

            return Math.max(available - FEE_RESERVE, 0);
        }

        return this.getAssetBalance(asset);
    }

    getReservesForSwap(asset: Asset): { label: string; value: number }[] {
        if (!asset.isNative()) {
            const { selling_liabilities } = this.balances.find(
                (balance) =>
                    (balance as Horizon.HorizonApi.BalanceLineAsset).asset_code == asset.code &&
                    (balance as Horizon.HorizonApi.BalanceLineAsset).asset_issuer === asset.issuer,
            ) as Horizon.HorizonApi.BalanceLineAsset;

            return [
                {
                    label: `${asset.code} in active offers`,
                    value: Number(selling_liabilities),
                },
            ];
        }

        const { selling_liabilities } = this.balances.find(
            ({ asset_type }) => asset_type === 'native',
        ) as Horizon.HorizonApi.BalanceLineNative;

        const { entriesTrustlines, entriesLiquidityTrustlines } = this.balances.reduce(
            (acc, balance) => {
                if (
                    balance.asset_type === 'credit_alphanum4' ||
                    balance.asset_type === 'credit_alphanum12'
                ) {
                    acc.entriesTrustlines += 1;
                    return acc;
                } else if (balance.asset_type === 'liquidity_pool_shares') {
                    acc.entriesLiquidityTrustlines += 1;
                    return acc;
                }
                return acc;
            },
            {
                entriesTrustlines: 0,
                entriesLiquidityTrustlines: 0,
            },
        );

        const entriesOffers = Object.keys(this.offers).length;
        const entriesSigners = this.signers.length - 1;
        const entriesOthers =
            this.subentry_count -
            entriesTrustlines -
            entriesLiquidityTrustlines * 2 -
            entriesOffers -
            entriesSigners;
        const numSponsoring = this.num_sponsoring;
        const numSponsored = this.num_sponsored;

        const items = [
            { label: 'Base reserve', value: 1 },
            { label: 'Fee reserve', value: 2 },
            { label: 'XLM in active offers', value: Number(selling_liabilities) },
            { label: 'Trustlines', value: entriesTrustlines * 0.5 },
            { label: 'Liquidity pool trustlines', value: entriesLiquidityTrustlines },
            { label: 'Offers', value: entriesOffers * 0.5 },
            { label: 'Signers', value: entriesSigners * 0.5 },
            { label: 'Account data', value: entriesOthers * 0.5 },
            { label: 'Sponsoring entries for others', value: numSponsoring * 0.5 },
            { label: 'Entries sponsored for account', value: -numSponsored * 0.5 },
        ];

        return [
            ...items,
            { label: 'Total', value: items.reduce((acc, item) => acc + item.value, 0) },
        ];
    }

    async signContact(tx: StellarSdk.Transaction, isSimulate?: boolean): Promise<any> {
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
