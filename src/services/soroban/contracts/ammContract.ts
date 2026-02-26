import * as StellarSdk from '@stellar/stellar-sdk';
import { xdr } from '@stellar/stellar-sdk';
import BigNumber from 'bignumber.js';

import { POOL_TYPE } from 'constants/amm';
import {
    AMM_CONTRACT_METHOD,
    ASSET_CONTRACT_METHOD,
    BATCH_CONTRACT_METHOD,
    CONTRACTS,
} from 'constants/soroban';
import { ACCOUNT_FOR_SIMULATE } from 'constants/stellar-accounts';

import { getAssetString } from 'helpers/assets';
import { getEnv } from 'helpers/env';

import TokenContract from 'services/soroban/contracts/tokenContract';
import {
    createBurnInvocation,
    createClaimInvocation,
    createRootAuthorization,
    createWithdrawInvocation,
} from 'services/soroban/utils/ammContractUtils';
import {
    amountToInt128,
    amountToUint128,
    amountToUint32,
    amountToUint64,
    contractIdToScVal,
    getAmountByAsset,
    hashToScVal,
    i128ToInt,
    parseTokenAmountsScVal,
    publicKeyToScVal,
    scValToArray,
    scValToNative,
    tickToScVal,
    toTokenAmountsScVal,
} from 'services/soroban/utils/scValHelpers';

import {
    ConcentratedPoolInfo,
    ConcentratedPosition,
    ConcentratedSlot0,
    PoolExtended,
    PoolIncentives,
    PoolProcessed,
    PoolRewardsInfo,
    RewardType,
} from 'types/amm';
import { SorobanToken, Token } from 'types/token';

import Connection from '../connection/connection';

export default class AmmContract {
    private readonly connection: Connection;
    private readonly token: TokenContract;
    private readonly AMM_SMART_CONTRACT_ID: string;
    private readonly BATCH_SMART_CONTRACT_ID: string;

    constructor(connection: Connection, token: TokenContract) {
        this.connection = connection;
        this.token = token;
        this.AMM_SMART_CONTRACT_ID = CONTRACTS[getEnv()].amm;
        this.BATCH_SMART_CONTRACT_ID = CONTRACTS[getEnv()].batch;
    }

    getInitConstantPoolTx(accountId: string, base: Token, counter: Token, fee: number, createInfo) {
        const args = [
            publicKeyToScVal(accountId),
            scValToArray(
                this.token
                    .orderTokens([base, counter])
                    .map(asset => contractIdToScVal(asset.contract)),
            ),
            amountToUint32(fee),
        ];

        const operation = StellarSdk.Operation.invokeContractFunction({
            contract: this.AMM_SMART_CONTRACT_ID,
            function: AMM_CONTRACT_METHOD.INIT_CONSTANT_POOL,
            args,
            auth: [
                new xdr.SorobanAuthorizationEntry({
                    credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
                    rootInvocation: new xdr.SorobanAuthorizedInvocation({
                        function:
                            xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                                new xdr.InvokeContractArgs({
                                    contractAddress: contractIdToScVal(
                                        this.AMM_SMART_CONTRACT_ID,
                                    ).address(),
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
                                            contractAddress: contractIdToScVal(
                                                createInfo.token.contract,
                                            ).address(),
                                            args: [
                                                publicKeyToScVal(accountId),
                                                contractIdToScVal(createInfo.destination),
                                                amountToInt128(
                                                    createInfo.constantFee,
                                                    createInfo.token.decimal,
                                                ),
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

        return this.connection
            .buildSmartContractTxFromOp(accountId, operation)
            .then(tx => this.connection.prepareTransaction(tx));
    }

    getInitStableSwapPoolTx(accountId: string, assets: Token[], fee: number, createInfo) {
        const args = [
            publicKeyToScVal(accountId),
            scValToArray(
                this.token.orderTokens(assets).map(asset => contractIdToScVal(asset.contract)),
            ),
            amountToUint32(fee * 100),
        ];

        const transferInvocation = new xdr.SorobanAuthorizedInvocation({
            function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                new xdr.InvokeContractArgs({
                    functionName: ASSET_CONTRACT_METHOD.TRANSFER,
                    contractAddress: contractIdToScVal(createInfo.token.contract).address(),
                    args: [
                        publicKeyToScVal(accountId),
                        contractIdToScVal(createInfo.destination),
                        amountToInt128(createInfo.stableFee, createInfo.token.decimal),
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
                        contractAddress: contractIdToScVal(this.AMM_SMART_CONTRACT_ID).address(),
                        functionName: AMM_CONTRACT_METHOD.INIT_STABLESWAP_POOL,
                        args,
                    }),
                ),
                subInvocations: [transferInvocation],
            }),
        });

        const operation = StellarSdk.Operation.invokeContractFunction({
            contract: this.AMM_SMART_CONTRACT_ID,
            function: AMM_CONTRACT_METHOD.INIT_STABLESWAP_POOL,
            args,
            auth: [rootInvocation],
        });

        return this.connection
            .buildSmartContractTxFromOp(accountId, operation)
            .then(tx => this.connection.prepareTransaction(tx));
    }

    getInitConcentratedPoolTx(
        accountId: string,
        base: Token,
        counter: Token,
        fee: number,
        createInfo,
    ) {
        const args = [
            publicKeyToScVal(accountId),
            scValToArray(
                this.token
                    .orderTokens([base, counter])
                    .map(asset => contractIdToScVal(asset.contract)),
            ),
            amountToUint32(fee),
        ];

        const transferInvocation = new xdr.SorobanAuthorizedInvocation({
            function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                new xdr.InvokeContractArgs({
                    functionName: ASSET_CONTRACT_METHOD.TRANSFER,
                    contractAddress: contractIdToScVal(createInfo.token.contract).address(),
                    args: [
                        publicKeyToScVal(accountId),
                        contractIdToScVal(createInfo.destination),
                        amountToInt128(createInfo.constantFee, createInfo.token.decimal),
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
                        contractAddress: contractIdToScVal(this.AMM_SMART_CONTRACT_ID).address(),
                        functionName: AMM_CONTRACT_METHOD.INIT_CONCENTRATED_POOL,
                        args,
                    }),
                ),
                subInvocations: [transferInvocation],
            }),
        });

        const operation = StellarSdk.Operation.invokeContractFunction({
            contract: this.AMM_SMART_CONTRACT_ID,
            function: AMM_CONTRACT_METHOD.INIT_CONCENTRATED_POOL,
            args,
            auth: [rootInvocation],
        });

        return this.connection
            .buildSmartContractTxFromOp(accountId, operation)
            .then(tx => this.connection.prepareTransaction(tx));
    }

    parsePoolRewards(value, decimals = 7): PoolRewardsInfo {
        return value.reduce((acc, val) => {
            const key = val.key().value().toString();
            if (key === 'exp_at' || key === 'last_time' || key === 'expired_at') {
                acc[key] = new BigNumber(i128ToInt(val.val()).toString()).times(1e7).toNumber();
                return acc;
            }
            acc[key] = i128ToInt(val.val(), decimals);
            return acc;
        }, {}) as PoolRewardsInfo;
    }

    getPoolRewards(accountId: string, poolId: string): Promise<PoolRewardsInfo> {
        return this.connection
            .buildSmartContractTx(
                accountId,
                poolId,
                AMM_CONTRACT_METHOD.GET_REWARDS_INFO,
                publicKeyToScVal(accountId),
            )
            .then(
                tx =>
                    this.connection.simulateTx(
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

    async getPoolIncentives(accountId: string, poolId: string): Promise<PoolIncentives[]> {
        const tx = await this.connection.buildSmartContractTx(
            accountId,
            poolId,
            AMM_CONTRACT_METHOD.GET_INCENTIVES_INFO,
            publicKeyToScVal(accountId),
        );
        const { result } = await (this.connection.simulateTx(
            tx,
        ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>);
        if (result) {
            return Promise.all(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                result.retval.value().map(async item => {
                    const token = await this.token.parseTokenContractId(
                        StellarSdk.StrKey.encodeContract(item.key().value().value()),
                    );
                    return {
                        token,
                        info: this.parsePoolRewards(item.val().value(), token.decimal),
                    };
                }),
            );
        }
        return null;
    }

    getPoolsRewards(accountId: string, pools: string[]) {
        const batches = pools.map(pool =>
            scValToArray([
                contractIdToScVal(pool),
                xdr.ScVal.scvSymbol(AMM_CONTRACT_METHOD.GET_REWARDS_INFO),
                scValToArray([publicKeyToScVal(accountId)]),
            ]),
        );

        return this.connection
            .buildSmartContractTx(
                accountId,
                this.BATCH_SMART_CONTRACT_ID,
                BATCH_CONTRACT_METHOD.batch,
                scValToArray([publicKeyToScVal(accountId)]),
                scValToArray(batches),
                xdr.ScVal.scvBool(true),
            )
            .then(tx => this.connection.simulateTx(tx))
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

    getPoolsIncentives(accountId: string, pools: string[]) {
        const batches = pools.map(pool =>
            scValToArray([
                contractIdToScVal(pool),
                xdr.ScVal.scvSymbol(AMM_CONTRACT_METHOD.GET_INCENTIVES_INFO),
                scValToArray([publicKeyToScVal(accountId)]),
            ]),
        );

        return this.connection
            .buildSmartContractTx(
                accountId,
                this.BATCH_SMART_CONTRACT_ID,
                BATCH_CONTRACT_METHOD.batch,
                scValToArray([publicKeyToScVal(accountId)]),
                scValToArray(batches),
                xdr.ScVal.scvBool(true),
            )
            .then(tx => this.connection.simulateTx(tx))
            .then(res => {
                if (!(res as StellarSdk.rpc.Api.SimulateTransactionSuccessResponse).result) {
                    throw new Error('getPoolsIncentives error');
                }

                const retValArr = (
                    res as StellarSdk.rpc.Api.SimulateTransactionSuccessResponse
                ).result.retval.value() as unknown[];

                return Promise.all(
                    retValArr.map(
                        async val =>
                            await Promise.all(
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                val.value().map(async item => {
                                    const token = await this.token.parseTokenContractId(
                                        StellarSdk.StrKey.encodeContract(
                                            item.key().value().value(),
                                        ),
                                    );
                                    return {
                                        token,
                                        info: this.parsePoolRewards(
                                            item.val().value(),
                                            token.decimal,
                                        ),
                                    };
                                }),
                            ),
                    ),
                );
            });
    }

    getTotalShares(poolId: string) {
        return this.connection
            .buildSmartContractTx(
                ACCOUNT_FOR_SIMULATE,
                poolId,
                AMM_CONTRACT_METHOD.GET_TOTAL_SHARES,
            )
            .then(
                tx =>
                    this.connection.simulateTx(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => {
                if (result) {
                    return i128ToInt(result.retval);
                }

                throw new Error('getTotalShares error');
            });
    }

    getClaimRewardsTx(accountId: string, poolId: string) {
        return this.connection
            .buildSmartContractTx(
                accountId,
                poolId,
                AMM_CONTRACT_METHOD.CLAIM,
                publicKeyToScVal(accountId),
            )
            .then(tx => this.connection.prepareTransaction(tx));
    }

    getClaimIncentiveTx(accountId: string, poolId: string) {
        return this.connection
            .buildSmartContractTx(
                accountId,
                poolId,
                AMM_CONTRACT_METHOD.CLAIM_INCENTIVES,
                publicKeyToScVal(accountId),
            )
            .then(tx => this.connection.prepareTransaction(tx));
    }

    getClaimBatchTx(accountId: string, poolsAndTypes: string[]) {
        const batches = poolsAndTypes.map(poolAndType => {
            const [type, poolId] = poolAndType.split('-');

            return scValToArray([
                contractIdToScVal(poolId),
                xdr.ScVal.scvSymbol(
                    type === RewardType.aquaReward
                        ? AMM_CONTRACT_METHOD.CLAIM
                        : AMM_CONTRACT_METHOD.CLAIM_INCENTIVES,
                ),
                scValToArray([publicKeyToScVal(accountId)]),
            ]);
        });

        return this.connection
            .buildSmartContractTx(
                accountId,
                this.BATCH_SMART_CONTRACT_ID,
                BATCH_CONTRACT_METHOD.batch,
                scValToArray([publicKeyToScVal(accountId)]),
                scValToArray(batches),
                xdr.ScVal.scvBool(false),
            )
            .then(tx => this.connection.prepareTransaction(tx));
    }

    /**
     * Builds a transaction for a single withdraw  (either normal or single coin).
     */
    async buildSingleWithdrawTx(
        accountId: string,
        poolAddress: string,
        shareAmount: string,
        shareAddress: string,
        functionName: string,
        args: xdr.ScVal[],
    ): Promise<StellarSdk.Transaction> {
        const burnInvocation = createBurnInvocation(accountId, shareAmount, shareAddress);

        const rootInvocation = createRootAuthorization(
            new xdr.SorobanAuthorizedInvocation({
                function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                    new xdr.InvokeContractArgs({
                        contractAddress: contractIdToScVal(poolAddress).address(),
                        functionName,
                        args,
                    }),
                ),
                subInvocations: [burnInvocation],
            }),
        );

        const operation = StellarSdk.Operation.invokeContractFunction({
            contract: poolAddress,
            function: functionName,
            args,
            auth: [rootInvocation],
        });

        const tx = await this.connection.buildSmartContractTxFromOp(accountId, operation);
        return this.connection.prepareTransaction(tx);
    }

    /**
     * Builds a batch transaction for withdraw + claim operations.
     */
    async buildWithdrawAndClaimTx(
        accountId: string,
        poolAddress: string,
        shareAmount: string,
        shareAddress: string,
        withdrawFunctionName: string,
        withdrawArgs: xdr.ScVal[],
        withClaimRewards: boolean,
        withClaimIncentives: boolean,
    ): Promise<StellarSdk.Transaction> {
        // Prepare batch calls: withdraw and claim
        const withdrawCall = scValToArray([
            contractIdToScVal(poolAddress),
            xdr.ScVal.scvSymbol(withdrawFunctionName),
            scValToArray(withdrawArgs),
        ]);

        // Prepare authorizations
        const burnInvocation = createBurnInvocation(accountId, shareAmount, shareAddress);

        const withdrawAuthInvocation = createWithdrawInvocation(
            poolAddress,
            withdrawFunctionName,
            withdrawArgs,
            burnInvocation,
        );

        const batchCalls = [withdrawCall];
        const subInvocations = [withdrawAuthInvocation];

        if (withClaimRewards) {
            const claimRewardsCall = scValToArray([
                contractIdToScVal(poolAddress),
                xdr.ScVal.scvSymbol(AMM_CONTRACT_METHOD.CLAIM),
                scValToArray([publicKeyToScVal(accountId)]),
            ]);

            batchCalls.push(claimRewardsCall);

            const claimRewardsInvocations = createClaimInvocation(
                accountId,
                poolAddress,
                AMM_CONTRACT_METHOD.CLAIM,
            );

            subInvocations.push(claimRewardsInvocations);
        }

        if (withClaimIncentives) {
            const claimIncentivesCall = scValToArray([
                contractIdToScVal(poolAddress),
                xdr.ScVal.scvSymbol(AMM_CONTRACT_METHOD.CLAIM_INCENTIVES),
                scValToArray([publicKeyToScVal(accountId)]),
            ]);
            batchCalls.push(claimIncentivesCall);

            const claimIncentivesInvocations = createClaimInvocation(
                accountId,
                poolAddress,
                AMM_CONTRACT_METHOD.CLAIM_INCENTIVES,
            );

            subInvocations.push(claimIncentivesInvocations);
        }

        const rootInvocation = new xdr.SorobanAuthorizedInvocation({
            function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                new xdr.InvokeContractArgs({
                    contractAddress: contractIdToScVal(this.BATCH_SMART_CONTRACT_ID).address(),
                    functionName: BATCH_CONTRACT_METHOD.batch,
                    args: [
                        scValToArray([publicKeyToScVal(accountId)]),
                        scValToArray(batchCalls),
                        xdr.ScVal.scvBool(true),
                    ],
                }),
            ),
            subInvocations,
        });

        const batchAuth = createRootAuthorization(rootInvocation);

        const batchOperation = StellarSdk.Operation.invokeContractFunction({
            contract: this.BATCH_SMART_CONTRACT_ID,
            function: BATCH_CONTRACT_METHOD.batch,
            args: [
                scValToArray([publicKeyToScVal(accountId)]),
                scValToArray(batchCalls),
                xdr.ScVal.scvBool(true),
            ],
            auth: [batchAuth],
        });

        const tx = await this.connection.buildSmartContractTxFromOp(accountId, batchOperation);
        return this.connection.prepareTransaction(tx);
    }

    // --- Exported functions for external use ---

    getWithdrawAndClaim(
        accountId: string,
        poolAddress: string,
        shareAmount: string,
        assets: Token[],
        shareAddress: string,
        withClaimRewards: boolean,
        withClaimIncentives: boolean,
    ): Promise<StellarSdk.Transaction> {
        const withdrawArgs = [
            publicKeyToScVal(accountId),
            amountToUint128(shareAmount),
            scValToArray(assets.map(() => amountToUint128('0.0000001'))),
        ];
        return this.buildWithdrawAndClaimTx(
            accountId,
            poolAddress,
            shareAmount,
            shareAddress,
            AMM_CONTRACT_METHOD.WITHDRAW,
            withdrawArgs,
            withClaimRewards,
            withClaimIncentives,
        );
    }

    getSingleTokenWithdrawAndClaim(
        accountId: string,
        poolAddress: string,
        shareAmount: string,
        tokenIndex: number,
        minimumTokenAmount: string,
        tokenDecimals: number,
        shareAddress: string,
        withClaimRewards: boolean,
        withClaimIncentives: boolean,
    ): Promise<StellarSdk.Transaction> {
        const withdrawArgs = [
            publicKeyToScVal(accountId),
            amountToUint128(shareAmount),
            amountToUint32(tokenIndex),
            amountToUint128(minimumTokenAmount, tokenDecimals),
        ];
        return this.buildWithdrawAndClaimTx(
            accountId,
            poolAddress,
            shareAmount,
            shareAddress,
            AMM_CONTRACT_METHOD.WITHDRAW_ONE_COIN,
            withdrawArgs,
            withClaimRewards,
            withClaimIncentives,
        );
    }

    getCustomWithdrawAndClaim(
        accountId: string,
        poolAddress: string,
        shareAmountMaximum: string,
        amounts: Map<string, string>,
        tokens: Token[],
        shareAddress: string,
        withClaimRewards: boolean,
        withClaimIncentives: boolean,
    ): Promise<StellarSdk.Transaction> {
        const withdrawArgs = [
            publicKeyToScVal(accountId),
            scValToArray(
                [...amounts.values()].map((value, index) =>
                    amountToUint128(value || '0', tokens[index].decimal),
                ),
            ),
            amountToUint128(shareAmountMaximum),
        ];
        return this.buildWithdrawAndClaimTx(
            accountId,
            poolAddress,
            shareAmountMaximum,
            shareAddress,
            AMM_CONTRACT_METHOD.WITHDRAW_CUSTOM,
            withdrawArgs,
            withClaimRewards,
            withClaimIncentives,
        );
    }

    async estimateCustomWithdraw(
        accountId: string,
        poolAddress: string,
        shareAmountMaximum: string,
        amounts: Map<string, string>,
        tokens: Token[],
        shareAddress: string,
    ) {
        const args = [
            publicKeyToScVal(accountId),
            scValToArray(
                [...amounts.values()].map((value, index) =>
                    amountToUint128(value || '0', tokens[index].decimal),
                ),
            ),
            amountToUint128(shareAmountMaximum),
        ];
        const tx = await this.buildSingleWithdrawTx(
            accountId,
            poolAddress,
            shareAmountMaximum,
            shareAddress,
            AMM_CONTRACT_METHOD.WITHDRAW_CUSTOM,
            args,
        );
        const res = await this.connection.simulateTx(tx);

        return i128ToInt(res.result.retval);
    }

    getSingleTokenWithdrawEstimate(
        poolId: string,
        tokens: Token[],
        accountShare: string,
    ): Promise<Map<string, string>> {
        const estimateCalls = tokens.map((_, i) =>
            scValToArray([
                contractIdToScVal(poolId),
                xdr.ScVal.scvSymbol(AMM_CONTRACT_METHOD.CALC_WITHDRAW_ONE_COIN),
                scValToArray([amountToUint128(accountShare), amountToUint32(i)]),
            ]),
        );
        return this.connection
            .buildSmartContractTx(
                ACCOUNT_FOR_SIMULATE,
                this.BATCH_SMART_CONTRACT_ID,
                BATCH_CONTRACT_METHOD.batch,
                scValToArray([publicKeyToScVal(ACCOUNT_FOR_SIMULATE)]),
                scValToArray(estimateCalls),
                xdr.ScVal.scvBool(true),
            )
            .then(tx => this.connection.simulateTx(tx))
            .then(res => {
                if (!res.result) return;
                const map = new Map();

                res.result.retval
                    .value()
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    .forEach((val, index) => {
                        map.set(tokens[index].contract, i128ToInt(val, tokens[index].decimal));
                    });

                return map;
            });
    }

    getCreationFeeToken() {
        return this.connection
            .buildSmartContractTx(
                ACCOUNT_FOR_SIMULATE,
                this.AMM_SMART_CONTRACT_ID,
                AMM_CONTRACT_METHOD.GET_CREATION_FEE_TOKEN,
            )
            .then(
                tx =>
                    this.connection.simulateTx(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) =>
                this.token.parseTokenContractId(StellarSdk.scValToNative(result.retval)),
            );
    }

    getCreationFee(type: POOL_TYPE) {
        return this.connection
            .buildSmartContractTx(
                ACCOUNT_FOR_SIMULATE,
                this.AMM_SMART_CONTRACT_ID,
                type === POOL_TYPE.constant
                    ? AMM_CONTRACT_METHOD.GET_CONSTANT_CREATION_FEE
                    : AMM_CONTRACT_METHOD.GET_STABLE_CREATION_FEE,
            )
            .then(
                tx =>
                    this.connection.simulateTx(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => i128ToInt(result.retval));
    }

    getCreationFeeAddress() {
        return this.connection
            .buildSmartContractTx(
                ACCOUNT_FOR_SIMULATE,
                this.AMM_SMART_CONTRACT_ID,
                AMM_CONTRACT_METHOD.GET_INIT_POOL_DESTINATION,
            )
            .then(
                tx =>
                    this.connection.simulateTx(
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

    getPoolReserves(assets: Token[], poolId: string) {
        return this.connection
            .buildSmartContractTx(ACCOUNT_FOR_SIMULATE, poolId, AMM_CONTRACT_METHOD.GET_RESERVES)
            .then(
                tx =>
                    this.connection.simulateTx(
                        tx,
                    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
            )
            .then(({ result }) => {
                if (result) {
                    return this.token.orderTokens(assets).reduce((acc, asset, index) => {
                        acc.set(
                            getAssetString(asset),
                            i128ToInt(
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
            publicKeyToScVal(accountId),
            scValToArray(
                this.token
                    .orderTokens(assets)
                    .map(asset =>
                        amountToUint128(
                            amounts.get(getAssetString(asset)) || '0',
                            (asset as SorobanToken).decimal,
                        ),
                    ),
            ),
            amountToUint128('0.0000001'),
        ];

        const transferInvocations = this.token.orderTokens(assets).map(
            asset =>
                new xdr.SorobanAuthorizedInvocation({
                    function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                        new xdr.InvokeContractArgs({
                            functionName: ASSET_CONTRACT_METHOD.TRANSFER,
                            contractAddress: contractIdToScVal(asset.contract).address(),
                            args: [
                                publicKeyToScVal(accountId),
                                contractIdToScVal(poolAddress),
                                amountToInt128(
                                    amounts.get(getAssetString(asset)) || '0',
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
                        contractAddress: contractIdToScVal(poolAddress).address(),
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

        return this.connection
            .buildSmartContractTxFromOp(accountId, operation)
            .then(tx => this.connection.prepareTransaction(tx));
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
            publicKeyToScVal(accountId),
            xdr.ScVal.fromXDR(chainedXDR, 'base64'),
            contractIdToScVal(base.contract),
            amountToUint128(
                amount,
                isSend ? (base as SorobanToken).decimal : (counter as SorobanToken).decimal,
            ),
            amountToUint128(
                amountWithSlippage,
                isSend ? (counter as SorobanToken).decimal : (base as SorobanToken).decimal,
            ),
        ];

        const transferInvocation = new xdr.SorobanAuthorizedInvocation({
            function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                new xdr.InvokeContractArgs({
                    functionName: ASSET_CONTRACT_METHOD.TRANSFER,
                    contractAddress: contractIdToScVal(base.contract).address(),
                    args: [
                        publicKeyToScVal(accountId),
                        contractIdToScVal(this.AMM_SMART_CONTRACT_ID),
                        amountToInt128(
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
                        contractAddress: contractIdToScVal(this.AMM_SMART_CONTRACT_ID).address(),
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
            contract: this.AMM_SMART_CONTRACT_ID,
            function: isSend
                ? AMM_CONTRACT_METHOD.SWAP_CHAINED
                : AMM_CONTRACT_METHOD.SWAP_CHAINED_RECEIVE,
            args,
            auth: [rootInvocation],
        });
        return this.connection
            .buildSmartContractTxFromOp(accountId, operation)
            .then(tx => this.connection.prepareTransaction(tx));
    }

    getScheduleIncentiveTx(
        accountId: string,
        pool: PoolProcessed,
        rewardToken: Token,
        tps: number,
        startDate: number,
        endDate: number,
        chainedXDR: string,
    ) {
        const duration = ((endDate - startDate) / 1000).toFixed();

        const swapChainedScVal = chainedXDR
            ? xdr.ScVal.fromXDR(chainedXDR, 'base64')
            : scValToArray([]);

        return this.connection
            .buildSmartContractTx(
                accountId,
                this.AMM_SMART_CONTRACT_ID,
                AMM_CONTRACT_METHOD.SCHEDULE_INCENTIVE,
                publicKeyToScVal(accountId),
                scValToArray(pool.tokens.map(token => contractIdToScVal(token.contract))),
                hashToScVal(pool.index),
                contractIdToScVal(rewardToken.contract),
                amountToUint128(tps.toFixed(rewardToken.decimal), rewardToken.decimal),
                amountToUint64((startDate / 1000).toFixed(), 0),
                amountToUint64(duration, 0),
                swapChainedScVal,
            )
            .then(tx => this.connection.prepareTransaction(tx));
    }

    getIncentivesConfig(): Promise<{ duration: number; minAquaAmount: number }> {
        const batches = [
            scValToArray([
                contractIdToScVal(this.AMM_SMART_CONTRACT_ID),
                xdr.ScVal.scvSymbol(AMM_CONTRACT_METHOD.GET_INCENTIVES_MIN_DURATION),
                scValToArray([]),
            ]),
            scValToArray([
                contractIdToScVal(this.AMM_SMART_CONTRACT_ID),
                xdr.ScVal.scvSymbol(AMM_CONTRACT_METHOD.GET_INCENTIVES_MIN_DAILY_AMOUNT),
                scValToArray([]),
            ]),
        ];

        return this.connection
            .buildSmartContractTx(
                ACCOUNT_FOR_SIMULATE,
                this.BATCH_SMART_CONTRACT_ID,
                BATCH_CONTRACT_METHOD.batch,
                scValToArray([publicKeyToScVal(ACCOUNT_FOR_SIMULATE)]),
                scValToArray(batches),
                xdr.ScVal.scvBool(true),
            )
            .then(tx => this.connection.simulateTx(tx))
            .then(res => {
                if (!(res as StellarSdk.rpc.Api.SimulateTransactionSuccessResponse).result) {
                    throw new Error('getPoolsRewards error');
                }

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const [duration, minAquaAmount] = res.result.retval.value();

                return {
                    duration: +i128ToInt(duration, 0),
                    minAquaAmount: +i128ToInt(minAquaAmount, 7),
                };
            });
    }

    async getPoolIncentivesCountPerToken(incentiveContractId: string): Promise<number> {
        const tx = await this.connection.buildSmartContractTx(
            ACCOUNT_FOR_SIMULATE,
            incentiveContractId,
            AMM_CONTRACT_METHOD.GET_POOL_CONFIG_PER_TOKEN,
        );

        const res = await this.connection.simulateTx(tx);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return res.result.retval.value().length;
    }

    async getPoolIncentivesMap(poolId: string) {
        const tx = await this.connection.buildSmartContractTx(
            ACCOUNT_FOR_SIMULATE,
            poolId,
            AMM_CONTRACT_METHOD.GET_POOL_INCENTIVES_MAP,
        );

        const res = await this.connection.simulateTx(tx);

        const result = await Promise.all(
            res.result.retval
                .value()
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                .map(async item => ({
                    token: await this.token.parseTokenContractId(scValToNative(item.key())),
                    incentiveContract: scValToNative(item.val()),
                    count: await this.getPoolIncentivesCountPerToken(scValToNative(item.val())),
                })),
        );

        return result;
    }

    getChangeUserRewardsStatusTx(poolId: string, accountId: string, rewardsEnabled: boolean) {
        return this.connection
            .buildSmartContractTx(
                accountId,
                poolId,
                AMM_CONTRACT_METHOD.SET_REWARDS_STATE,
                publicKeyToScVal(accountId),
                xdr.ScVal.scvBool(rewardsEnabled),
            )
            .then(tx => this.connection.prepareTransaction(tx));
    }

    getUserRewardsStatus(poolId: string, accountId: string): Promise<boolean> {
        return this.connection
            .buildSmartContractTx(
                accountId,
                poolId,
                AMM_CONTRACT_METHOD.GET_REWARDS_STATE,
                publicKeyToScVal(accountId),
            )
            .then(tx => this.connection.simulateTx(tx))
            .then(result => result.result.retval.value() as unknown as boolean);
    }

    estimateDeposit(
        account: string,
        poolId: string,
        assets: Token[],
        amounts: Map<string, string>,
    ) {
        return this.connection
            .buildSmartContractTx(
                account,
                poolId,
                AMM_CONTRACT_METHOD.ESTIMATE_DEPOSIT,
                scValToArray(
                    this.token
                        .orderTokens(assets)
                        .map(asset =>
                            amountToUint128(
                                amounts.get(getAssetString(asset)) || '0',
                                (asset as SorobanToken).decimal,
                            ),
                        ),
                ),
            )
            .then(tx => this.connection.simulateTx(tx))
            .then(result => {
                if (!result.result) {
                    return 0;
                }

                return Number(i128ToInt(result.result.retval));
            });
    }

    estimateWorkingBalanceAndSupply(
        pool: PoolExtended,
        accountId: string,
        shares: string,
    ): Promise<{
        workingBalance: number;
        workingSupply: number;
    }> {
        return this.connection
            .buildSmartContractTx(
                accountId,
                pool.address,
                AMM_CONTRACT_METHOD.ESTIMATE_WORKING_BALANCE,
                publicKeyToScVal(accountId),
                amountToUint128(shares, pool.share_token_decimals),
            )
            .then(tx => this.connection.simulateTx(tx))
            .then(res => {
                const [workingBalance, workingSupply] = (
                    res.result.retval.value() as unknown as Array<xdr.ScVal>
                ).map(v => Number(i128ToInt(v)));

                return { workingBalance, workingSupply };
            });
    }

    getConcentratedPoolInfo(poolId: string): Promise<ConcentratedPoolInfo> {
        return this.connection
            .buildSmartContractTx(ACCOUNT_FOR_SIMULATE, poolId, AMM_CONTRACT_METHOD.GET_INFO)
            .then(tx => this.connection.simulateTx(tx))
            .then(({ result }) => scValToNative(result.retval) as ConcentratedPoolInfo);
    }

    getConcentratedSlot0(poolId: string): Promise<ConcentratedSlot0> {
        return this.connection
            .buildSmartContractTx(ACCOUNT_FOR_SIMULATE, poolId, AMM_CONTRACT_METHOD.GET_SLOT0)
            .then(tx => this.connection.simulateTx(tx))
            .then(({ result }) => scValToNative(result.retval) as ConcentratedSlot0);
    }

    getConcentratedTickSpacing(poolId: string): Promise<number> {
        return this.connection
            .buildSmartContractTx(
                ACCOUNT_FOR_SIMULATE,
                poolId,
                AMM_CONTRACT_METHOD.GET_TICK_SPACING,
            )
            .then(tx => this.connection.simulateTx(tx))
            .then(({ result }) => Number(scValToNative(result.retval)));
    }

    getUserPositionSnapshot(poolId: string, user: string): Promise<unknown> {
        return this.connection
            .buildSmartContractTx(
                ACCOUNT_FOR_SIMULATE,
                poolId,
                AMM_CONTRACT_METHOD.GET_USER_POSITION_SNAPSHOT,
                publicKeyToScVal(user),
            )
            .then(tx => this.connection.simulateTx(tx))
            .then(({ result }) => scValToNative(result.retval));
    }

    getPosition(
        poolId: string,
        owner: string,
        tickLower: number,
        tickUpper: number,
    ): Promise<ConcentratedPosition | null> {
        return this.connection
            .buildSmartContractTx(
                ACCOUNT_FOR_SIMULATE,
                poolId,
                AMM_CONTRACT_METHOD.GET_POSITION,
                publicKeyToScVal(owner),
                tickToScVal(tickLower),
                tickToScVal(tickUpper),
            )
            .then(tx => this.connection.simulateTx(tx))
            .then(({ result }) => {
                const native = scValToNative(result.retval) as Record<string, unknown>;
                if (!native) {
                    return null;
                }

                return {
                    tickLower,
                    tickUpper,
                    liquidity: String(native.liquidity ?? native.L ?? '0'),
                };
            });
    }

    estimateDepositPosition(
        accountId: string,
        poolId: string,
        tokens: Token[],
        tickLower: number,
        tickUpper: number,
        desiredAmounts: Map<string, string>,
    ): Promise<{ amounts: string[]; liquidity: string }> {
        return this.connection
            .buildSmartContractTx(
                accountId,
                poolId,
                AMM_CONTRACT_METHOD.ESTIMATE_DEPOSIT_POSITION,
                tickToScVal(tickLower),
                tickToScVal(tickUpper),
                toTokenAmountsScVal(this.token.orderTokens(tokens), desiredAmounts),
            )
            .then(tx => this.connection.simulateTx(tx))
            .then(({ result }) => {
                const [amountsScVal, liquidityScVal] =
                    result.retval.value() as unknown as xdr.ScVal[];
                return {
                    amounts: parseTokenAmountsScVal(
                        amountsScVal.value() as xdr.ScVal[],
                        this.token.orderTokens(tokens),
                    ),
                    liquidity: i128ToInt(liquidityScVal, 0),
                };
            });
    }

    getDepositPositionTx(
        accountId: string,
        poolAddress: string,
        tokens: Token[],
        tickLower: number,
        tickUpper: number,
        desiredAmounts: Map<string, string>,
        minLiquidity: string,
    ): Promise<StellarSdk.Transaction> {
        const args = [
            publicKeyToScVal(accountId),
            tickToScVal(tickLower),
            tickToScVal(tickUpper),
            toTokenAmountsScVal(this.token.orderTokens(tokens), desiredAmounts),
            amountToUint128(minLiquidity, 0),
        ];

        const transferInvocations = this.token.orderTokens(tokens).map(
            asset =>
                new xdr.SorobanAuthorizedInvocation({
                    function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                        new xdr.InvokeContractArgs({
                            functionName: ASSET_CONTRACT_METHOD.TRANSFER,
                            contractAddress: contractIdToScVal(asset.contract).address(),
                            args: [
                                publicKeyToScVal(accountId),
                                contractIdToScVal(poolAddress),
                                amountToInt128(
                                    getAmountByAsset(desiredAmounts, asset),
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
                        contractAddress: contractIdToScVal(poolAddress).address(),
                        functionName: AMM_CONTRACT_METHOD.DEPOSIT_POSITION,
                        args,
                    }),
                ),
                subInvocations: transferInvocations,
            }),
        });

        const operation = StellarSdk.Operation.invokeContractFunction({
            contract: poolAddress,
            function: AMM_CONTRACT_METHOD.DEPOSIT_POSITION,
            args,
            auth: [rootInvocation],
        });

        return this.connection
            .buildSmartContractTxFromOp(accountId, operation)
            .then(tx => this.connection.prepareTransaction(tx));
    }

    estimateWithdrawPosition(
        accountId: string,
        poolId: string,
        tokens: Token[],
        tickLower: number,
        tickUpper: number,
        liquidity: string,
    ): Promise<string[]> {
        return this.connection
            .buildSmartContractTx(
                accountId,
                poolId,
                AMM_CONTRACT_METHOD.ESTIMATE_WITHDRAW_POSITION,
                publicKeyToScVal(accountId),
                tickToScVal(tickLower),
                tickToScVal(tickUpper),
                amountToUint128(liquidity, 0),
            )
            .then(tx => this.connection.simulateTx(tx))
            .then(({ result }) =>
                parseTokenAmountsScVal(
                    result.retval.value() as unknown as xdr.ScVal[],
                    this.token.orderTokens(tokens),
                ),
            );
    }

    getWithdrawPositionTx(
        accountId: string,
        poolId: string,
        tokens: Token[],
        tickLower: number,
        tickUpper: number,
        liquidity: string,
        minAmounts: Map<string, string>,
    ): Promise<StellarSdk.Transaction> {
        return this.connection
            .buildSmartContractTx(
                accountId,
                poolId,
                AMM_CONTRACT_METHOD.WITHDRAW_POSITION,
                publicKeyToScVal(accountId),
                tickToScVal(tickLower),
                tickToScVal(tickUpper),
                amountToUint128(liquidity, 0),
                toTokenAmountsScVal(this.token.orderTokens(tokens), minAmounts),
            )
            .then(tx => this.connection.prepareTransaction(tx));
    }

    getPositionFees(
        poolId: string,
        accountId: string,
        tokens: Token[],
        tickLower: number,
        tickUpper: number,
    ): Promise<string[]> {
        return this.connection
            .buildSmartContractTx(
                accountId,
                poolId,
                AMM_CONTRACT_METHOD.GET_POSITION_FEES,
                publicKeyToScVal(accountId),
                tickToScVal(tickLower),
                tickToScVal(tickUpper),
            )
            .then(tx => this.connection.simulateTx(tx))
            .then(({ result }) =>
                parseTokenAmountsScVal(
                    result.retval.value() as unknown as xdr.ScVal[],
                    this.token.orderTokens(tokens),
                ),
            );
    }

    getAllPositionFees(poolId: string, accountId: string, tokens: Token[]): Promise<string[]> {
        return this.connection
            .buildSmartContractTx(
                accountId,
                poolId,
                AMM_CONTRACT_METHOD.GET_ALL_POSITION_FEES,
                publicKeyToScVal(accountId),
            )
            .then(tx => this.connection.simulateTx(tx))
            .then(({ result }) =>
                parseTokenAmountsScVal(
                    result.retval.value() as unknown as xdr.ScVal[],
                    this.token.orderTokens(tokens),
                ),
            );
    }

    getClaimPositionFeesTx(
        accountId: string,
        poolId: string,
        tickLower: number,
        tickUpper: number,
    ): Promise<StellarSdk.Transaction> {
        return this.connection
            .buildSmartContractTx(
                accountId,
                poolId,
                AMM_CONTRACT_METHOD.CLAIM_POSITION_FEES,
                publicKeyToScVal(accountId),
                tickToScVal(tickLower),
                tickToScVal(tickUpper),
            )
            .then(tx => this.connection.prepareTransaction(tx));
    }

    getClaimAllPositionFeesTx(accountId: string, poolId: string): Promise<StellarSdk.Transaction> {
        return this.connection
            .buildSmartContractTx(
                accountId,
                poolId,
                AMM_CONTRACT_METHOD.CLAIM_ALL_POSITION_FEES,
                publicKeyToScVal(accountId),
            )
            .then(tx => this.connection.prepareTransaction(tx));
    }
}
