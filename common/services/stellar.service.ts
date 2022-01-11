import * as StellarSdk from 'stellar-sdk';
import EventService from './event.service';
import { Horizon } from 'stellar-sdk/lib/horizon_api';
import { Memo, MemoType, OperationOptions, ServerApi } from 'stellar-sdk';
import { ToastService } from './globalServices';
import axios, { AxiosResponse } from 'axios';

enum HORIZON_SERVER {
    stellar = 'https://horizon.stellar.org',
    lobstr = 'https://horizon.stellar.lobstr.co',
}

const FEE = '100000';
const TRANSACTION_TIMEOUT = 60 * 60 * 24 * 30;
const MARKET_KEY_MARKER_UP = 'GA2UB7VXXXUSEAQUAXXXAQUARIUSVOTINGWALLETXXXPOWEREDBYAQUA';
const MARKET_KEY_MARKER_DOWN = 'GAYVCXXXUSEAQUAXXXAQUARIUSDOWNVOTEWALLETXXXPOWEREDBYAQUA';
const MARKET_KEY_SIGNER_WEIGHT = 1;
const MARKET_KEY_THRESHOLD = 10;

export enum StellarEvents {
    accountStream = 'account stream',
    handleAccountUpdate = 'handle account update',
    claimableUpdate = 'claimable update',
}

export const AQUA_CODE = 'AQUA';
export const AQUA_ISSUER = 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA';
export const yXLM_CODE = 'yXLM';
export const yXLM_ISSUER = 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55';

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

export const START_AIRDROP2_TIMESTAMP = new Date('2022-01-15T00:00:00Z').getTime();

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

    signAndSubmit(
        tx: StellarSdk.Transaction,
        account: Partial<Horizon.AccountResponse>,
    ): Promise<Horizon.SubmitTransactionResponse> {
        tx.sign(this.keypair);
        if (this.isMoreSignaturesNeeded(tx, account)) {
            ToastService.showErrorToast('Accounts with multisig are not supported yet');
            return Promise.reject();
        }
        return this.server.submitTransaction(tx);
    }

    submitXDR(xdr: string): Promise<Horizon.SubmitTransactionResponse> {
        const tx = new StellarSdk.Transaction(xdr, StellarSdk.Networks.PUBLIC);
        return this.server.submitTransaction(tx);
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

            if (usedThreshold === [THRESHOLDS.UNKNOWN]) {
                throw new Error('unknown operation');
            }

            if (usedThreshold === [THRESHOLDS.MULTIPLE]) {
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
            .sponsor(publicKey)
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

    getAccountLocks(publicKey: string) {
        return this.server
            .claimableBalances()
            .sponsor(publicKey)
            .claimant(publicKey)
            .order('desc')
            .limit(200)
            .call()
            .then((claimable) => {
                return claimable.records.filter(
                    (claim) =>
                        claim.claimants.length === 1 &&
                        claim.claimants[0].destination === publicKey &&
                        claim.asset === `${AQUA_CODE}:${AQUA_ISSUER}` &&
                        new Date(claim.claimants[0].predicate?.not?.abs_before).getTime() >
                            START_AIRDROP2_TIMESTAMP,
                );
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

    getMarketVotesValue(marketKey: string, accountId: string) {
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
            const isAqua = claim.asset === `${AQUA_CODE}:${AQUA_ISSUER}`;

            if (hasMarker && hasSelfClaim && isAqua) {
                acc += Number(claim.amount);
            }
            return acc;
        }, 0);
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
            const hasSelfClaim = claim.claimants.some(
                (claimant) => claimant.destination === accountId,
            );
            if (isAqua && hasSelfClaim) {
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

    createVoteOperation(publicKey, marketKey, amount, timestamp) {
        const time = Math.ceil(timestamp / 1000);
        return StellarSdk.Operation.createClaimableBalance({
            source: publicKey,
            amount: amount.toString(),
            asset: new StellarSdk.Asset(AQUA_CODE, AQUA_ISSUER),
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
            return this.nextLiquidityPools(records, next, limit);
        }

        return Promise.resolve(records);
    }

    async nextLiquidityPools(previousRecords, nextRequest, limit) {
        const { records, next } = nextRequest();

        if (records.length === limit) {
            return this.nextLiquidityPools([...previousRecords, records], next, limit);
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
}
