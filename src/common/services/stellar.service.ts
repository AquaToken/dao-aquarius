import * as StellarSdk from 'stellar-sdk';
import EventService from './event.service';
import { Horizon } from 'stellar-sdk/lib/horizon_api';
import { Memo, MemoType, OperationOptions, ServerApi } from 'stellar-sdk';
import axios, { AxiosResponse } from 'axios';
import { formatBalance, roundToPrecision } from '../helpers/helpers';
import { PairStats } from '../../pages/vote/api/types';
import { validateMarketKeys } from '../../pages/vote/api/api';
import { ToastService } from './globalServices';

enum HORIZON_SERVER {
    stellar = 'https://horizon-futurenet.stellar.org',
}

const VAULT_API = 'https://vault.lobstr.co/api/transactions/';

const FEE = '100000';
const TRANSACTION_TIMEOUT = 60 * 60 * 24 * 30;
const MARKET_KEY_MARKER_UP = 'GA2UB7VXXXUSEAQUAXXXAQUARIUSVOTINGWALLETXXXPOWEREDBYAQUA';
const MARKET_KEY_MARKER_DOWN = 'GAYVCXXXUSEAQUAXXXAQUARIUSDOWNVOTEWALLETXXXPOWEREDBYAQUA';
const MARKET_KEY_SIGNER_WEIGHT = 1;
const MARKET_KEY_THRESHOLD = 10;

const AIRDROP_2_SPONSOR = 'GDFCYDQOVJ2OEWPLEGIRQVAM3VTOQ6JDNLJTDZP5S5OGTEHM5CIWMYBH';

export const COLLECTOR_KEY = 'GAORXNBAWRIOJ7HRMCTWW2MIB6PYWSC7OKHGIXWTJXYRTZRSHP356TW3';

export enum StellarEvents {
    accountStream = 'account stream',
    handleAccountUpdate = 'handle account update',
    claimableUpdate = 'claimable update',
}

export const AQUA_CODE = 'AQUA';
export const AQUA_ISSUER = 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA';
export const yXLM_CODE = 'yXLM';
export const yXLM_ISSUER = 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55';

export const ICE_CODE = 'ICE';
export const ICE_ISSUER = 'GAXSGZ2JM3LNWOO4WRGADISNMWO4HQLG4QBGUZRKH5ZHL3EQBGX73ICE';

export const GOV_ICE_CODE = 'governICE';
export const UP_ICE_CODE = 'upvoteICE';
export const DOWN_ICE_CODE = 'downvoteICE';

export const ICE_ASSETS = [
    `${ICE_CODE}:${ICE_ISSUER}`,
    `${GOV_ICE_CODE}:${ICE_ISSUER}`,
    `${UP_ICE_CODE}:${ICE_ISSUER}`,
    `${DOWN_ICE_CODE}:${ICE_ISSUER}`,
];

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

export default class StellarServiceClass {
    server: StellarSdk.Server | null = null;
    event: EventService = new EventService();
    closeStream: () => void | null = null;
    closeEffectsStream: () => void | null = null;
    private claimableBalances: ServerApi.ClaimableBalanceRecord[] | null = null;
    private keypair: StellarSdk.Keypair | null = null;

    constructor() {
        this.startHorizonServer();
    }

    get isClaimableBalancesLoaded() {
        return this.claimableBalances !== null;
    }

    loginWithSecret(secretKey: string): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                this.keypair = StellarSdk.Keypair.fromSecret(secretKey);

                resolve(this.keypair.publicKey());
            } catch (e) {
                reject(e);
            }
        });
    }

    logoutWithSecret() {
        if (this.keypair) {
            this.keypair = null;
        }
    }

    async buildTx(
        account: StellarSdk.Account,
        operations: StellarSdk.xdr.Operation | StellarSdk.xdr.Operation[],
        memo?: StellarSdk.Memo,
    ) {
        const newAccount = await this.loadAccount(account.accountId());

        this.event.trigger({ type: StellarEvents.handleAccountUpdate, account: newAccount });

        const tx = new StellarSdk.TransactionBuilder(newAccount, {
            fee: FEE.toString(),
            networkPassphrase: StellarSdk.Networks.PUBLIC,
        }).setTimeout(TRANSACTION_TIMEOUT);

        if (Array.isArray(operations)) {
            operations.forEach((op) => {
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

    createMemo(type: MemoType, value): Memo {
        return new StellarSdk.Memo(type, value);
    }

    createAsset(code: string, issuer: string) {
        return new StellarSdk.Asset(code, issuer);
    }

    createLumen() {
        return StellarSdk.Asset.native();
    }

    isValidPublicKey(key: string): boolean {
        return StellarSdk.StrKey.isValidEd25519PublicKey(key);
    }

    submitTx(tx: StellarSdk.Transaction) {
        return this.server.submitTransaction(tx);
    }

    signWithSecret(tx: StellarSdk.Transaction) {
        tx.sign(this.keypair);
        return tx;
    }

    submitXDR(xdr: string): Promise<Horizon.SubmitTransactionResponse> {
        const tx = new StellarSdk.Transaction(xdr, StellarSdk.Networks.PUBLIC);
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
            (signer) => signer.key === account.account_id,
        ).weight;

        return (
            masterKeyWeight <
            account.thresholds[transactionThreshold as keyof Horizon.AccountThresholds]
        );
    }

    private startHorizonServer(): void {
        this.server = new StellarSdk.Server(HORIZON_SERVER.stellar);
    }

    loadAccount(publicKey: string): Promise<StellarSdk.AccountResponse> {
        if (!this.server) {
            throw new Error("Horizon server isn't started");
        }
        return this.server.loadAccount(publicKey);
    }

    resolveFederation(homeDomain: string, accountId: string): Promise<string> {
        return StellarSdk.StellarTomlResolver.resolve(homeDomain)
            .then((toml) => {
                if (!toml.FEDERATION_SERVER) {
                    throw new Error('Federation server not exists');
                }

                return toml.FEDERATION_SERVER;
            })
            .then((server) => {
                const params = new URLSearchParams();
                params.append('q', accountId);
                params.append('type', 'id');

                return axios.get(server, { params });
            })
            .then(
                (result: AxiosResponse<{ stellar_address: string }>) => result.data.stellar_address,
            );
    }

    startAccountStream(publicKey: string): void {
        this.closeStream = this.server
            .accounts()
            .accountId(publicKey)
            .cursor('now')
            .stream({
                onmessage: (result) => {
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
            .then((claimable) => {
                this.claimableBalances = claimable.records;
                this.event.trigger({ type: StellarEvents.claimableUpdate });

                if (claimable.records.length === limit) {
                    this.getNextClaimableBalances(claimable.next, limit);
                }
            });
    }

    getAquaPrice() {
        return this.server
            .orderbook(this.createAsset(AQUA_CODE, AQUA_ISSUER), this.createLumen())
            .call()
            .then((res) => {
                return (+res.asks[0].price + +res.bids[0].price) / 2;
            });
    }

    getLocks(publicKey: string) {
        if (!this.claimableBalances) {
            return null;
        }

        return this.claimableBalances.filter(
            (claim) =>
                claim.claimants.length === 1 &&
                claim.claimants[0].destination === publicKey &&
                claim.asset === `${AQUA_CODE}:${AQUA_ISSUER}`,
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
            .then((claimable) => {
                if (claimable.records.length === LOCKS_LIMIT) {
                    return this.getNextLocks(claimable.records, claimable.next, LOCKS_LIMIT);
                }
                return claimable.records;
            })
            .then((records) => {
                return records.filter(
                    (claim) =>
                        claim.claimants.length === 1 &&
                        claim.claimants[0].destination === publicKey &&
                        claim.asset === `${AQUA_CODE}:${AQUA_ISSUER}`,
                );
            });
    }

    getNextLocks(
        claims,
        next: () => Promise<ServerApi.CollectionPage<ServerApi.ClaimableBalanceRecord>>,
        limit: number,
    ): Promise<ServerApi.ClaimableBalanceRecord[]> {
        return next().then((res) => {
            if (res.records.length === limit) {
                return this.getNextLocks([...claims, ...res.records], res.next, limit);
            }

            return [...claims, ...res.records];
        });
    }

    getNextClaimableBalances(
        next: () => Promise<ServerApi.CollectionPage<ServerApi.ClaimableBalanceRecord>>,
        limit,
    ) {
        next().then((res) => {
            this.claimableBalances = [...this.claimableBalances, ...res.records];
            this.event.trigger({ type: StellarEvents.claimableUpdate });

            if (res.records.length === limit) {
                this.getNextClaimableBalances(res.next, limit);
            }
        });
    }

    startClaimableBalancesStream(publicKey: string) {
        this.getClaimableBalances(publicKey);

        this.closeEffectsStream = this.server
            .effects()
            .forAccount(publicKey)
            .cursor('now')
            .stream({
                onmessage: (res) => {
                    if (
                        (res as unknown as ServerApi.EffectRecord).type ===
                            'claimable_balance_claimant_created' ||
                        (res as unknown as ServerApi.EffectRecord).type ===
                            'claimable_balance_claimed' ||
                        (res as unknown as ServerApi.EffectRecord).type ===
                            'claimable_balance_created'
                    ) {
                        this.getClaimableBalances(publicKey);
                    }
                    if ((res as unknown as ServerApi.EffectRecord).type === 'account_debited') {
                        const { amount, asset_type, asset_code } = res as any;

                        ToastService.showSuccessToast(
                            `Payment sent: ${formatBalance(amount)} ${
                                asset_type === 'native' ? 'XLM' : asset_code
                            }`,
                        );
                    }

                    if ((res as unknown as ServerApi.EffectRecord).type === 'account_credited') {
                        const { amount, asset_type, asset_code } = res as any;

                        ToastService.showSuccessToast(
                            `Payment received: ${formatBalance(amount)} ${
                                asset_type === 'native' ? 'XLM' : asset_code
                            }`,
                        );
                    }
                },
            });
    }

    closeClaimableBalancesStream(): void {
        if (this.closeEffectsStream) {
            this.closeEffectsStream();
            this.claimableBalances = null;
            this.event.trigger({ type: StellarEvents.claimableUpdate });
        }
    }

    async getAccountOffers(publicKey: string): Promise<ServerApi.OfferRecord[]> {
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
            const hasMarker = claim.claimants.some(
                (claimant) => claimant.destination === marketKey,
            );
            const hasSelfClaim = claim.claimants.some(
                (claimant) => claimant.destination === accountId,
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
                (claimant) => claimant.destination === proposal.vote_for_issuer,
            );
            const hasAgainstMarker = claim.claimants.some(
                (claimant) => claimant.destination === proposal.vote_against_issuer,
            );
            const selfClaim = claim.claimants.find(
                (claimant) => claimant.destination === accountId,
            );
            const isAqua = claim.asset === `${AQUA_CODE}:${AQUA_ISSUER}`;
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
                (claimant) => claimant.destination === pair.account_id,
            );
            const hasDownMarker = claim.claimants.some(
                (claimant) => claimant.destination === pair.downvote_account_id,
            );
            const selfClaim = claim.claimants.find(
                (claimant) => claimant.destination === accountId,
            );
            const isAqua = claim.asset === `${AQUA_CODE}:${AQUA_ISSUER}`;
            const isUpIce = claim.asset === `${UP_ICE_CODE}:${ICE_ISSUER}`;
            const isDownIce = claim.asset === `${DOWN_ICE_CODE}:${ICE_ISSUER}`;

            if (
                (hasUpMarker || hasDownMarker) &&
                Boolean(selfClaim) &&
                (isAqua || isUpIce || isDownIce)
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

    getAquaInLiquidityVotes(accountId: string): Promise<number> {
        if (!this.claimableBalances) {
            return Promise.resolve(null);
        }

        const keys = this.getKeysSimilarToMarketKeys(accountId);

        return validateMarketKeys(keys).then((marketPairs) => {
            return this.claimableBalances.reduce((acc, claim) => {
                if (claim.claimants.length !== 2) {
                    return acc;
                }
                const hasUpMarker = claim.claimants.some((claimant) =>
                    Boolean(marketPairs.find((pair) => pair.account_id === claimant.destination)),
                );

                const hasDownMarker = claim.claimants.some((claimant) =>
                    Boolean(
                        marketPairs.find(
                            (pair) => pair.downvote_account_id === claimant.destination,
                        ),
                    ),
                );

                const selfClaim = claim.claimants.find(
                    (claimant) => claimant.destination === accountId,
                );
                const isAqua = claim.asset === `${AQUA_CODE}:${AQUA_ISSUER}`;

                if ((hasUpMarker || hasDownMarker) && Boolean(selfClaim) && isAqua) {
                    acc += Number(claim.amount);
                }
                return acc;
            }, 0);
        });
    }

    getAirdrop2Claims() {
        if (!this.claimableBalances) {
            return null;
        }

        return this.claimableBalances.filter((cb) => cb.sponsor === AIRDROP_2_SPONSOR);
    }

    getKeysSimilarToMarketKeys(accountId: string): string[] {
        if (!this.claimableBalances) {
            return null;
        }

        return this.claimableBalances.reduce((acc, claim) => {
            if (claim.claimants.length !== 2) {
                return acc;
            }
            const isAqua = claim.asset === `${AQUA_CODE}:${AQUA_ISSUER}`;
            const isUpIce = claim.asset === `${UP_ICE_CODE}:${ICE_ISSUER}`;
            const isDownIce = claim.asset === `${DOWN_ICE_CODE}:${ICE_ISSUER}`;
            const hasSelfClaim = claim.claimants.some(
                (claimant) => claimant.destination === accountId,
            );
            if ((isAqua || isUpIce || isDownIce) && hasSelfClaim) {
                const similarToMarketKey = claim.claimants.find(
                    (claimant) => claimant.destination !== accountId,
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
        prevBalances: Horizon.BalanceLineAsset[],
        newBalances: Horizon.BalanceLineAsset[],
    ): boolean {
        if (prevBalances.length !== newBalances.length) {
            return true;
        }

        return prevBalances.reduce((acc, balance) => {
            if (acc) {
                return acc;
            }
            const hasNewEqualBalance = newBalances.find(
                (newBalance) =>
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
            asset: asset ?? new StellarSdk.Asset(AQUA_CODE, AQUA_ISSUER),
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
        if (!ICE_ASSETS.includes(`${asset.code}:${asset.issuer}`)) {
            return tx;
        }

        const endpoint = this.getIceApproveEndpoint(asset);

        return axios
            .post<{ status: string; tx: string }>(endpoint, { tx: tx.toEnvelope().toXDR('base64') })
            .then(({ data }) => {
                if (data.status !== 'revised') {
                    throw new Error('Incorrect status');
                }
                return new StellarSdk.Transaction(data.tx, StellarSdk.Networks.PUBLIC);
            });
    }

    private getIceApproveEndpoint(asset) {
        if (asset.code === ICE_CODE && asset.issuer === ICE_ISSUER) {
            return 'https://ice-approval.aqua.network/api/v1/ice/tx-approve/';
        }
        if (asset.code === UP_ICE_CODE && asset.issuer === ICE_ISSUER) {
            return 'https://ice-approval.aqua.network/api/v2/upvote-ice/tx-approve/';
        }
        if (asset.code === DOWN_ICE_CODE && asset.issuer === ICE_ISSUER) {
            return 'https://ice-approval.aqua.network/api/v2/downvote-ice/tx-approve/';
        }
        if (asset.code === GOV_ICE_CODE && asset.issuer === ICE_ISSUER) {
            return 'https://ice-approval.aqua.network/api/v1/govern-ice/tx-approve/';
        }

        throw new Error('Unknown asset');
    }

    createLockOperation(publicKey, amount, timestamp) {
        const time = Math.ceil(timestamp / 1000);
        return StellarSdk.Operation.createClaimableBalance({
            source: publicKey,
            amount: amount.toString(),
            asset: new StellarSdk.Asset(AQUA_CODE, AQUA_ISSUER),
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

    async getLiquidityPoolForAccount(id: string, limit): Promise<ServerApi.LiquidityPoolRecord[]> {
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
        const { records, next } = nextRequest();

        if (records.length === limit) {
            return this.nextRequest([...previousRecords, records], next, limit);
        }

        return Promise.resolve([...previousRecords, ...records]);
    }

    createBurnAquaOperation(amount: string) {
        return StellarSdk.Operation.payment({
            amount,
            asset: new StellarSdk.Asset(AQUA_CODE, AQUA_ISSUER),
            destination: AQUA_ISSUER,
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
            fee: FEE,
            networkPassphrase: StellarSdk.Networks.PUBLIC,
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

    createClaimOperations(claimId: string, withTrust?: boolean) {
        const ops = [];

        if (withTrust) {
            const trustOp = StellarSdk.Operation.changeTrust({
                asset: new StellarSdk.Asset(AQUA_CODE, AQUA_ISSUER),
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
            asset: new StellarSdk.Asset(asset.code, asset.issuer),
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

    getAquaEquivalent(asset, amount) {
        return this.server
            .strictSendPaths(asset, amount, [new StellarSdk.Asset(AQUA_CODE, AQUA_ISSUER)])
            .call()
            .then((res) => {
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

    getTradeAggregations(base, counter, startDate, endDate, resolution, limit) {
        return this.server
            .tradeAggregation(base, counter, startDate, endDate, resolution, 0)
            .limit(limit)
            .order('desc')
            .call();
    }

    getLumenUsdPrice(): Promise<number> {
        return axios.get<any>('https://api.stellarterm.com/v1/ticker.json').then(({ data }) => {
            return data._meta.externalPrices.USD_XLM;
        });
    }

    getLiquidityPoolData(
        base: StellarSdk.Asset,
        counter: StellarSdk.Asset,
    ): Promise<ServerApi.LiquidityPoolRecord | null> {
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
}
