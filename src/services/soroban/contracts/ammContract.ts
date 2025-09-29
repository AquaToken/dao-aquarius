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
    amountToInt128,
    amountToUint128,
    amountToUint32,
    amountToUint64,
    contractIdToScVal,
    hashToScVal,
    i128ToInt,
    publicKeyToScVal,
    scValToArray,
    scValToNative,
} from 'services/soroban/utils/scValHelpers';

import { PoolIncentives, PoolProcessed, PoolRewardsInfo, RewardType } from 'types/amm';
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

    // Helper functions for creating core invocations and authorizations

    /**
     * Creates the burn authorization invocation required to burn shares.
     */
    createBurnInvocation(accountId: string, shareAmount: string, shareAddress: string) {
        return new xdr.SorobanAuthorizedInvocation({
            function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                new xdr.InvokeContractArgs({
                    functionName: ASSET_CONTRACT_METHOD.BURN,
                    contractAddress: contractIdToScVal(shareAddress).address(),
                    args: [publicKeyToScVal(accountId), amountToInt128(shareAmount)],
                }),
            ),
            subInvocations: [],
        });
    }

    /**
     * Creates the withdraw invocation with burn as a sub-invocation.
     */
    createWithdrawInvocation(
        accountId: string,
        poolAddress: string,
        functionName: string,
        args: xdr.ScVal[],
        burnInvocation: xdr.SorobanAuthorizedInvocation,
    ) {
        return new xdr.SorobanAuthorizedInvocation({
            function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                new xdr.InvokeContractArgs({
                    contractAddress: contractIdToScVal(poolAddress).address(),
                    functionName,
                    args,
                }),
            ),
            subInvocations: [burnInvocation],
        });
    }

    /**
     * Creates the claim invocation which doesn't require any sub-invocations.
     */
    createClaimInvocation(accountId: string, poolAddress: string, functionName: string) {
        return new xdr.SorobanAuthorizedInvocation({
            function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                new xdr.InvokeContractArgs({
                    contractAddress: contractIdToScVal(poolAddress).address(),
                    functionName,
                    args: [publicKeyToScVal(accountId)],
                }),
            ),
            subInvocations: [],
        });
    }

    /**
     * Wraps the root invocation into an authorization entry.
     */
    createRootAuthorization(accountId: string, rootInvocation: xdr.SorobanAuthorizedInvocation) {
        return new xdr.SorobanAuthorizationEntry({
            credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
            rootInvocation,
        });
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
        const burnInvocation = this.createBurnInvocation(accountId, shareAmount, shareAddress);

        const rootInvocation = this.createRootAuthorization(
            accountId,
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
        const burnInvocation = this.createBurnInvocation(accountId, shareAmount, shareAddress);

        const withdrawAuthInvocation = this.createWithdrawInvocation(
            accountId,
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

            const claimRewardsInvocations = this.createClaimInvocation(
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

            const claimIncentivesInvocations = this.createClaimInvocation(
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

        const batchAuth = this.createRootAuthorization(accountId, rootInvocation);

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

    private getAssetContractHash(asset: Token): string {
        return new StellarSdk.Contract(asset.contract).address().toBuffer().toString('hex');
    }

    orderTokens(assets: Token[]) {
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
