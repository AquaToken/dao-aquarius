import * as StellarSdk from '@stellar/stellar-sdk';
import { xdr, Asset, Keypair, StrKey, rpc } from '@stellar/stellar-sdk';
import BigNumber from 'bignumber.js';

import {
    AMM_CONTRACT_METHOD,
    ASSET_CONTRACT_METHOD,
    BATCH_CONTRACT_METHOD,
    CONTRACTS,
} from 'constants/soroban';
import { ACCOUNT_FOR_SIMULATE, BASE_FEE } from 'constants/stellar';

import { getAssetString } from 'helpers/assets';
import { getEnv, getNetworkPassphrase } from 'helpers/env';
import { SorobanErrorHandler, SorobanPrepareTxErrorHandler } from 'helpers/error-handler';
import { getTokensFromCache } from 'helpers/swap';
import { getSorobanUrl } from 'helpers/url';

import { PoolRewardsInfo } from 'types/amm';
import { ClassicToken, SorobanToken, Token, TokenType } from 'types/token';

import RestoreContractModal from 'web/modals/RestoreContractModal';

import { ModalService, StellarService } from './globalServices';

const AMM_SMART_CONTRACT_ID = CONTRACTS[getEnv()].amm;
const BATCH_SMART_CONTRACT_ID = CONTRACTS[getEnv()].batch;

export enum CONTRACT_STATUS {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    NOT_FOUND = 'not_found',
}

export enum POOL_TYPE {
    stable = 'stable',
    constant = 'constant_product',
    classic = 'classic',
}

export default class SorobanServiceClass {
    server: StellarSdk.rpc.Server | null = null;
    keypair: Keypair | null = null;
    tokensCache = new Map<string, Token>();

    constructor() {
        this.startServer();

        const cached = getTokensFromCache();

        if (cached) {
            cached.forEach(token => {
                this.tokensCache.set(token.contract, token);
            });
        }
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

    processResponse(response: rpc.Api.SendTransactionResponse) {
        if (response.status === 'TRY_AGAIN_LATER') {
            throw new Error('Try again later');
        }
        if (response.status === 'DUPLICATE') {
            return this.pollTx(response.hash);
        }
        if (response.status !== 'PENDING') {
            throw new Error(SorobanErrorHandler(response.errorResult.result().switch().name));
        }
        return this.pollTx(response.hash);
    }

    pollTx<T>(
        hash: string,
    ): Promise<
        T | rpc.Api.GetFailedTransactionResponse | rpc.Api.GetMissingTransactionResponse | xdr.ScVal
    > {
        return this.server
            .pollTransaction(hash, {
                attempts: 30,
                sleepStrategy: () => 2000,
            })
            .then(res => {
                if (res.status === 'SUCCESS') {
                    return res.returnValue;
                }
                throw new Error(
                    'Transaction failed because of timeout. Please make another attempt.',
                );
            });
    }

    async tryRestore(tx: StellarSdk.Transaction) {
        const sim = await this.server.simulateTransaction(tx);

        if (!(sim as StellarSdk.rpc.Api.SimulateTransactionRestoreResponse).restorePreamble) {
            return Promise.resolve();
        }

        const account = await this.server.getAccount(tx.source);
        let fee = parseInt(BASE_FEE);

        fee += parseInt(
            (sim as StellarSdk.rpc.Api.SimulateTransactionRestoreResponse).restorePreamble
                .minResourceFee,
        );

        const restoreTx = new StellarSdk.TransactionBuilder(account, { fee: fee.toString() })
            .setNetworkPassphrase(getNetworkPassphrase())
            .setSorobanData(
                (
                    sim as StellarSdk.rpc.Api.SimulateTransactionRestoreResponse
                ).restorePreamble.transactionData.build(),
            )
            .addOperation(StellarSdk.Operation.restoreFootprint({}))
            .setTimeout(StellarSdk.TimeoutInfinite)
            .build();

        ModalService.openModal(RestoreContractModal, { tx: restoreTx });

        return Promise.reject({ message: 'Something expired' });
    }

    getAssetContractId(asset: Asset): string {
        return asset.contractId(getNetworkPassphrase());
    }

    parseTokenContractId(contractId: string): Promise<Token> {
        if (this.tokensCache.has(contractId)) {
            return Promise.resolve(this.tokensCache.get(contractId));
        }

        if (contractId === StellarService.createLumen().contractId(getNetworkPassphrase())) {
            const lumen: ClassicToken = StellarService.createLumen() as ClassicToken;
            lumen.type = TokenType.classic;
            lumen.contract = contractId;
            lumen.decimal = 7;
            return Promise.resolve(lumen);
        }

        const nameCall = this.scValToArray([
            this.contractIdToScVal(contractId),
            xdr.ScVal.scvSymbol(ASSET_CONTRACT_METHOD.NAME),
            this.scValToArray([]),
        ]);

        const symbolCall = this.scValToArray([
            this.contractIdToScVal(contractId),
            xdr.ScVal.scvSymbol(ASSET_CONTRACT_METHOD.SYMBOL),
            this.scValToArray([]),
        ]);

        const decimalCall = this.scValToArray([
            this.contractIdToScVal(contractId),
            xdr.ScVal.scvSymbol(ASSET_CONTRACT_METHOD.DECIMALS),
            this.scValToArray([]),
        ]);

        const batchCalls = this.scValToArray([nameCall, symbolCall, decimalCall]);

        return this.buildSmartContractTx(
            ACCOUNT_FOR_SIMULATE,
            BATCH_SMART_CONTRACT_ID,
            BATCH_CONTRACT_METHOD.batch,
            this.scValToArray([this.publicKeyToScVal(ACCOUNT_FOR_SIMULATE)]),
            batchCalls,
            xdr.ScVal.scvBool(true),
        )
            .then(
                tx =>
                    this.simulateTx(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => {
                const [name, symbol, decimal] = (
                    result.retval.value() as { value: () => unknown }[]
                ).map(val => val.value().toString());

                const [code, issuer] = name.split(':');

                try {
                    const asset: ClassicToken = StellarService.createAsset(
                        code,
                        issuer,
                    ) as ClassicToken;

                    if (asset.contractId(getNetworkPassphrase()) !== contractId) {
                        throw new Error();
                    }

                    asset.type = TokenType.classic;
                    asset.contract = contractId;
                    asset.decimal = 7;

                    return asset;
                } catch {
                    return {
                        type: TokenType.soroban,
                        contract: contractId,
                        name,
                        code: symbol,
                        decimal: Number(decimal),
                    };
                }
            });
    }

    getAssetFromContractId(id: string): Promise<Asset> {
        // if (this.assetsCache.has(id)) {
        //     return Promise.resolve(this.assetsCache.get(id));
        // }
        return this.buildSmartContractTx(ACCOUNT_FOR_SIMULATE, id, ASSET_CONTRACT_METHOD.NAME)
            .then(
                tx =>
                    this.simulateTx(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => {
                const [code, issuer] = (result.retval.value() as unknown).toString().split(':');
                const asset = issuer
                    ? StellarService.createAsset(code, issuer)
                    : StellarService.createLumen();

                // this.assetsCache.set(id, asset);

                return asset;
            });
    }

    getContractData(
        contractId: string,
    ): Promise<{ status: CONTRACT_STATUS; ledgersBeforeExpire: number }> {
        const contractIdBuffer: Buffer = StrKey.decodeContract(contractId);

        const contractKey: xdr.LedgerKey = xdr.LedgerKey.contractData(
            new xdr.LedgerKeyContractData({
                contract: xdr.ScAddress.scAddressTypeContract(contractIdBuffer),
                key: xdr.ScVal.scvLedgerKeyContractInstance(),
                durability: xdr.ContractDataDurability.persistent(),
            }),
        );

        return this.server
            .getLedgerEntries(contractKey)
            .then(({ entries, latestLedger }) => {
                if (!entries?.length) {
                    return {
                        status: CONTRACT_STATUS.NOT_FOUND,
                        ledgersBeforeExpire: 0,
                    };
                }

                const [entry] = entries;

                const contractExp = entry.liveUntilLedgerSeq;

                return {
                    status:
                        contractExp > latestLedger
                            ? CONTRACT_STATUS.ACTIVE
                            : CONTRACT_STATUS.EXPIRED,
                    ledgersBeforeExpire: Math.max(contractExp - latestLedger, 0),
                };
            })
            .catch(e => {
                console.log(e);
                return {
                    status: CONTRACT_STATUS.NOT_FOUND,
                    ledgersBeforeExpire: 0,
                };
            });
    }

    deployAssetContractTx(publicKey: string, asset: Asset) {
        return this.server
            .getAccount(publicKey)
            .then(acc => {
                const tx = new StellarSdk.TransactionBuilder(acc, {
                    fee: BASE_FEE,
                    networkPassphrase: getNetworkPassphrase(),
                });

                tx.addOperation(
                    StellarSdk.Operation.createStellarAssetContract({
                        asset,
                    }),
                );

                return tx.setTimeout(StellarSdk.TimeoutInfinite).build();
            })
            .then(tx => this.prepareTransaction(tx));
    }

    getInitConstantPoolTx(accountId: string, base: Token, counter: Token, fee: number, createInfo) {
        const args = [
            this.publicKeyToScVal(accountId),
            this.scValToArray(
                this.orderTokens([base, counter]).map(asset =>
                    this.contractIdToScVal(asset.contract),
                ),
            ),
            this.amountToUint32(fee),
        ];

        const operation = StellarSdk.Operation.invokeContractFunction({
            contract: AMM_SMART_CONTRACT_ID,
            function: AMM_CONTRACT_METHOD.INIT_CONSTANT_POOL,
            args,
            auth: [
                new xdr.SorobanAuthorizationEntry({
                    credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
                    rootInvocation: new xdr.SorobanAuthorizedInvocation({
                        function:
                            xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                                new xdr.InvokeContractArgs({
                                    contractAddress:
                                        this.contractIdToScVal(AMM_SMART_CONTRACT_ID).address(),
                                    functionName: AMM_CONTRACT_METHOD.INIT_CONSTANT_POOL,
                                    args,
                                }),
                            ),
                        subInvocations: [
                            new xdr.SorobanAuthorizedInvocation({
                                function:
                                    xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                                        new xdr.InvokeContractArgs({
                                            functionName: ASSET_CONTRACT_METHOD.TRANSFER,
                                            contractAddress: this.assetToScVal(
                                                createInfo.token,
                                            ).address(),
                                            args: [
                                                this.publicKeyToScVal(accountId),
                                                this.contractIdToScVal(createInfo.destination),
                                                this.amountToInt128(createInfo.constantFee),
                                            ],
                                        }),
                                    ),
                                subInvocations: [],
                            }),
                        ],
                    }),
                }),
            ],
        });

        return this.buildSmartContractTxFromOp(accountId, operation).then(tx =>
            this.prepareTransaction(tx),
        );
    }

    getInitStableSwapPoolTx(accountId: string, assets: Token[], fee: number, createInfo) {
        const args = [
            this.publicKeyToScVal(accountId),
            this.scValToArray(
                this.orderTokens(assets).map(asset => this.contractIdToScVal(asset.contract)),
            ),
            this.amountToUint32(fee * 100),
        ];

        const transferInvocation = new xdr.SorobanAuthorizedInvocation({
            function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                new xdr.InvokeContractArgs({
                    functionName: ASSET_CONTRACT_METHOD.TRANSFER,
                    contractAddress: this.assetToScVal(createInfo.token).address(),
                    args: [
                        this.publicKeyToScVal(accountId),
                        this.contractIdToScVal(createInfo.destination),
                        this.amountToInt128(createInfo.stableFee),
                    ],
                }),
            ),
            subInvocations: [],
        });

        const rootInvocation = new xdr.SorobanAuthorizationEntry({
            credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
            rootInvocation: new xdr.SorobanAuthorizedInvocation({
                function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                    new xdr.InvokeContractArgs({
                        contractAddress: this.contractIdToScVal(AMM_SMART_CONTRACT_ID).address(),
                        functionName: AMM_CONTRACT_METHOD.INIT_STABLESWAP_POOL,
                        args,
                    }),
                ),
                subInvocations: [transferInvocation],
            }),
        });

        const operation = StellarSdk.Operation.invokeContractFunction({
            contract: AMM_SMART_CONTRACT_ID,
            function: AMM_CONTRACT_METHOD.INIT_STABLESWAP_POOL,
            args,
            auth: [rootInvocation],
        });

        return this.buildSmartContractTxFromOp(accountId, operation).then(tx =>
            this.prepareTransaction(tx),
        );
    }

    parsePoolRewards(value): PoolRewardsInfo {
        return value.reduce((acc, val) => {
            const key = val.key().value().toString();
            if (key === 'exp_at' || key === 'last_time') {
                acc[key] = new BigNumber(this.i128ToInt(val.val()).toString())
                    .times(1e7)
                    .toNumber();
                return acc;
            }
            acc[key] = this.i128ToInt(val.val());
            return acc;
        }, {}) as PoolRewardsInfo;
    }

    getPoolRewards(accountId: string, poolId: string): Promise<PoolRewardsInfo> {
        return this.buildSmartContractTx(
            accountId,
            poolId,
            AMM_CONTRACT_METHOD.GET_REWARDS_INFO,
            this.publicKeyToScVal(accountId),
        )
            .then(
                tx =>
                    this.server.simulateTransaction(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => {
                if (result) {
                    return this.parsePoolRewards(result.retval.value());
                }

                throw new Error('getPoolRewards error');
            });
    }

    getPoolsRewards(accountId: string, pools: string[]) {
        const batches = pools.map(pool =>
            this.scValToArray([
                this.contractIdToScVal(pool),
                xdr.ScVal.scvSymbol(AMM_CONTRACT_METHOD.GET_REWARDS_INFO),
                this.scValToArray([this.publicKeyToScVal(accountId)]),
            ]),
        );

        return this.buildSmartContractTx(
            accountId,
            BATCH_SMART_CONTRACT_ID,
            BATCH_CONTRACT_METHOD.batch,
            this.scValToArray([this.publicKeyToScVal(accountId)]),
            this.scValToArray(batches),
            xdr.ScVal.scvBool(true),
        )
            .then(tx => this.simulateTx(tx))
            .then(res => {
                if (!(res as StellarSdk.rpc.Api.SimulateTransactionSuccessResponse).result) {
                    throw new Error('getPoolsRewards error');
                }

                const retValArr = (
                    res as StellarSdk.rpc.Api.SimulateTransactionSuccessResponse
                ).result.retval.value() as unknown[];

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                return retValArr.map(val => this.parsePoolRewards(val.value()));
            });
    }

    getTotalShares(poolId: string) {
        return this.buildSmartContractTx(
            ACCOUNT_FOR_SIMULATE,
            poolId,
            AMM_CONTRACT_METHOD.GET_TOTAL_SHARES,
        )
            .then(
                tx =>
                    this.server.simulateTransaction(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => {
                if (result) {
                    return this.i128ToInt(result.retval);
                }

                throw new Error('getTotalShares error');
            });
    }

    getClaimRewardsTx(accountId: string, poolId: string) {
        return this.buildSmartContractTx(
            accountId,
            poolId,
            AMM_CONTRACT_METHOD.CLAIM,
            this.publicKeyToScVal(accountId),
        ).then(tx => this.prepareTransaction(tx));
    }

    getClaimBatchTx(accountId: string, pools: string[]) {
        const batches = pools.map(pool =>
            this.scValToArray([
                this.contractIdToScVal(pool),
                xdr.ScVal.scvSymbol(AMM_CONTRACT_METHOD.CLAIM),
                this.scValToArray([this.publicKeyToScVal(accountId)]),
            ]),
        );

        return this.buildSmartContractTx(
            accountId,
            BATCH_SMART_CONTRACT_ID,
            BATCH_CONTRACT_METHOD.batch,
            this.scValToArray([this.publicKeyToScVal(accountId)]),
            this.scValToArray(batches),
            xdr.ScVal.scvBool(false),
        ).then(tx => this.prepareTransaction(tx));
    }

    async getWithdrawAndClaim(
        accountId: string,
        poolAddress: string,
        shareAmount: string,
        assets: Token[],
        shareAddress: string,
    ): Promise<StellarSdk.Transaction> {
        const withdrawArgs = [
            this.publicKeyToScVal(accountId),
            this.amountToUint128(shareAmount),
            this.scValToArray(assets.map(() => this.amountToUint128('0.0000001'))),
        ];

        const withdrawCall = this.scValToArray([
            this.contractIdToScVal(poolAddress),
            xdr.ScVal.scvSymbol(AMM_CONTRACT_METHOD.WITHDRAW),
            this.scValToArray(withdrawArgs),
        ]);

        const claimCall = this.scValToArray([
            this.contractIdToScVal(poolAddress),
            xdr.ScVal.scvSymbol(AMM_CONTRACT_METHOD.CLAIM),
            this.scValToArray([this.publicKeyToScVal(accountId)]),
        ]);

        const batchCalls = [withdrawCall, claimCall];

        const burnAuth = new xdr.SorobanAuthorizedInvocation({
            function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                new xdr.InvokeContractArgs({
                    functionName: ASSET_CONTRACT_METHOD.BURN,
                    contractAddress: this.contractIdToScVal(shareAddress).address(),
                    args: [this.publicKeyToScVal(accountId), this.amountToInt128(shareAmount)],
                }),
            ),
            subInvocations: [],
        });

        const withdrawAuthInvocation = new xdr.SorobanAuthorizedInvocation({
            function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                new xdr.InvokeContractArgs({
                    contractAddress: this.contractIdToScVal(poolAddress).address(),
                    functionName: AMM_CONTRACT_METHOD.WITHDRAW,
                    args: withdrawArgs,
                }),
            ),
            subInvocations: [burnAuth],
        });

        const claimAuthInvocation = new xdr.SorobanAuthorizedInvocation({
            function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                new xdr.InvokeContractArgs({
                    contractAddress: this.contractIdToScVal(poolAddress).address(),
                    functionName: AMM_CONTRACT_METHOD.CLAIM,
                    args: [this.publicKeyToScVal(accountId)],
                }),
            ),
            subInvocations: [],
        });

        const rootInvocation = new xdr.SorobanAuthorizedInvocation({
            function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                new xdr.InvokeContractArgs({
                    contractAddress: this.contractIdToScVal(BATCH_SMART_CONTRACT_ID).address(),
                    functionName: BATCH_CONTRACT_METHOD.batch,
                    args: [
                        this.scValToArray([this.publicKeyToScVal(accountId)]),
                        this.scValToArray(batchCalls),
                        xdr.ScVal.scvBool(true),
                    ],
                }),
            ),
            subInvocations: [withdrawAuthInvocation, claimAuthInvocation],
        });

        const batchAuth = new xdr.SorobanAuthorizationEntry({
            credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
            rootInvocation,
        });

        const batchOperation = StellarSdk.Operation.invokeContractFunction({
            contract: BATCH_SMART_CONTRACT_ID,
            function: BATCH_CONTRACT_METHOD.batch,
            args: [
                this.scValToArray([this.publicKeyToScVal(accountId)]),
                this.scValToArray(batchCalls),
                xdr.ScVal.scvBool(true),
            ],
            auth: [batchAuth],
        });

        const tx = await this.buildSmartContractTxFromOp(accountId, batchOperation);
        return this.prepareTransaction(tx);
    }

    getCreationFeeToken() {
        return this.buildSmartContractTx(
            ACCOUNT_FOR_SIMULATE,
            AMM_SMART_CONTRACT_ID,
            AMM_CONTRACT_METHOD.GET_CREATION_FEE_TOKEN,
        )
            .then(
                tx =>
                    this.simulateTx(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) =>
                this.getAssetFromContractId(StellarSdk.scValToNative(result.retval)),
            );
    }

    getCreationFee(type: POOL_TYPE) {
        return this.buildSmartContractTx(
            ACCOUNT_FOR_SIMULATE,
            AMM_SMART_CONTRACT_ID,
            type === POOL_TYPE.constant
                ? AMM_CONTRACT_METHOD.GET_CONSTANT_CREATION_FEE
                : AMM_CONTRACT_METHOD.GET_STABLE_CREATION_FEE,
        )
            .then(
                tx =>
                    this.simulateTx(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => this.i128ToInt(result.retval));
    }

    getCreationFeeAddress() {
        return this.buildSmartContractTx(
            ACCOUNT_FOR_SIMULATE,
            AMM_SMART_CONTRACT_ID,
            AMM_CONTRACT_METHOD.GET_INIT_POOL_DESTINATION,
        )
            .then(
                tx =>
                    this.simulateTx(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) =>
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                StellarSdk.StrKey.encodeContract(result.retval.value().value()),
            );
    }

    getCreationFeeInfo() {
        return Promise.all([
            this.getCreationFeeToken(),
            this.getCreationFee(POOL_TYPE.constant),
            this.getCreationFee(POOL_TYPE.stable),
            this.getCreationFeeAddress(),
        ]).then(([token, constantFee, stableFee, destination]) => ({
            token,
            constantFee,
            stableFee,
            destination,
        }));
    }

    getTokenDecimals(contactId: string): Promise<number> {
        return this.buildSmartContractTx(
            ACCOUNT_FOR_SIMULATE,
            contactId,
            ASSET_CONTRACT_METHOD.DECIMALS,
        )
            .then(
                tx =>
                    this.server.simulateTransaction(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => Number(result.retval.value()));
    }

    async getTokenBalance(token: Asset | string, where: string) {
        const tokenContact = typeof token === 'string' ? token : this.getAssetContractId(token);
        const tokenDecimals = await this.getTokenDecimals(tokenContact);

        const tx = await this.buildSmartContractTx(
            ACCOUNT_FOR_SIMULATE,
            tokenContact,
            ASSET_CONTRACT_METHOD.GET_BALANCE,
            StellarSdk.StrKey.isValidEd25519PublicKey(where)
                ? this.publicKeyToScVal(where)
                : this.contractIdToScVal(where),
        );

        const result = (await this.server.simulateTransaction(
            tx,
        )) as StellarSdk.rpc.Api.SimulateTransactionSuccessResponse;

        if (result.result) {
            return this.i128ToInt(result.result.retval, tokenDecimals);
        }

        return null;
    }

    getPoolReserves(assets: Token[], poolId: string) {
        return this.buildSmartContractTx(
            ACCOUNT_FOR_SIMULATE,
            poolId,
            AMM_CONTRACT_METHOD.GET_RESERVES,
        )
            .then(
                tx =>
                    this.simulateTx(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => {
                if (result) {
                    return this.orderTokens(assets).reduce((acc, asset, index) => {
                        acc.set(
                            getAssetString(asset),
                            this.i128ToInt(
                                result.retval.value()[index],
                                (assets[index] as SorobanToken).decimal,
                            ),
                        );
                        return acc;
                    }, new Map());
                }

                throw new Error('getPoolPrice fail');
            });
    }

    getDepositTx(
        accountId: string,
        poolAddress: string,
        assets: Token[],
        amounts: Map<string, string>,
    ) {
        const args = [
            this.publicKeyToScVal(accountId),
            this.scValToArray(
                this.orderTokens(assets).map(asset =>
                    this.amountToUint128(
                        amounts.get(getAssetString(asset)),
                        (asset as SorobanToken).decimal,
                    ),
                ),
            ),
            this.amountToUint128('0.0000001'),
        ];

        const transferInvocations = this.orderTokens(assets).map(
            asset =>
                new xdr.SorobanAuthorizedInvocation({
                    function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                        new xdr.InvokeContractArgs({
                            functionName: ASSET_CONTRACT_METHOD.TRANSFER,
                            contractAddress: this.contractIdToScVal(asset.contract).address(),
                            args: [
                                this.publicKeyToScVal(accountId),
                                this.contractIdToScVal(poolAddress),
                                this.amountToInt128(
                                    amounts.get(getAssetString(asset)),
                                    (asset as SorobanToken).decimal,
                                ),
                            ],
                        }),
                    ),
                    subInvocations: [],
                }),
        );

        const rootInvocation = new xdr.SorobanAuthorizationEntry({
            credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
            rootInvocation: new xdr.SorobanAuthorizedInvocation({
                function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                    new xdr.InvokeContractArgs({
                        contractAddress: this.contractIdToScVal(poolAddress).address(),
                        functionName: AMM_CONTRACT_METHOD.DEPOSIT,
                        args,
                    }),
                ),
                subInvocations: transferInvocations,
            }),
        });

        const operation = StellarSdk.Operation.invokeContractFunction({
            contract: poolAddress,
            function: AMM_CONTRACT_METHOD.DEPOSIT,
            args,
            auth: [rootInvocation],
        });

        return this.buildSmartContractTxFromOp(accountId, operation).then(tx =>
            this.prepareTransaction(tx),
        );
    }

    getWithdrawTx(
        accountId: string,
        poolAddress: string,
        shareAmount: string,
        assets: Token[],
        shareAddress: string,
    ): Promise<StellarSdk.Transaction> {
        const args = [
            this.publicKeyToScVal(accountId),
            this.amountToUint128(shareAmount),
            this.scValToArray(assets.map(() => this.amountToUint128('0.0000001'))),
        ];

        const burnInvocation = new xdr.SorobanAuthorizedInvocation({
            function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                new xdr.InvokeContractArgs({
                    functionName: ASSET_CONTRACT_METHOD.BURN,
                    contractAddress: this.contractIdToScVal(shareAddress).address(),
                    args: [this.publicKeyToScVal(accountId), this.amountToInt128(shareAmount)],
                }),
            ),
            subInvocations: [],
        });

        const rootInvocation = new xdr.SorobanAuthorizationEntry({
            credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
            rootInvocation: new xdr.SorobanAuthorizedInvocation({
                function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                    new xdr.InvokeContractArgs({
                        contractAddress: this.contractIdToScVal(poolAddress).address(),
                        functionName: AMM_CONTRACT_METHOD.WITHDRAW,
                        args,
                    }),
                ),
                subInvocations: [burnInvocation],
            }),
        });

        const operation = StellarSdk.Operation.invokeContractFunction({
            contract: poolAddress,
            function: AMM_CONTRACT_METHOD.WITHDRAW,
            args,
            auth: [rootInvocation],
        });

        return this.buildSmartContractTxFromOp(accountId, operation).then(tx =>
            this.prepareTransaction(tx),
        );
    }

    getSwapChainedTx(
        accountId: string,
        base: Token,
        counter: Token,
        chainedXDR: string,
        amount: string,
        amountWithSlippage: string,
        isSend: boolean,
    ) {
        const args = [
            this.publicKeyToScVal(accountId),
            xdr.ScVal.fromXDR(chainedXDR, 'base64'),
            this.contractIdToScVal(base.contract),
            this.amountToUint128(
                amount,
                isSend ? (base as SorobanToken).decimal : (counter as SorobanToken).decimal,
            ),
            this.amountToUint128(
                amountWithSlippage,
                isSend ? (counter as SorobanToken).decimal : (base as SorobanToken).decimal,
            ),
        ];

        const transferInvocation = new xdr.SorobanAuthorizedInvocation({
            function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                new xdr.InvokeContractArgs({
                    functionName: ASSET_CONTRACT_METHOD.TRANSFER,
                    contractAddress: this.contractIdToScVal(base.contract).address(),
                    args: [
                        this.publicKeyToScVal(accountId),
                        this.contractIdToScVal(AMM_SMART_CONTRACT_ID),
                        this.amountToInt128(
                            isSend ? amount : amountWithSlippage,
                            (base as SorobanToken).decimal,
                        ),
                    ],
                }),
            ),
            subInvocations: [],
        });

        const rootInvocation = new xdr.SorobanAuthorizationEntry({
            credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
            rootInvocation: new xdr.SorobanAuthorizedInvocation({
                function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                    new xdr.InvokeContractArgs({
                        contractAddress: this.contractIdToScVal(AMM_SMART_CONTRACT_ID).address(),
                        functionName: isSend
                            ? AMM_CONTRACT_METHOD.SWAP_CHAINED
                            : AMM_CONTRACT_METHOD.SWAP_CHAINED_RECEIVE,
                        args,
                    }),
                ),
                subInvocations: [transferInvocation],
            }),
        });

        const operation = StellarSdk.Operation.invokeContractFunction({
            contract: AMM_SMART_CONTRACT_ID,
            function: isSend
                ? AMM_CONTRACT_METHOD.SWAP_CHAINED
                : AMM_CONTRACT_METHOD.SWAP_CHAINED_RECEIVE,
            args,
            auth: [rootInvocation],
        });
        return this.buildSmartContractTxFromOp(accountId, operation).then(tx =>
            this.prepareTransaction(tx),
        );
    }

    async buildSmartContractTx(
        publicKey: string,
        contractId: string,
        method: string,
        ...args: xdr.ScVal[]
    ) {
        const acc = await this.server.getAccount(publicKey);
        const contract = new StellarSdk.Contract(contractId);
        const builtTx = new StellarSdk.TransactionBuilder(acc, {
            fee: BASE_FEE,
            networkPassphrase: getNetworkPassphrase(),
        });
        if (args) {
            builtTx.addOperation(contract.call(method, ...args));
        } else {
            builtTx.addOperation(contract.call(method));
        }
        return builtTx.setTimeout(StellarSdk.TimeoutInfinite).build();
    }

    buildSmartContractTxFromOp(publicKey, operation) {
        return this.server.getAccount(publicKey).then(acc => {
            const builtTx = new StellarSdk.TransactionBuilder(acc, {
                fee: BASE_FEE,
                networkPassphrase: getNetworkPassphrase(),
            });

            builtTx.addOperation(operation);

            return builtTx.setTimeout(StellarSdk.TimeoutInfinite).build();
        });
    }

    signWithSecret(tx: StellarSdk.Transaction) {
        tx.sign(this.keypair);
        return tx;
    }

    async submitTx(tx: StellarSdk.Transaction) {
        const res = await this.server.sendTransaction(tx);
        return await this.processResponse(res);
    }

    simulateTx(tx: StellarSdk.Transaction) {
        return this.server.simulateTransaction(tx);
    }

    prepareTransaction(tx: StellarSdk.Transaction) {
        return this.tryRestore(tx).then(() =>
            this.server.prepareTransaction(tx).catch(err => {
                throw SorobanPrepareTxErrorHandler(err);
            }),
        );
    }

    private startServer(): void {
        this.server = new rpc.Server(getSorobanUrl());
    }

    contractIdToScVal(contractId) {
        return StellarSdk.Address.contract(StrKey.decodeContract(contractId)).toScVal();
    }

    scValToArray(array: xdr.ScVal[]): xdr.ScVal {
        return xdr.ScVal.scvVec(array);
    }

    private assetToScVal(asset: Asset): xdr.ScVal {
        return xdr.ScVal.scvAddress(
            StellarSdk.Address.contract(
                StrKey.decodeContract(this.getAssetContractId(asset)),
            ).toScAddress(),
        );
    }

    private publicKeyToScVal(pubkey: string): xdr.ScVal {
        return xdr.ScVal.scvAddress(StellarSdk.Address.fromString(pubkey).toScAddress());
    }

    amountToUint32(amount: number): xdr.ScVal {
        return xdr.ScVal.scvU32(Math.floor(amount));
    }

    amountToInt128(amount: string, decimals = 7): xdr.ScVal {
        return new StellarSdk.XdrLargeInt(
            'i128',
            new BigNumber(amount).times(Math.pow(10, decimals)).toFixed(),
        ).toI128();
    }

    amountToUint128(amount: string, decimals = 7): xdr.ScVal {
        return new StellarSdk.XdrLargeInt(
            'u128',
            new BigNumber(amount).times(Math.pow(10, decimals)).toFixed(),
        ).toU128();
    }

    scValToNative(value: xdr.ScVal) {
        return StellarSdk.scValToNative(value);
    }

    i128ToInt(val: xdr.ScVal, decimals = 7): string {
        return new BigNumber(StellarSdk.scValToNative(val)).div(Math.pow(10, decimals)).toString();
    }

    private getAssetContractHash(asset: Token): string {
        return new StellarSdk.Contract(asset.contract).address().toBuffer().toString('hex');
    }

    private orderTokens(assets: Token[]) {
        for (let i = 0; i < assets.length; i++) {
            for (let j = 0; j < assets.length - 1; j++) {
                const hash1 = parseInt(this.getAssetContractHash(assets[j]), 16);
                const hash2 = parseInt(this.getAssetContractHash(assets[j + 1]), 16);
                if (hash1 > hash2) {
                    const temp = assets[j];
                    assets[j] = assets[j + 1];
                    assets[j + 1] = temp;
                }
            }
        }
        return assets;
    }
}
