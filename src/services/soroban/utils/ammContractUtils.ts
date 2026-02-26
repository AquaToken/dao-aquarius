import { xdr } from '@stellar/stellar-sdk';

import { ASSET_CONTRACT_METHOD } from 'constants/soroban';

import {
    amountToInt128,
    contractIdToScVal,
    publicKeyToScVal,
} from 'services/soroban/utils/scValHelpers';

export const createBurnInvocation = (
    accountId: string,
    shareAmount: string,
    shareAddress: string,
) =>
    new xdr.SorobanAuthorizedInvocation({
        function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
            new xdr.InvokeContractArgs({
                functionName: ASSET_CONTRACT_METHOD.BURN,
                contractAddress: contractIdToScVal(shareAddress).address(),
                args: [publicKeyToScVal(accountId), amountToInt128(shareAmount)],
            }),
        ),
        subInvocations: [],
    });

export const createWithdrawInvocation = (
    poolAddress: string,
    functionName: string,
    args: xdr.ScVal[],
    burnInvocation: xdr.SorobanAuthorizedInvocation,
) =>
    new xdr.SorobanAuthorizedInvocation({
        function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
            new xdr.InvokeContractArgs({
                contractAddress: contractIdToScVal(poolAddress).address(),
                functionName,
                args,
            }),
        ),
        subInvocations: [burnInvocation],
    });

export const createClaimInvocation = (
    accountId: string,
    poolAddress: string,
    functionName: string,
) =>
    new xdr.SorobanAuthorizedInvocation({
        function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
            new xdr.InvokeContractArgs({
                contractAddress: contractIdToScVal(poolAddress).address(),
                functionName,
                args: [publicKeyToScVal(accountId)],
            }),
        ),
        subInvocations: [],
    });

export const createRootAuthorization = (rootInvocation: xdr.SorobanAuthorizedInvocation) =>
    new xdr.SorobanAuthorizationEntry({
        credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
        rootInvocation,
    });
