import * as StellarSdk from '@stellar/stellar-sdk';
import {
    FeeBumpTransaction,
    Horizon,
    Memo,
    MemoType,
    Operation,
    OperationOptions,
    Transaction,
} from '@stellar/stellar-sdk';
import axios, { AxiosResponse } from 'axios';
import BigNumber from 'bignumber.js';

import { getPoolInfo } from 'api/amm';

import {
    ALL_ICE_ASSETS,
    ASSETS_ENV_DATA,
    D_ICE_CODE,
    DOWN_ICE_CODE,
    GD_ICE_CODE,
    GOV_ICE_CODE,
    ICE_CODE,
    ICE_ISSUER,
    UP_ICE_CODE,
} from 'constants/assets';
import { BASE_FEE } from 'constants/stellar';

import { getAssetString } from 'helpers/assets';
import chunkFunction from 'helpers/chunk-function';
import debounceFunction from 'helpers/debounce-function';
import { getEnv, getNetworkPassphrase } from 'helpers/env';
import { formatBalance, roundToPrecision } from 'helpers/format-number';
import { getHorizonUrl } from 'helpers/url';

import { Asset, StellarToml } from 'types/stellar';
import { ClassicToken, TokenType } from 'types/token';

import { PairStats } from 'pages/vote/api/types';

import EventService from './event.service';
import { ToastService } from './globalServices';

const VAULT_API = 'https://vault.lobstr.co/api/transactions/';

const TRANSACTION_TIMEOUT = 60 * 60 * 24 * 30;
const MARKET_KEY_MARKER_UP = 'GA2UB7VXXXUSEAQUAXXXAQUARIUSVOTINGWALLETXXXPOWEREDBYAQUA';
const MARKET_KEY_MARKER_DOWN = 'GAYVCXXXUSEAQUAXXXAQUARIUSDOWNVOTEWALLETXXXPOWEREDBYAQUA';
const MARKET_KEY_SIGNER_WEIGHT = 1;
const MARKET_KEY_THRESHOLD = 10;

export const DELEGATE_MARKER_KEY = 'GA5BS7XXXAQUARIUSXXXICEXXXVOTEDELEGATIONXXXPOWEREDBYAQUA';

const AIRDROP_2_SPONSOR = 'GDFCYDQOVJ2OEWPLEGIRQVAM3VTOQ6JDNLJTDZP5S5OGTEHM5CIWMYBH';

export const COLLECTOR_KEY = 'GAORXNBAWRIOJ7HRMCTWW2MIB6PYWSC7OKHGIXWTJXYRTZRSHP356TW3';

export enum StellarEvents {
    accountStream = 'account stream',
    handleAccountUpdate = 'handle account update',
    claimableUpdate = 'claimable update',
    paymentsHistoryUpdate = 'payments history update',
}
const { aquaCode, aquaIssuer, aquaAssetString } = ASSETS_ENV_DATA[getEnv()].aqua;

export enum THRESHOLDS {
    LOW = 'low_threshold',
    MED = 'med_threshold',
    HIGH = 'high_threshold',
    MULTIPLE = 'multiple',
    UNKNOWN = 'unknown',
}

export const THRESHOLD_ORDER = {
    [THRESHOLDS.LOW]: 1,
    [THRESHOLDS.MED]: 2,
    [THRESHOLDS.HIGH]: 3,
};

const AMM_REWARDS_KEY = 'GC6ZWKVYRAUSCLMQYKDQZNTUNVDH2J5J6IELIWHMF7THRUQJQTQFQANA';
const SDEX_REWARDS_KEY = 'GC5VEAWX7C3GSTW7RUKJKMQWXYZFW5TH4NGI4ZQSF6LNLUYSDGBVANBA';
const BRIBE_REWARDS_KEY = 'GAORXNBAWRIOJ7HRMCTWW2MIB6PYWSC7OKHGIXWTJXYRTZRSHP356TW3';

export const OP_THRESHOLDS = {
    [THRESHOLDS.LOW]: ['allowTrust', 'inflation', 'bumpSequence', 'setTrustLineFlags'],
    [THRESHOLDS.MED]: [
        'createAccount',
        'payment',
        'pathPayment',
        'pathPaymentStrictSend',
        'pathPaymentStrictReceive',
        'manageBuyOffer',
        'manageSellOffer',
        'createPassiveSellOffer',
        'changeTrust',
        'manageData',
        'createClaimableBalance',
        'claimClaimableBalance',
        'beginSponsoringFutureReserves',
        'endSponsoringFutureReserves',
        'revokeSponsorship',
        'clawback',
        'clawbackClaimableBalance',
    ],
    [THRESHOLDS.HIGH]: ['accountMerge'],
    [THRESHOLDS.MULTIPLE]: ['setOptions'], // med or high
};

type StellarPayload = {
    account?: StellarSdk.Horizon.AccountResponse | StellarSdk.Horizon.ServerApi.AccountRecord;
};

export default class StellarServiceClass {
    server: StellarSdk.Horizon.Server | null = null;
    event: EventService<StellarEvents, StellarPayload> = new EventService();
    closeStream: () => void | null = null;
    closeEffectsStream: () => void | null = null;
    paymentsHistory = null;
    debouncedUpdatePayments;
    nextPayments = null;
    loadMorePaymentsPending = false;
    paymentsFullyLoaded = false;
    priceLumenUsd = null;
    private claimableBalances: Horizon.ServerApi.ClaimableBalanceRecord[] | null = null;
    private keypair: StellarSdk.Keypair | null = null;
    private poolsRewardsNoteHash = new Map<string, unknown>();

    constructor() {
        this.startHorizonServer();
        this.loadMorePayments = this.loadMorePayments.bind(this);
        this.updatePayments = this.updatePayments.bind(this);

        this.debouncedUpdatePayments = debounceFunction(this.updatePayments, 500);

        this.updateLumenUsdPrice();

        setInterval(() => this.updateLumenUsdPrice(), 5 * 60 * 1000);
    }

    get isClaimableBalancesLoaded() {
        return this.claimableBalances !== null;
    }

    async buildTx(
        account: StellarSdk.Account,
        operations: StellarSdk.xdr.Operation | StellarSdk.xdr.Operation[],
        memo?: StellarSdk.Memo,
    ) {
        const newAccount = await this.loadAccount(account.accountId());

        this.event.trigger({ type: StellarEvents.handleAccountUpdate, account: newAccount });

        const tx = new StellarSdk.TransactionBuilder(newAccount, {
            fee: BASE_FEE,
            networkPassphrase: getNetworkPassphrase(),
        }).setTimeout(TRANSACTION_TIMEOUT);

        if (Array.isArray(operations)) {
            operations.forEach(op => {
                tx.addOperation(op);
            });
        } else {
            tx.addOperation(operations);
        }

        if (memo) {
            tx.addMemo(memo);
        }

        return tx.build();
    }

    buildTxFromXdr(xdr: string): Transaction<Memo<MemoType>, Operation[]> | FeeBumpTransaction {
        return StellarSdk.TransactionBuilder.fromXDR(xdr, getNetworkPassphrase());
    }

    createMemo(type: MemoType, value): Memo {
        return new StellarSdk.Memo(type, value);
    }

    createAsset(code: string, issuer: string): ClassicToken {
        const asset: ClassicToken = new StellarSdk.Asset(code, issuer) as ClassicToken;

        asset.type = TokenType.classic;
        asset.contract = asset.contractId(getNetworkPassphrase());
        asset.decimal = 7;

        return asset;
    }

    createLumen(): ClassicToken {
        const asset: ClassicToken = StellarSdk.Asset.native() as ClassicToken;

        asset.type = TokenType.classic;
        asset.contract = asset.contractId(getNetworkPassphrase());
        asset.decimal = 7;

        return asset;
    }

    isValidPublicKey(key: string): boolean {
        return StellarSdk.StrKey.isValidEd25519PublicKey(key);
    }

    isValidContract(id: string): boolean {
        return StellarSdk.StrKey.isValidContract(id);
    }

    submitTx(tx: StellarSdk.Transaction) {
        return this.server.submitTransaction(tx);
    }

    signWithSecret(tx: StellarSdk.Transaction) {
        tx.sign(this.keypair);
        return tx;
    }

    submitXDR(xdr: string): Promise<Horizon.HorizonApi.SubmitTransactionResponse> {
        const tx = new StellarSdk.Transaction(xdr, getNetworkPassphrase());
        return this.submitTx(tx);
    }

    sendToVault(xdr: string) {
        const headers = { 'Content-Type': 'application/json' };

        return axios.post(VAULT_API, JSON.stringify({ xdr }), { headers });
    }

    isMoreSignaturesNeeded(tx: StellarSdk.Transaction, account: Partial<Horizon.AccountResponse>) {
        const { operations } = tx;

        const transactionThreshold = operations.reduce((acc, operation) => {
            const { type } = operation;

            let usedThreshold = Object.keys(OP_THRESHOLDS).reduce(
                (used, threshold) => {
                    if (OP_THRESHOLDS[threshold].includes(type)) {
                        return threshold;
                    }
                    return used;
                },
                [THRESHOLDS.UNKNOWN],
            );

            if (usedThreshold === THRESHOLDS.UNKNOWN) {
                throw new Error('unknown operation');
            }

            if (usedThreshold === THRESHOLDS.MULTIPLE) {
                const { masterWeight, lowThreshold, medThreshold, highThreshold, signer } =
                    operation as OperationOptions.SetOptions;
                usedThreshold =
                    masterWeight || lowThreshold || medThreshold || highThreshold || signer
                        ? THRESHOLDS.HIGH
                        : THRESHOLDS.MED;
            }

            return THRESHOLD_ORDER[usedThreshold as THRESHOLDS] > THRESHOLD_ORDER[acc]
                ? usedThreshold
                : acc;
        }, THRESHOLDS.LOW);

        const masterKeyWeight = account.signers.find(
            signer => signer.key === account.account_id,
        ).weight;

        return (
            masterKeyWeight <
            account.thresholds[
                transactionThreshold as keyof StellarSdk.Horizon.HorizonApi.AccountThresholds
            ]
        );
    }

    private startHorizonServer(): void {
        // settled in configs: prod.js and dev.js
        // this.server = new StellarSdk.Horizon.Server(process.horizon.HORIZON_SERVER);
        this.server = new StellarSdk.Horizon.Server(getHorizonUrl());
    }

    loadAccount(publicKey: string): Promise<StellarSdk.Horizon.AccountResponse> {
        if (!this.server) {
            throw new Error("Horizon server isn't started");
        }
        return this.server.loadAccount(publicKey);
    }

    resolveFederation(homeDomain: string, accountId: string): Promise<string> {
        return StellarSdk.StellarToml.Resolver.resolve(homeDomain)
            .then(toml => {
                if (!toml.FEDERATION_SERVER) {
                    throw new Error('Federation server not exists');
                }

                return toml.FEDERATION_SERVER;
            })
            .then(server => {
                const params = new URLSearchParams();
                params.append('q', accountId);
                params.append('type', 'id');

                return axios.get(server, { params });
            })
            .then(
                (result: AxiosResponse<{ stellar_address: string }>) => result.data.stellar_address,
            );
    }

    resolveToml(homeDomain: string): Promise<StellarToml> {
        return StellarSdk.StellarToml.Resolver.resolve(homeDomain);
    }

    startAccountStream(publicKey: string): void {
        this.closeStream = this.server
            .accounts()
            .accountId(publicKey)
            .cursor('now')
            .stream({
                onmessage: result => {
                    this.event.trigger({ type: StellarEvents.accountStream, account: result });
                },
            });
    }

    closeAccountStream(): void {
        if (this.closeStream) {
            this.closeStream();
        }
    }

    getClaimableBalances(publicKey: string) {
        const limit = 200;
        this.server
            .claimableBalances()
            .claimant(publicKey)
            .order('desc')
            .limit(limit)
            .call()
            .then(claimable => {
                this.claimableBalances = claimable.records;
                this.event.trigger({ type: StellarEvents.claimableUpdate });

                if (claimable.records.length === limit) {
                    this.getNextClaimableBalances(claimable.next, limit);
                }
            });
    }

    getAquaPrice(): Promise<number> {
        return this.server
            .orderbook(this.createAsset(aquaCode, aquaIssuer), this.createLumen())
            .call()
            .then(res => (+res.asks[0].price + +res.bids[0].price) / 2);
    }

    getAquaUsdPrice(): Promise<number> {
        return Promise.all([this.getAquaPrice(), this.getLumenUsdPrice()]).then(
            ([AQUA_XLM, XLM_USD]) => AQUA_XLM * XLM_USD,
        );
    }

    getLocks(publicKey: string) {
        if (!this.claimableBalances) {
            return null;
        }

        return this.claimableBalances.filter(
            claim =>
                claim.claimants.length === 1 &&
                claim.claimants[0].destination === publicKey &&
                claim.asset === aquaAssetString,
        );
    }

    getAccountLocks(publicKey: string) {
        const LOCKS_LIMIT = 200;
        return this.server
            .claimableBalances()
            .sponsor(publicKey)
            .order('desc')
            .limit(LOCKS_LIMIT)
            .call()
            .then(claimable => {
                if (claimable.records.length === LOCKS_LIMIT) {
                    return this.getNextLocks(claimable.records, claimable.next, LOCKS_LIMIT);
                }
                return claimable.records;
            })
            .then(records =>
                records.filter(
                    claim =>
                        claim.claimants.length === 1 &&
                        claim.claimants[0].destination === publicKey &&
                        claim.asset === aquaAssetString,
                ),
            );
    }

    getNextLocks(
        claims,
        next: () => Promise<
            Horizon.ServerApi.CollectionPage<Horizon.ServerApi.ClaimableBalanceRecord>
        >,
        limit: number,
    ): Promise<Horizon.ServerApi.ClaimableBalanceRecord[]> {
        return next().then(res => {
            if (res.records.length === limit) {
                return this.getNextLocks([...claims, ...res.records], res.next, limit);
            }

            return [...claims, ...res.records];
        });
    }

    getNextClaimableBalances(
        next: () => Promise<
            Horizon.ServerApi.CollectionPage<Horizon.ServerApi.ClaimableBalanceRecord>
        >,
        limit,
    ) {
        next().then(res => {
            this.claimableBalances = [...this.claimableBalances, ...res.records];
            this.event.trigger({ type: StellarEvents.claimableUpdate });

            if (res.records.length === limit) {
                this.getNextClaimableBalances(res.next, limit);
            }
        });
    }

    startEffectsStream(publicKey: string) {
        this.getClaimableBalances(publicKey);

        this.closeEffectsStream = this.server
            .effects()
            .forAccount(publicKey)
            .cursor('now')
            .stream({
                onmessage: (res: Horizon.ServerApi.EffectRecord) => {
                    if (
                        res.type === 'claimable_balance_sponsorship_created' ||
                        res.type === 'claimable_balance_sponsorship_removed' ||
                        res.type === 'claimable_balance_sponsorship_updated' ||
                        res.type === 'claimable_balance_created' ||
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        res.type === 'claimable_balance_claimant_created'
                    ) {
                        this.getClaimableBalances(publicKey);
                    }
                    if (
                        (res as unknown as Horizon.ServerApi.EffectRecord).type ===
                        'account_debited'
                    ) {
                        const { amount, asset_type, asset_code } = res as unknown as {
                            amount: string;
                            asset_type: string;
                            asset_code: string;
                        };

                        ToastService.showSuccessToast(
                            `Payment sent: ${formatBalance(Number(amount))} ${
                                asset_type === 'native' ? 'XLM' : asset_code
                            }`,
                        );
                    }

                    if (
                        (res as unknown as Horizon.ServerApi.EffectRecord).type ===
                        'account_credited'
                    ) {
                        this.debouncedUpdatePayments(publicKey);
                        const { amount, asset_type, asset_code } = res as unknown as {
                            amount: string;
                            asset_type: string;
                            asset_code: string;
                        };

                        ToastService.showSuccessToast(
                            `Payment received: ${formatBalance(Number(amount))} ${
                                asset_type === 'native' ? 'XLM' : asset_code
                            }`,
                        );
                    }
                },
            });
    }

    stopEffectsStream(): void {
        if (this.closeEffectsStream) {
            this.closeEffectsStream();
            this.claimableBalances = null;
            this.paymentsFullyLoaded = false;
            this.paymentsHistory = null;
            this.nextPayments = null;
            this.event.trigger({ type: StellarEvents.claimableUpdate });
        }
    }

    async getAccountOffers(publicKey: string): Promise<Horizon.ServerApi.OfferRecord[]> {
        const OFFERS_LIMIT = 200;
        const { records, next } = await this.server
            .offers()
            .forAccount(publicKey)
            .order('desc')
            .limit(OFFERS_LIMIT)
            .call();

        if (records.length === OFFERS_LIMIT) {
            return this.nextRequest(records, next, OFFERS_LIMIT);
        }

        return Promise.resolve(records);
    }

    getMarketVotesValue(marketKey: string, accountId: string, asset: StellarSdk.Asset) {
        if (!this.claimableBalances) {
            return null;
        }

        return this.claimableBalances.reduce((acc, claim) => {
            if (claim.claimants.length !== 2) {
                return acc;
            }
            const hasMarker = claim.claimants.some(claimant => claimant.destination === marketKey);
            const hasSelfClaim = claim.claimants.some(
                claimant => claimant.destination === accountId,
            );
            const isAqua = claim.asset === `${asset.code}:${asset.issuer}`;

            if (hasMarker && hasSelfClaim && isAqua) {
                acc += Number(claim.amount);
            }
            return acc;
        }, 0);
    }

    getVotesForProposal(proposal, accountId) {
        if (!this.claimableBalances) {
            return null;
        }

        return this.claimableBalances.reduce((acc, claim) => {
            if (claim.claimants.length !== 2) {
                return acc;
            }
            const hasForMarker = claim.claimants.some(
                claimant => claimant.destination === proposal.vote_for_issuer,
            );
            const hasAgainstMarker = claim.claimants.some(
                claimant => claimant.destination === proposal.vote_against_issuer,
            );
            const selfClaim = claim.claimants.find(claimant => claimant.destination === accountId);
            const isAqua = claim.asset === aquaAssetString;
            const isGovIce = claim.asset === `${GOV_ICE_CODE}:${ICE_ISSUER}`;

            if ((hasForMarker || hasAgainstMarker) && Boolean(selfClaim) && (isAqua || isGovIce)) {
                const [code, issuer] = claim.asset.split(':');
                acc.push({
                    ...claim,
                    isForVote: hasForMarker,
                    claimBackDate: selfClaim.predicate.not.abs_before,
                    assetCode: code,
                    assetIssuer: issuer,
                });
            }
            return acc;
        }, []);
    }

    getPairVotes(pair: PairStats, accountId: string) {
        if (!this.claimableBalances) {
            return null;
        }
        return this.claimableBalances.reduce((acc, claim) => {
            if (claim.claimants.length !== 2) {
                return acc;
            }
            const hasUpMarker = claim.claimants.some(
                claimant => claimant.destination === pair.account_id,
            );
            const hasDownMarker = claim.claimants.some(
                claimant => claimant.destination === pair.downvote_account_id,
            );
            const selfClaim = claim.claimants.find(claimant => claimant.destination === accountId);
            const isAqua = claim.asset === aquaAssetString;
            const isUpIce = claim.asset === `${UP_ICE_CODE}:${ICE_ISSUER}`;
            const isDownIce = claim.asset === `${DOWN_ICE_CODE}:${ICE_ISSUER}`;
            const isDelegatedIce = claim.asset === `${D_ICE_CODE}:${ICE_ISSUER}`;

            if (
                (hasUpMarker || hasDownMarker) &&
                Boolean(selfClaim) &&
                (isAqua || isUpIce || isDownIce || isDelegatedIce)
            ) {
                const [code, issuer] = claim.asset.split(':');
                acc.push({
                    ...claim,
                    isDownVote: hasDownMarker,
                    claimBackDate: selfClaim.predicate.not.abs_before,
                    assetCode: code,
                    assetIssuer: issuer,
                });
            }
            return acc;
        }, []);
    }

    getAirdrop2Claims() {
        if (!this.claimableBalances) {
            return null;
        }

        return this.claimableBalances.filter(cb => cb.sponsor === AIRDROP_2_SPONSOR);
    }

    getKeysSimilarToMarketKeys(accountId: string): string[] {
        if (!this.claimableBalances) {
            return null;
        }

        return this.claimableBalances.reduce((acc, claim) => {
            if (claim.claimants.length !== 2) {
                return acc;
            }
            const isAqua = claim.asset === aquaAssetString;
            const isUpIce = claim.asset === `${UP_ICE_CODE}:${ICE_ISSUER}`;
            const isDownIce = claim.asset === `${DOWN_ICE_CODE}:${ICE_ISSUER}`;
            const isDelegatedIce = claim.asset === `${D_ICE_CODE}:${ICE_ISSUER}`;
            const hasSelfClaim = claim.claimants.some(
                claimant => claimant.destination === accountId,
            );
            if ((isAqua || isUpIce || isDownIce || isDelegatedIce) && hasSelfClaim) {
                const similarToMarketKey = claim.claimants.find(
                    claimant => claimant.destination !== accountId,
                );

                if (!similarToMarketKey) {
                    return acc;
                }
                if (!acc.includes(similarToMarketKey.destination)) {
                    acc.push(similarToMarketKey.destination);
                }
            }
            return acc;
        }, []);
    }

    balancesHasChanges(
        prevBalances: Horizon.HorizonApi.BalanceLineAsset[],
        newBalances: Horizon.HorizonApi.BalanceLineAsset[],
    ): boolean {
        if (prevBalances.length !== newBalances.length) {
            return true;
        }

        return prevBalances.reduce((acc, balance) => {
            if (acc) {
                return acc;
            }
            const hasNewEqualBalance = newBalances.find(
                newBalance =>
                    newBalance.asset_code === balance.asset_code &&
                    newBalance.asset_issuer === balance.asset_issuer &&
                    newBalance.balance === balance.balance &&
                    newBalance.buying_liabilities === balance.buying_liabilities &&
                    newBalance.selling_liabilities === balance.selling_liabilities,
            );
            return hasNewEqualBalance ? acc : true;
        }, false);
    }

    createVoteOperation(publicKey, marketKey, amount, timestamp, asset) {
        const time = Math.ceil(timestamp / 1000);
        return StellarSdk.Operation.createClaimableBalance({
            source: publicKey,
            amount: amount.toString(),
            asset: asset ?? this.createAsset(aquaCode, aquaIssuer),
            claimants: [
                new StellarSdk.Claimant(
                    marketKey,
                    StellarSdk.Claimant.predicateNot(StellarSdk.Claimant.predicateUnconditional()),
                ),
                new StellarSdk.Claimant(
                    publicKey,
                    StellarSdk.Claimant.predicateNot(
                        StellarSdk.Claimant.predicateBeforeAbsoluteTime(time.toString()),
                    ),
                ),
            ],
        });
    }

    processIceTx(tx, asset) {
        if (!ALL_ICE_ASSETS.includes(getAssetString(asset))) {
            return tx;
        }

        const endpoint = this.getIceApproveEndpoint(asset);

        return axios
            .post<{ status: string; tx: string }>(endpoint, { tx: tx.toEnvelope().toXDR('base64') })
            .then(({ data }) => {
                if (data.status !== 'revised') {
                    throw new Error('Incorrect status');
                }
                return new StellarSdk.Transaction(data.tx, getNetworkPassphrase());
            });
    }

    private getIceApproveEndpoint(asset) {
        if (asset.code === ICE_CODE && asset.issuer === ICE_ISSUER) {
            return 'https://ice-approval.aqua.network/api/v1/ice/tx-approve/';
        }
        if (asset.code === UP_ICE_CODE && asset.issuer === ICE_ISSUER) {
            return 'https://ice-approval.aqua.network/api/v2/upvote-ice/tx-approve/';
        }
        if (asset.code === D_ICE_CODE && asset.issuer === ICE_ISSUER) {
            return 'https://ice-approval.aqua.network/api/v2/delegated-ice/tx-approve/';
        }
        if (asset.code === DOWN_ICE_CODE && asset.issuer === ICE_ISSUER) {
            return 'https://ice-approval.aqua.network/api/v2/downvote-ice/tx-approve/';
        }
        if (asset.code === GOV_ICE_CODE && asset.issuer === ICE_ISSUER) {
            return 'https://ice-approval.aqua.network/api/v1/govern-ice/tx-approve/';
        }

        if (asset.code === GD_ICE_CODE && asset.issuer === ICE_ISSUER) {
            return 'https://ice-approval.aqua.network/api/v1/delegated-govern-ice/tx-approve/';
        }

        throw new Error('Unknown asset');
    }

    createLockOperation(publicKey, amount, timestamp) {
        const time = Math.ceil(timestamp / 1000);
        return StellarSdk.Operation.createClaimableBalance({
            source: publicKey,
            amount: amount.toString(),
            asset: this.createAsset(aquaCode, aquaIssuer),
            claimants: [
                new StellarSdk.Claimant(
                    publicKey,
                    StellarSdk.Claimant.predicateNot(
                        StellarSdk.Claimant.predicateBeforeAbsoluteTime(time.toString()),
                    ),
                ),
            ],
        });
    }

    async getLiquidityPoolForAccount(
        id: string,
        limit,
    ): Promise<Horizon.ServerApi.LiquidityPoolRecord[]> {
        const { records, next } = await this.server
            .liquidityPools()
            .forAccount(id)
            .limit(limit)
            .call();

        if (records.length === limit) {
            return this.nextRequest(records, next, limit);
        }

        return Promise.resolve(records);
    }

    async nextRequest(previousRecords, nextRequest, limit) {
        const { records, next } = await nextRequest();

        if (records.length === limit) {
            return this.nextRequest([...previousRecords, records], next, limit);
        }

        return Promise.resolve([...previousRecords, ...records]);
    }

    createBurnAquaOperation(amount: string) {
        return StellarSdk.Operation.payment({
            amount,
            asset: this.createAsset(aquaCode, aquaIssuer),
            destination: aquaIssuer,
        });
    }

    addMarketKeyOperations(txBuilder, accountId, asset1, asset2, amount, signerKey): void {
        txBuilder.addOperation(
            StellarSdk.Operation.createAccount({
                destination: accountId,
                startingBalance: amount.toString(),
            }),
        );

        if (!asset1.isNative()) {
            txBuilder.addOperation(
                StellarSdk.Operation.changeTrust({
                    source: accountId,
                    asset: asset1,
                }),
            );
        }

        if (!asset2.isNative()) {
            txBuilder.addOperation(
                StellarSdk.Operation.changeTrust({
                    source: accountId,
                    asset: asset2,
                }),
            );
        }

        txBuilder.addOperation(
            StellarSdk.Operation.setOptions({
                source: accountId,
                masterWeight: MARKET_KEY_SIGNER_WEIGHT,
                lowThreshold: MARKET_KEY_THRESHOLD,
                medThreshold: MARKET_KEY_THRESHOLD,
                highThreshold: MARKET_KEY_THRESHOLD,
                signer: {
                    ed25519PublicKey: signerKey,
                    weight: MARKET_KEY_SIGNER_WEIGHT,
                },
            }),
        );
    }

    async createMarketKeyTx(sourceAccountId, asset1, asset2, totalAmount) {
        const updatedAccount = await this.loadAccount(sourceAccountId);
        const marketKeyUp = StellarSdk.Keypair.random();
        const marketKeyDown = StellarSdk.Keypair.random();

        const transactionBuilder = new StellarSdk.TransactionBuilder(updatedAccount, {
            fee: BASE_FEE,
            networkPassphrase: getNetworkPassphrase(),
        });

        this.addMarketKeyOperations(
            transactionBuilder,
            marketKeyUp.publicKey(),
            asset1,
            asset2,
            totalAmount / 2,
            MARKET_KEY_MARKER_UP,
        );
        this.addMarketKeyOperations(
            transactionBuilder,
            marketKeyDown.publicKey(),
            asset1,
            asset2,
            totalAmount / 2,
            MARKET_KEY_MARKER_DOWN,
        );

        transactionBuilder.setTimeout(TRANSACTION_TIMEOUT);

        const transaction = transactionBuilder.build();

        transaction.sign(marketKeyUp);
        transaction.sign(marketKeyDown);

        return transaction;
    }

    async getAssetLumenPrice(asset) {
        const period = 3 * 24 * 60 * 60 * 1000;
        const now = Date.now();

        const start = now - period;

        const { records } = await this.server
            .tradeAggregation(
                this.createLumen(),
                this.createAsset(asset.code, asset.issuer),
                start,
                now + 3600000,
                3600000,
                0,
            )
            .limit(1)
            .order('desc')
            .call();

        if (!records.length) {
            return null;
        }

        return roundToPrecision(1 / Number(records[0].close), 7);
    }

    async getAsset24hStats(
        base: Asset,
        counter: Asset,
    ): Promise<{ volume: number; changes24h: string; price: { n: string; d: string } }> {
        const period = 24 * 60 * 60 * 1000;
        const now = Date.now();
        const resolution = 900000; // 15 minutes

        const start = now - period;

        const { records } = await this.server
            .tradeAggregation(base, counter, start, now + resolution, resolution, 0)
            .limit(period / resolution + 1)
            .order('desc')
            .call();

        const volume = records.reduce((acc, item) => acc + Number(item.base_volume), 0);

        const startPrice = +records[records.length - 1].open;
        const lastPrice = +records[0].close;

        const changes24h = (((lastPrice - startPrice) / startPrice) * 100).toFixed(2);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return { volume, changes24h, price: records[0].close_r };
    }

    createClaimOperations(claimId: string, withTrust?: boolean) {
        const ops = [];

        if (withTrust) {
            const trustOp = StellarSdk.Operation.changeTrust({
                asset: this.createAsset(aquaCode, aquaIssuer),
            });
            ops.push(trustOp);
        }

        const claimOp = StellarSdk.Operation.claimClaimableBalance({
            balanceId: claimId,
        });

        ops.push(claimOp);

        return ops;
    }

    createBribeOperation(marketKey, asset, amount, timestamp) {
        const time = Math.ceil(timestamp / 1000);
        return StellarSdk.Operation.createClaimableBalance({
            amount: amount.toString(),
            asset: this.createAsset(asset.code, asset.issuer),
            claimants: [
                new StellarSdk.Claimant(
                    marketKey,
                    StellarSdk.Claimant.predicateNot(StellarSdk.Claimant.predicateUnconditional()),
                ),
                new StellarSdk.Claimant(
                    COLLECTOR_KEY,
                    StellarSdk.Claimant.predicateNot(
                        StellarSdk.Claimant.predicateBeforeAbsoluteTime(time.toString()),
                    ),
                ),
            ],
        });
    }

    createDelegateTx(account, token: ClassicToken, delegateDestionation, amount) {
        return this.buildTx(
            account,
            StellarSdk.Operation.createClaimableBalance({
                source: account.accountId(),
                amount: amount.toString(),
                asset: token,
                claimants: [
                    new StellarSdk.Claimant(
                        account.accountId(),
                        StellarSdk.Claimant.predicateNot(
                            StellarSdk.Claimant.predicateBeforeAbsoluteTime(
                                ((Date.now() + 25 * 60 * 60 * 1000) / 1000).toFixed(), // 25 hours
                            ),
                        ),
                    ),
                    new StellarSdk.Claimant(
                        delegateDestionation,
                        StellarSdk.Claimant.predicateNot(
                            StellarSdk.Claimant.predicateUnconditional(),
                        ),
                    ),
                    new StellarSdk.Claimant(
                        DELEGATE_MARKER_KEY,
                        StellarSdk.Claimant.predicateNot(
                            StellarSdk.Claimant.predicateUnconditional(),
                        ),
                    ),
                ],
            }),
        );
    }

    getDelegateLocks(accountId: string) {
        if (!this.claimableBalances) {
            return null;
        }

        return this.claimableBalances
            .reduce((acc, claim) => {
                if (claim.claimants.length !== 3) {
                    return acc;
                }
                const hasMarker = claim.claimants.some(
                    claimant => claimant.destination === DELEGATE_MARKER_KEY,
                );
                const selfClaim = claim.claimants.find(
                    claimant =>
                        claimant.destination === accountId && !!claimant.predicate?.not?.abs_before,
                );
                const isUpvoteIce = claim.asset === `${UP_ICE_CODE}:${ICE_ISSUER}`;

                if (hasMarker && Boolean(selfClaim) && isUpvoteIce) {
                    acc.push(claim);
                }
                return acc;
            }, [])
            .map(cb => {
                const unlockDate =
                    cb.claimants.find(({ destination }) => destination === accountId).predicate.not
                        .abs_before_epoch * 1000;

                return { ...cb, unlockDate };
            });
    }

    getDelegatorLocks(accountId: string) {
        if (!this.claimableBalances) {
            return null;
        }

        return this.claimableBalances.reduce((acc, claim) => {
            if (claim.claimants.length !== 3) {
                return acc;
            }
            const hasMarker = claim.claimants.some(
                claimant => claimant.destination === DELEGATE_MARKER_KEY,
            );
            const selfClaim = claim.claimants.find(
                claimant =>
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    claimant.destination === accountId && !!claimant.predicate?.not?.unconditional,
            );
            const isUpvoteIce = claim.asset === `${UP_ICE_CODE}:${ICE_ISSUER}`;
            const isGovernIce = claim.asset === `${GOV_ICE_CODE}:${ICE_ISSUER}`;

            if (hasMarker && Boolean(selfClaim) && (isUpvoteIce || isGovernIce)) {
                acc.push(claim);
            }
            return acc;
        }, []);
    }

    getAquaEquivalent(asset, amount) {
        return this.server
            .strictSendPaths(asset, amount, [this.createAsset(aquaCode, aquaIssuer)])
            .call()
            .then(res => {
                if (!res.records.length) {
                    return '0';
                }

                return res.records.reduce(function (prev, current) {
                    return +prev.destination_amount > +current.destination_amount ? prev : current;
                }).destination_amount;
            });
    }

    createAddTrustOperation(asset) {
        return StellarSdk.Operation.changeTrust({
            asset,
        });
    }

    createWithdrawOperation(
        poolId,
        share,
        base,
        counter,
        baseAmount,
        counterAmount,
        withRemoveTrust,
    ) {
        const ops = [];
        const SLIPPAGE = 0.001; //0.1%

        const [assetA, assetB] = [base, counter].sort((a, b) => StellarSdk.Asset.compare(a, b));

        const [amountA, amountB] =
            assetA.code === base.code && assetA.issuer === base.issuer
                ? [baseAmount, counterAmount]
                : [counterAmount, baseAmount];

        ops.push(
            StellarSdk.Operation.liquidityPoolWithdraw({
                liquidityPoolId: poolId,
                amount: share,
                minAmountA: new BigNumber(amountA).times(1 - SLIPPAGE).toFixed(7),
                minAmountB: new BigNumber(amountB).times(1 - SLIPPAGE).toFixed(7),
            }),
        );

        if (withRemoveTrust) {
            ops.push(
                StellarSdk.Operation.changeTrust({
                    asset: new StellarSdk.LiquidityPoolAsset(
                        assetA,
                        assetB,
                        StellarSdk.LiquidityPoolFeeV18,
                    ),
                    limit: '0',
                }),
            );
        }

        return ops;
    }

    getTradeAggregations(base, counter, startDate, endDate, resolution, limit) {
        return this.server
            .tradeAggregation(base, counter, startDate, endDate, resolution, 0)
            .limit(limit)
            .order('desc')
            .call();
    }

    getLumenUsdPrice(): Promise<number> {
        return axios
            .get<{ _meta: { externalPrices: { USD_XLM: number } } }>(
                `https://api.stellarterm.com/v1/ticker.json?${Math.random()}`,
            )
            .then(({ data }) => data._meta.externalPrices.USD_XLM);
    }

    getLiquidityPoolData(
        base: StellarSdk.Asset,
        counter: StellarSdk.Asset,
    ): Promise<Horizon.ServerApi.LiquidityPoolRecord | null> {
        return this.server
            .liquidityPools()
            .forAssets(base, counter)
            .call()
            .then(({ records }) => {
                if (!records.length) {
                    return null;
                }
                return records[0];
            });
    }

    getPayments(accountId: string, limit: number = 200) {
        if (this.paymentsHistory) {
            return;
        }
        this.server
            .payments()
            .forAccount(accountId)
            .order('desc')
            .limit(limit)
            .call()
            .then(({ next, records }) => {
                this.nextPayments = next;
                const processed = this.processPayments(records);

                if (!processed.length) {
                    return this.loadMorePayments();
                }

                this.paymentsHistory = processed;

                this.event.trigger({ type: StellarEvents.paymentsHistoryUpdate });
            });
    }

    loadMorePayments() {
        if (this.loadMorePaymentsPending || this.paymentsFullyLoaded) {
            return;
        }

        this.loadMorePaymentsPending = true;

        this.nextPayments().then(({ next, records }) => {
            this.nextPayments = next;

            if (!records.length) {
                this.loadMorePaymentsPending = false;
                this.paymentsFullyLoaded = true;
                this.event.trigger({ type: StellarEvents.paymentsHistoryUpdate });
                return;
            }

            const processed = this.processPayments(records);

            if (!processed.length) {
                this.loadMorePaymentsPending = false;
                return this.loadMorePayments();
            }

            this.paymentsHistory = this.paymentsHistory
                ? [...this.paymentsHistory, ...processed]
                : processed;

            this.loadMorePaymentsPending = false;

            this.event.trigger({ type: StellarEvents.paymentsHistoryUpdate });
        });
    }

    updatePayments(accountId: string) {
        if (!this.paymentsHistory?.length) {
            return;
        }

        this.server
            .payments()
            .forAccount(accountId)
            .order('desc')
            .limit(10)
            .call()
            .then(({ records }) => {
                const processed = this.processPayments(records);

                const firstHistoryId = this.paymentsHistory[0].id;

                const recordsFirstCommonIndex = processed.findIndex(
                    record => record.id === firstHistoryId,
                );

                this.paymentsHistory = [
                    ...processed.slice(0, recordsFirstCommonIndex),
                    ...this.paymentsHistory,
                ];

                this.event.trigger({ type: StellarEvents.paymentsHistoryUpdate });
            });
    }

    private encodePaymentParameterValue(value: string) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return StellarSdk.xdr.ScVal.fromXDR(value, 'base64').value()?.toString?.();
    }

    private isPaymentCalledMethod(
        parameters: { value: string; type: string }[],
        methodName: string,
    ): boolean {
        return parameters.some(
            ({ type, value }) =>
                type === 'Sym' && this.encodePaymentParameterValue(value) === methodName,
        );
    }

    private processPayments(payments) {
        const filtered = payments.filter(
            ({ from, type, parameters }) =>
                from === AMM_REWARDS_KEY ||
                from === SDEX_REWARDS_KEY ||
                from === BRIBE_REWARDS_KEY ||
                (type === 'invoke_host_function' &&
                    this.isPaymentCalledMethod(parameters, 'claim')) ||
                (type === 'invoke_host_function' &&
                    this.isPaymentCalledMethod(parameters, 'batch')),
        );

        this.loadNotes(filtered);

        return filtered.map(payment => {
            switch (true) {
                case payment.from === AMM_REWARDS_KEY:
                    payment.title = 'AMM Reward';
                    break;
                case payment.from === SDEX_REWARDS_KEY:
                    payment.title = 'SDEX Reward';
                    break;
                case payment.from === BRIBE_REWARDS_KEY:
                    payment.title = 'Bribe Reward';
                    break;

                case payment.type === 'invoke_host_function' &&
                    this.isPaymentCalledMethod(payment.parameters, 'claim'):
                    payment.title = 'Claim Reward';
                    payment.amount = payment.asset_balance_changes[0].amount;
                    break;
                case payment.type === 'invoke_host_function' &&
                    this.isPaymentCalledMethod(payment.parameters, 'batch'):
                    if (
                        payment.parameters.some(({ value }) => {
                            const parsed = StellarSdk.scValToNative(
                                StellarSdk.xdr.ScVal.fromXDR(value, 'base64'),
                            );

                            if (!Array.isArray(parsed)) return false;

                            return parsed.some(arr => arr.includes('withdraw'));
                        })
                    ) {
                        payment.title = 'Claim Reward';
                        payment.amount =
                            payment.asset_balance_changes[
                                payment.asset_balance_changes.length - 1
                            ].amount;
                        break;
                    }
                    payment.title = 'Claim Rewards';
                    payment.amount = payment.asset_balance_changes.reduce((acc, item) => {
                        acc += Number(item.amount);
                        return acc;
                    }, 0);
                    break;
            }
            return payment;
        });
    }

    private loadNotes(payments) {
        chunkFunction<
            | (StellarSdk.Horizon.ServerApi.PaymentOperationRecord & { memo: string })
            | (StellarSdk.Horizon.ServerApi.InvokeHostFunctionOperationRecord & { memo: string }),
            void
        >(payments, payment => {
            if (
                payment.type === 'invoke_host_function' &&
                this.isPaymentCalledMethod(payment.parameters, 'claim')
            ) {
                return this.getClaimRewardsNote(payment);
            }

            if (
                payment.type === 'invoke_host_function' &&
                this.isPaymentCalledMethod(payment.parameters, 'batch')
            ) {
                if (
                    payment.parameters.some(({ value }) => {
                        const parsed = StellarSdk.scValToNative(
                            StellarSdk.xdr.ScVal.fromXDR(value, 'base64'),
                        );

                        if (!Array.isArray(parsed)) return false;

                        return parsed.some(arr => arr.includes('withdraw'));
                    })
                ) {
                    return this.getClaimRewardsNote(payment);
                }
                payment.memo = `For ${payment.asset_balance_changes.length} pools`;
                this.event.trigger({ type: StellarEvents.paymentsHistoryUpdate });
                return;
            }
            return payment.transaction().then(({ memo }) => {
                payment.memo = memo;
                this.event.trigger({ type: StellarEvents.paymentsHistoryUpdate });
            });
        });
    }

    private getClaimRewardsNote(payment) {
        const poolId = payment.asset_balance_changes[0].from;

        if (this.poolsRewardsNoteHash.has(poolId)) {
            payment.memo = this.poolsRewardsNoteHash.get(poolId);
            this.event.trigger({ type: StellarEvents.paymentsHistoryUpdate });
            return;
        }

        return getPoolInfo(poolId)
            .then(poolInfo => {
                const note = `Rewards for pool: ${poolInfo.tokens
                    .map(({ code }) => code)
                    .join('/')}`;
                this.poolsRewardsNoteHash.set(poolId, note);
                payment.memo = note;
                this.event.trigger({ type: StellarEvents.paymentsHistoryUpdate });
            })
            .catch(() => {
                const note = 'Rewards for unknown pool';
                this.poolsRewardsNoteHash.set(poolId, note);
                payment.memo = note;
                this.event.trigger({ type: StellarEvents.paymentsHistoryUpdate });
            });
    }

    private updateLumenUsdPrice() {
        this.getLumenUsdPrice().then(res => {
            this.priceLumenUsd = res;
        });
    }
}
