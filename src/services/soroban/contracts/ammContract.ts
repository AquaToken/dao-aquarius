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
import { ACCOUNT_FOR_SIMULATE } from 'constants/stellar';

import { getAssetString } from 'helpers/assets';
import { getEnv } from 'helpers/env';

import {
    buildSmartContractTx,
    buildSmartContractTxFromOp,
    prepareTransaction,
    simulateTx,
} from 'services/soroban/connection/connection';
import { orderTokens, parseTokenContractId } from 'services/soroban/contracts/tokenContract';
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
} from 'services/soroban/utils/scValHelpers';

import { PoolIncentives, PoolProcessed, PoolRewardsInfo, RewardType } from 'types/amm';
import { SorobanToken, Token } from 'types/token';

const AMM_SMART_CONTRACT_ID = CONTRACTS[getEnv()].amm;
const BATCH_SMART_CONTRACT_ID = CONTRACTS[getEnv()].batch;

export function getInitConstantPoolTx(
    accountId: string,
    base: Token,
    counter: Token,
    fee: number,
    createInfo,
) {
    const args = [
        publicKeyToScVal(accountId),
        scValToArray(orderTokens([base, counter]).map(asset => contractIdToScVal(asset.contract))),
        amountToUint32(fee),
    ];

    const operation = StellarSdk.Operation.invokeContractFunction({
        contract: AMM_SMART_CONTRACT_ID,
        function: AMM_CONTRACT_METHOD.INIT_CONSTANT_POOL,
        args,
        auth: [
            new xdr.SorobanAuthorizationEntry({
                credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
                rootInvocation: new xdr.SorobanAuthorizedInvocation({
                    function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                        new xdr.InvokeContractArgs({
                            contractAddress: contractIdToScVal(AMM_SMART_CONTRACT_ID).address(),
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

    return buildSmartContractTxFromOp(accountId, operation).then(tx => prepareTransaction(tx));
}

export function getInitStableSwapPoolTx(
    accountId: string,
    assets: Token[],
    fee: number,
    createInfo,
) {
    const args = [
        publicKeyToScVal(accountId),
        scValToArray(orderTokens(assets).map(asset => contractIdToScVal(asset.contract))),
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
                    contractAddress: contractIdToScVal(AMM_SMART_CONTRACT_ID).address(),
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

    return buildSmartContractTxFromOp(accountId, operation).then(tx => prepareTransaction(tx));
}

function parsePoolRewards(value, decimals = 7): PoolRewardsInfo {
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

export function getPoolRewards(accountId: string, poolId: string): Promise<PoolRewardsInfo> {
    return buildSmartContractTx(
        accountId,
        poolId,
        AMM_CONTRACT_METHOD.GET_REWARDS_INFO,
        publicKeyToScVal(accountId),
    )
        .then(
            tx => simulateTx(tx) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
        )
        .then(({ result }) => {
            if (result) {
                return parsePoolRewards(result.retval.value());
            }

            throw new Error('getPoolRewards error');
        });
}

export async function getPoolIncentives(
    accountId: string,
    poolId: string,
): Promise<PoolIncentives[]> {
    const tx = await buildSmartContractTx(
        accountId,
        poolId,
        AMM_CONTRACT_METHOD.GET_INCENTIVES_INFO,
        publicKeyToScVal(accountId),
    );
    const { result } = await (simulateTx(
        tx,
    ) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>);
    if (result) {
        return Promise.all(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            result.retval.value().map(async item => {
                const token = await parseTokenContractId(
                    StellarSdk.StrKey.encodeContract(item.key().value().value()),
                );
                return {
                    token,
                    info: parsePoolRewards(item.val().value(), token.decimal),
                };
            }),
        );
    }
    return null;
}

export function getPoolsRewards(accountId: string, pools: string[]) {
    const batches = pools.map(pool =>
        scValToArray([
            contractIdToScVal(pool),
            xdr.ScVal.scvSymbol(AMM_CONTRACT_METHOD.GET_REWARDS_INFO),
            scValToArray([publicKeyToScVal(accountId)]),
        ]),
    );

    return buildSmartContractTx(
        accountId,
        BATCH_SMART_CONTRACT_ID,
        BATCH_CONTRACT_METHOD.batch,
        scValToArray([publicKeyToScVal(accountId)]),
        scValToArray(batches),
        xdr.ScVal.scvBool(true),
    )
        .then(tx => simulateTx(tx))
        .then(res => {
            if (!(res as StellarSdk.rpc.Api.SimulateTransactionSuccessResponse).result) {
                throw new Error('getPoolsRewards error');
            }

            const retValArr = (
                res as StellarSdk.rpc.Api.SimulateTransactionSuccessResponse
            ).result.retval.value() as unknown[];

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return retValArr.map(val => parsePoolRewards(val.value()));
        });
}

export function getPoolsIncentives(accountId: string, pools: string[]) {
    const batches = pools.map(pool =>
        scValToArray([
            contractIdToScVal(pool),
            xdr.ScVal.scvSymbol(AMM_CONTRACT_METHOD.GET_INCENTIVES_INFO),
            scValToArray([publicKeyToScVal(accountId)]),
        ]),
    );

    return buildSmartContractTx(
        accountId,
        BATCH_SMART_CONTRACT_ID,
        BATCH_CONTRACT_METHOD.batch,
        scValToArray([publicKeyToScVal(accountId)]),
        scValToArray(batches),
        xdr.ScVal.scvBool(true),
    )
        .then(tx => simulateTx(tx))
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
                                const token = await parseTokenContractId(
                                    StellarSdk.StrKey.encodeContract(item.key().value().value()),
                                );
                                return {
                                    token,
                                    info: parsePoolRewards(item.val().value(), token.decimal),
                                };
                            }),
                        ),
                ),
            );
        });
}

export function getTotalShares(poolId: string) {
    return buildSmartContractTx(ACCOUNT_FOR_SIMULATE, poolId, AMM_CONTRACT_METHOD.GET_TOTAL_SHARES)
        .then(
            tx => simulateTx(tx) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
        )
        .then(({ result }) => {
            if (result) {
                return i128ToInt(result.retval);
            }

            throw new Error('getTotalShares error');
        });
}

export function getClaimRewardsTx(accountId: string, poolId: string) {
    return buildSmartContractTx(
        accountId,
        poolId,
        AMM_CONTRACT_METHOD.CLAIM,
        publicKeyToScVal(accountId),
    ).then(tx => prepareTransaction(tx));
}

export function getClaimIncentiveTx(accountId: string, poolId: string) {
    return buildSmartContractTx(
        accountId,
        poolId,
        AMM_CONTRACT_METHOD.CLAIM_INCENTIVES,
        publicKeyToScVal(accountId),
    ).then(tx => prepareTransaction(tx));
}

export function getClaimBatchTx(accountId: string, poolsAndTypes: string[]) {
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

    return buildSmartContractTx(
        accountId,
        BATCH_SMART_CONTRACT_ID,
        BATCH_CONTRACT_METHOD.batch,
        scValToArray([publicKeyToScVal(accountId)]),
        scValToArray(batches),
        xdr.ScVal.scvBool(false),
    ).then(tx => prepareTransaction(tx));
}

// Helper functions for creating core invocations and authorizations

/**
 * Creates the burn authorization invocation required to burn shares.
 */
function createBurnInvocation(accountId: string, shareAmount: string, shareAddress: string) {
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
function createWithdrawInvocation(
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
function createClaimInvocation(accountId: string, poolAddress: string, functionName: string) {
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
function createRootAuthorization(
    accountId: string,
    rootInvocation: xdr.SorobanAuthorizedInvocation,
) {
    return new xdr.SorobanAuthorizationEntry({
        credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
        rootInvocation,
    });
}

/**
 * Builds a transaction for a single withdraw function (either normal or single coin).
 */
async function buildSingleWithdrawTx(
    accountId: string,
    poolAddress: string,
    shareAmount: string,
    shareAddress: string,
    functionName: string,
    args: xdr.ScVal[],
): Promise<StellarSdk.Transaction> {
    const burnInvocation = createBurnInvocation(accountId, shareAmount, shareAddress);

    const rootInvocation = createRootAuthorization(
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

    const tx = await buildSmartContractTxFromOp(accountId, operation);
    return prepareTransaction(tx);
}

/**
 * Builds a batch transaction for withdraw + claim operations.
 */
async function buildWithdrawAndClaimTx(
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
                contractAddress: contractIdToScVal(BATCH_SMART_CONTRACT_ID).address(),
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

    const batchAuth = createRootAuthorization(accountId, rootInvocation);

    const batchOperation = StellarSdk.Operation.invokeContractFunction({
        contract: BATCH_SMART_CONTRACT_ID,
        function: BATCH_CONTRACT_METHOD.batch,
        args: [
            scValToArray([publicKeyToScVal(accountId)]),
            scValToArray(batchCalls),
            xdr.ScVal.scvBool(true),
        ],
        auth: [batchAuth],
    });

    const tx = await buildSmartContractTxFromOp(accountId, batchOperation);
    return prepareTransaction(tx);
}

// --- Exported functions for external use ---

export function getWithdrawAndClaim(
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
    return buildWithdrawAndClaimTx(
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

export function getSingleTokenWithdrawAndClaim(
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
    return buildWithdrawAndClaimTx(
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

export function getCustomWithdrawAndClaim(
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
    return buildWithdrawAndClaimTx(
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

export async function estimateCustomWithdraw(
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
    const tx = await buildSingleWithdrawTx(
        accountId,
        poolAddress,
        shareAmountMaximum,
        shareAddress,
        AMM_CONTRACT_METHOD.WITHDRAW_CUSTOM,
        args,
    );
    const res = await simulateTx(tx);

    return i128ToInt(res.result.retval);
}

export function getSingleTokenWithdrawEstimate(
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
    return buildSmartContractTx(
        ACCOUNT_FOR_SIMULATE,
        BATCH_SMART_CONTRACT_ID,
        BATCH_CONTRACT_METHOD.batch,
        scValToArray([publicKeyToScVal(ACCOUNT_FOR_SIMULATE)]),
        scValToArray(estimateCalls),
        xdr.ScVal.scvBool(true),
    )
        .then(tx => simulateTx(tx))
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

function getCreationFeeToken() {
    return buildSmartContractTx(
        ACCOUNT_FOR_SIMULATE,
        AMM_SMART_CONTRACT_ID,
        AMM_CONTRACT_METHOD.GET_CREATION_FEE_TOKEN,
    )
        .then(
            tx => simulateTx(tx) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
        )
        .then(({ result }) => parseTokenContractId(StellarSdk.scValToNative(result.retval)));
}

function getCreationFee(type: POOL_TYPE) {
    return buildSmartContractTx(
        ACCOUNT_FOR_SIMULATE,
        AMM_SMART_CONTRACT_ID,
        type === POOL_TYPE.constant
            ? AMM_CONTRACT_METHOD.GET_CONSTANT_CREATION_FEE
            : AMM_CONTRACT_METHOD.GET_STABLE_CREATION_FEE,
    )
        .then(
            tx => simulateTx(tx) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
        )
        .then(({ result }) => i128ToInt(result.retval));
}

function getCreationFeeAddress() {
    return buildSmartContractTx(
        ACCOUNT_FOR_SIMULATE,
        AMM_SMART_CONTRACT_ID,
        AMM_CONTRACT_METHOD.GET_INIT_POOL_DESTINATION,
    )
        .then(
            tx => simulateTx(tx) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
        )
        .then(({ result }) =>
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            StellarSdk.StrKey.encodeContract(result.retval.value().value()),
        );
}

export function getCreationFeeInfo() {
    return Promise.all([
        getCreationFeeToken(),
        getCreationFee(POOL_TYPE.constant),
        getCreationFee(POOL_TYPE.stable),
        getCreationFeeAddress(),
    ]).then(([token, constantFee, stableFee, destination]) => ({
        token,
        constantFee,
        stableFee,
        destination,
    }));
}

export function getPoolReserves(assets: Token[], poolId: string) {
    return buildSmartContractTx(ACCOUNT_FOR_SIMULATE, poolId, AMM_CONTRACT_METHOD.GET_RESERVES)
        .then(
            tx => simulateTx(tx) as Promise<StellarSdk.rpc.Api.SimulateTransactionSuccessResponse>,
        )
        .then(({ result }) => {
            if (result) {
                return orderTokens(assets).reduce((acc, asset, index) => {
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

export function getDepositTx(
    accountId: string,
    poolAddress: string,
    assets: Token[],
    amounts: Map<string, string>,
) {
    const args = [
        publicKeyToScVal(accountId),
        scValToArray(
            orderTokens(assets).map(asset =>
                amountToUint128(
                    amounts.get(getAssetString(asset)) || '0',
                    (asset as SorobanToken).decimal,
                ),
            ),
        ),
        amountToUint128('0.0000001'),
    ];

    const transferInvocations = orderTokens(assets).map(
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

    return buildSmartContractTxFromOp(accountId, operation).then(tx => prepareTransaction(tx));
}

export function getSwapChainedTx(
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
                    contractIdToScVal(AMM_SMART_CONTRACT_ID),
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
                    contractAddress: contractIdToScVal(AMM_SMART_CONTRACT_ID).address(),
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
    return buildSmartContractTxFromOp(accountId, operation).then(tx => prepareTransaction(tx));
}

export function getScheduleIncentiveTx(
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

    return buildSmartContractTx(
        accountId,
        AMM_SMART_CONTRACT_ID,
        AMM_CONTRACT_METHOD.SCHEDULE_INCENTIVE,
        publicKeyToScVal(accountId),
        scValToArray(pool.tokens.map(token => contractIdToScVal(token.contract))),
        hashToScVal(pool.index),
        contractIdToScVal(rewardToken.contract),
        amountToUint128(tps.toFixed(rewardToken.decimal), rewardToken.decimal),
        amountToUint64((startDate / 1000).toFixed(), 0),
        amountToUint64(duration, 0),
        swapChainedScVal,
    ).then(tx => prepareTransaction(tx));
}

export function getIncentivesConfig(): Promise<{ duration: number; minAquaAmount: number }> {
    const batches = [
        scValToArray([
            contractIdToScVal(AMM_SMART_CONTRACT_ID),
            xdr.ScVal.scvSymbol(AMM_CONTRACT_METHOD.GET_INCENTIVES_MIN_DURATION),
            scValToArray([]),
        ]),
        scValToArray([
            contractIdToScVal(AMM_SMART_CONTRACT_ID),
            xdr.ScVal.scvSymbol(AMM_CONTRACT_METHOD.GET_INCENTIVES_MIN_DAILY_AMOUNT),
            scValToArray([]),
        ]),
    ];

    return buildSmartContractTx(
        ACCOUNT_FOR_SIMULATE,
        BATCH_SMART_CONTRACT_ID,
        BATCH_CONTRACT_METHOD.batch,
        scValToArray([publicKeyToScVal(ACCOUNT_FOR_SIMULATE)]),
        scValToArray(batches),
        xdr.ScVal.scvBool(true),
    )
        .then(tx => simulateTx(tx))
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
