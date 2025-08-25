import AccountRecord, * as StellarSdk from '@stellar/stellar-sdk';
import { Horizon } from '@stellar/stellar-sdk';
import BigNumber from 'bignumber.js';

import { getNativePrices } from 'api/amm';

import { POOL_TYPE } from 'constants/amm';
import { ASSETS_ENV_DATA, DEFAULT_ICE_ASSETS } from 'constants/assets';

import { getAssetFromString } from 'helpers/assets';
import { getEnv, getNetworkPassphrase } from 'helpers/env';

import { LoginTypes } from 'store/authStore/types';

import { PoolClassicProcessed } from 'types/amm';
import { ClassicToken, SorobanToken, Token, TokenType } from 'types/token';

import LedgerSignTx from 'web/modals/ledger/LedgerSignTx';
import SentToVault from 'web/modals/SentToVault';
import SignWithPublic from 'web/modals/SignWithPublic';

import {
    LedgerService,
    LobstrExtensionService,
    ModalService,
    SorobanService,
    StellarService,
    WalletConnectService,
    WalletKitService,
} from './globalServices';
import { BuildSignAndSubmitStatuses } from './wallet-connect.service';

const VAULT_MARKER = 'GA2T6GR7VXXXBETTERSAFETHANSORRYXXXPROTECTEDBYLOBSTRVAULT';
const { aquaCode, aquaIssuer } = ASSETS_ENV_DATA[getEnv()].aqua;

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

    signTx(tx: StellarSdk.Transaction): Promise<string> {
        if (this.authType === LoginTypes.public || this.isMultisigEnabled) {
            const xdr = tx.toEnvelope().toXDR('base64');

            return ModalService.openModal(SignWithPublic, {
                xdr,
                account: this,
                onlySign: true,
            }).then(({ xdr }) => xdr);
        }

        if (this.authType === LoginTypes.walletConnect) {
            return WalletConnectService.signTx(tx as StellarSdk.Transaction);
        }

        if (this.authType === LoginTypes.secret) {
            return Promise.resolve(
                SorobanService.connection.signWithSecret(tx).toEnvelope().toXDR('base64'),
            );
        }

        if (this.authType === LoginTypes.lobstr) {
            return LobstrExtensionService.signTx(tx).then(res => res.toEnvelope().toXDR('base64'));
        }

        if (this.authType === LoginTypes.ledger) {
            return LedgerService.signTx(tx as StellarSdk.Transaction).then(res =>
                res.toEnvelope().toXDR('base64'),
            );
        }

        if (this.authType === LoginTypes.walletKit) {
            return WalletKitService.signTx(tx).then(res => res.toEnvelope().toXDR('base64'));
        }
    }

    async signAndSubmitTx(
        tx: StellarSdk.Transaction,
        withResult?: boolean,
        callback?: () => void,
    ): Promise<unknown> {
        function callCallbackIfExist() {
            if (callback) {
                callback();
            }
        }
        if (this.authType === LoginTypes.public) {
            const xdr = tx.toEnvelope().toXDR('base64');

            ModalService.openModal(SignWithPublic, { xdr, account: this }).then(() => {
                callCallbackIfExist();
            });
            return Promise.resolve({ status: BuildSignAndSubmitStatuses.pending });
        }

        if (this.authType === LoginTypes.walletConnect && !withResult) {
            return WalletConnectService.signAndSubmitTx(tx as StellarSdk.Transaction).then(res => {
                callCallbackIfExist();
                return res;
            });
        }

        let signedTx;

        if (this.authType === LoginTypes.secret) {
            signedTx = SorobanService.connection.signWithSecret(tx);
        }

        if (this.authType === LoginTypes.lobstr) {
            signedTx = await LobstrExtensionService.signTx(tx);
        }

        if (this.authType === LoginTypes.walletConnect && withResult) {
            const signedXDR: string = await WalletConnectService.signTx(tx);
            signedTx = new StellarSdk.Transaction(signedXDR, getNetworkPassphrase());
        }

        if (this.authType === LoginTypes.ledger && !this.isMultisigEnabled) {
            const result = LedgerService.signTx(tx as StellarSdk.Transaction)
                .then(signed =>
                    withResult
                        ? SorobanService.connection.submitTx(signed)
                        : StellarService.submitTx(signed),
                )
                .then(res => {
                    callCallbackIfExist();
                    return res;
                });
            ModalService.openModal(LedgerSignTx, { result });
            return result;
        }

        if (this.authType === LoginTypes.walletKit) {
            signedTx = await WalletKitService.signTx(tx);
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
            return (
                withResult
                    ? SorobanService.connection.submitTx(signedTx)
                    : StellarService.submitTx(signedTx)
            ).then(res => {
                callCallbackIfExist();
                return res;
            });
        }

        ModalService.closeAllModals();

        const xdr = signedTx.toEnvelope().toXDR('base64');

        if (!this.isVaultEnabled) {
            ModalService.openModal(SignWithPublic, { xdr, account: this }).then(() => {
                callCallbackIfExist();
            });

            return Promise.resolve({ status: BuildSignAndSubmitStatuses.pending });
        }

        return StellarService.sendToVault(xdr)
            .then(() => {
                ModalService.openModal(SentToVault, {}).then(() => {
                    callCallbackIfExist();
                });
                return Promise.resolve({ status: BuildSignAndSubmitStatuses.pending });
            })
            .catch(() => {
                ModalService.openModal(SignWithPublic, { xdr, account: this }).then(() => {
                    callCallbackIfExist();
                });
                return Promise.resolve({ status: BuildSignAndSubmitStatuses.pending });
            });
    }

    getAssetBalance(asset: SorobanToken): Promise<string>;
    getAssetBalance(asset: ClassicToken, ignoreReserves?: boolean): number | null;
    getAssetBalance(asset: Token, ignoreReserves?: boolean): number | null | Promise<string> {
        if (asset.type === TokenType.soroban) {
            return SorobanService.token
                .getTokenBalance(asset.contract, this.account_id)
                .then(res => res);
        }
        if (asset.isNative()) {
            const nativeBalance = this.balances.find(
                ({ asset_type }) => asset_type === 'native',
            ) as Horizon.HorizonApi.BalanceLineNative;

            return new BigNumber(nativeBalance.balance)
                .minus(ignoreReserves ? '0' : nativeBalance.selling_liabilities)
                .toNumber();
        }
        const assetBalance = this.balances.find(
            balance =>
                (balance as Horizon.HorizonApi.BalanceLineAsset).asset_code == asset.code &&
                (balance as Horizon.HorizonApi.BalanceLineAsset).asset_issuer === asset.issuer,
        ) as Horizon.HorizonApi.BalanceLineAsset;

        if (!assetBalance) {
            return null;
        }

        return new BigNumber(assetBalance.balance)
            .minus(ignoreReserves ? '0' : assetBalance.selling_liabilities)
            .toNumber();
    }

    getPoolBalance(id: string) {
        const poolBalance = this.balances.find(
            balance =>
                (balance as Horizon.HorizonApi.BalanceLineLiquidityPool).liquidity_pool_id === id,
        ) as Horizon.HorizonApi.BalanceLineLiquidityPool;

        if (!poolBalance) {
            return null;
        }

        return new BigNumber(poolBalance.balance).toFixed(7);
    }

    async getClassicPools(): Promise<PoolClassicProcessed[]> {
        const liquidityPoolsForAccount = await StellarService.getLiquidityPoolForAccount(
            this.accountId(),
            200,
        );

        if (!liquidityPoolsForAccount.length) {
            return [];
        }

        const assetsSet = new Set();

        liquidityPoolsForAccount.forEach(lp => {
            (lp as unknown as PoolClassicProcessed).tokens = lp.reserves.map(reserve => {
                assetsSet.add(reserve.asset);
                return getAssetFromString(reserve.asset) as ClassicToken;
            });
            (lp as unknown as PoolClassicProcessed).reserves = [
                ...lp.reserves.map(reserve => new BigNumber(reserve.amount).times(1e7).toFixed(7)),
                ...lp.reserves,
            ];
            (lp as unknown as PoolClassicProcessed).total_share = new BigNumber(lp.total_shares)
                .times(1e7)
                .toFixed(7);
            (lp as unknown as PoolClassicProcessed).fee = 0.003;
        });

        const prices = await getNativePrices();

        liquidityPoolsForAccount.forEach(lp => {
            (lp as unknown as PoolClassicProcessed).liquidity = (
                lp as unknown as PoolClassicProcessed
            ).tokens
                .reduce((acc, asset, index) => {
                    const price = prices.get(asset.contractId(getNetworkPassphrase())).price ?? 0;

                    const amount = Number(lp.reserves[index]) * Number(price);

                    return acc + amount;
                }, 0)
                .toString();
        });

        const pools = this.balances
            .filter(
                (balance): balance is Horizon.HorizonApi.BalanceLineLiquidityPool =>
                    balance.asset_type === 'liquidity_pool_shares',
            )
            .map(balance => ({
                ...balance,
                balance: new BigNumber(balance.balance).times(1e7).toFixed(7),
            }));

        return pools
            .map(pool => {
                const lp = liquidityPoolsForAccount.find(({ id }) => id === pool.liquidity_pool_id);

                return lp ? { ...pool, ...lp, pool_type: POOL_TYPE.classic } : null;
            })
            .filter(item => Boolean(item)) as unknown as PoolClassicProcessed[];
    }

    hasAllIceTrustlines() {
        return DEFAULT_ICE_ASSETS.map(asset => {
            const [code, issuer] = asset.split(':');
            const stellarAsset = StellarService.createAsset(code, issuer);
            return this.getAssetBalance(stellarAsset);
        }).every(asset => asset !== null);
    }

    getUntrustedIceAssets() {
        return DEFAULT_ICE_ASSETS.reduce((acc, asset) => {
            const [code, issuer] = asset.split(':');
            const stellarAsset = StellarService.createAsset(code, issuer);
            if (this.getAssetBalance(stellarAsset) === null) {
                acc.push(stellarAsset);
                return acc;
            }
            return acc;
        }, []);
    }

    getAquaBalance(): number | null {
        const aquaBalance = this.balances.find(
            balance =>
                (balance as Horizon.HorizonApi.BalanceLineAsset).asset_code == aquaCode &&
                (balance as Horizon.HorizonApi.BalanceLineAsset).asset_issuer === aquaIssuer,
        ) as Horizon.HorizonApi.BalanceLineAsset;

        if (!aquaBalance) {
            return null;
        }

        return new BigNumber(aquaBalance.balance).minus(aquaBalance.selling_liabilities).toNumber();
    }

    getAquaInOffers(): number | null {
        const aquaBalance = this.balances.find(
            balance =>
                (balance as Horizon.HorizonApi.BalanceLineAsset).asset_code == aquaCode &&
                (balance as Horizon.HorizonApi.BalanceLineAsset).asset_issuer === aquaIssuer,
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
        const classicAssetsBalances = this.balances.filter(
            (asset): asset is Horizon.HorizonApi.BalanceLineAsset =>
                asset.asset_type !== 'liquidity_pool_shares' && asset.asset_type !== 'native',
        );
        const nativeBalanceInstance = this.balances.find(
            ({ asset_type }) => asset_type === 'native',
        );

        const nativePrices = await getNativePrices();

        const knownCustomTokens = [...nativePrices.values()]
            .filter(({ token }) => token.type === TokenType.soroban)
            .map(({ token }) => token);

        const customUserBalances = await Promise.all(
            knownCustomTokens.map(token =>
                SorobanService.token.getTokenBalance(token.contract, this.account_id),
            ),
        );

        const classicBalances = classicAssetsBalances.map(balance => {
            const asset = StellarService.createAsset(balance.asset_code, balance.asset_issuer);
            const contract = asset.contractId(getNetworkPassphrase());

            return {
                balance: balance.balance,
                nativeBalance: nativePrices.has(contract)
                    ? +balance.balance * +nativePrices.get(contract).price
                    : 0,
                token: StellarService.createAsset(balance.asset_code, balance.asset_issuer),
            };
        });

        const customBalances = knownCustomTokens
            .map((token, index) => ({
                balance: customUserBalances[index],
                nativeBalance: +customUserBalances[index] * +nativePrices.get(token.contract).price,
                token,
            }))
            .filter(({ balance }) => !!Number(balance));

        const balances = [...customBalances, ...classicBalances].sort(
            (a, b) =>
                b.nativeBalance - a.nativeBalance ||
                +b.balance - +a.balance ||
                a.token.code.localeCompare(b.token.code),
        );

        return [
            {
                balance: nativeBalanceInstance.balance,
                nativeBalance: +nativeBalanceInstance.balance,
                token: StellarService.createLumen(),
            },
            ...balances,
        ];
    }

    getAvailableForSwapBalance(asset: SorobanToken): Promise<number>;
    getAvailableForSwapBalance(asset: ClassicToken): number | null;
    getAvailableForSwapBalance(asset: Token): Promise<number> | number | null {
        const FEE_RESERVE = 2; // reserve for fee
        if (asset.type !== TokenType.soroban && asset.isNative()) {
            const available = this.getAvailableNativeBalance();

            return Math.max(available - FEE_RESERVE, 0);
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.getAssetBalance(asset);
    }

    async getReservesForSwap(asset: Token): Promise<{ label: string; value: number }[]> {
        if (asset.type === TokenType.soroban) {
            return [{ label: 'Reserves', value: 0 }];
        }
        const balance = this.balances.find(
            balance =>
                ((balance as Horizon.HorizonApi.BalanceLineAsset).asset_code == asset.code &&
                    (balance as Horizon.HorizonApi.BalanceLineAsset).asset_issuer ===
                        asset.issuer) ||
                (balance.asset_type === 'native' && asset.isNative()),
        ) as Horizon.HorizonApi.BalanceLineAsset | Horizon.HorizonApi.BalanceLineNative;

        if (!balance) {
            return [];
        }

        if (!asset.isNative()) {
            const { selling_liabilities } = balance as Horizon.HorizonApi.BalanceLineAsset;

            return [
                {
                    label: `${asset.code} in active offers`,
                    value: Number(selling_liabilities),
                },
            ];
        }

        const { selling_liabilities } = balance as Horizon.HorizonApi.BalanceLineNative;

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

        // TODO: add pagination for more then 200 offers
        const entriesOffers = (await this.offers({ limit: 200 })).records.length;
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
            { label: 'My liquidity pool trustlines', value: entriesLiquidityTrustlines },
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
}
