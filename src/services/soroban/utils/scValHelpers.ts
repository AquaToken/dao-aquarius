import * as StellarSdk from '@stellar/stellar-sdk';
import { Asset, StrKey, xdr } from '@stellar/stellar-sdk';
import BigNumber from 'bignumber.js';

import { getAssetString } from 'helpers/assets';
import { getNetworkPassphrase } from 'helpers/env';

import { SorobanToken, Token } from 'types/token';

export function contractIdToScVal(contractId: string) {
    return StellarSdk.Address.contract(StrKey.decodeContract(contractId)).toScVal();
}

export function scValToArray(array: xdr.ScVal[]): xdr.ScVal {
    return xdr.ScVal.scvVec(array);
}

export function assetToScVal(asset: Asset): xdr.ScVal {
    return xdr.ScVal.scvAddress(
        StellarSdk.Address.contract(
            StrKey.decodeContract(asset.contractId(getNetworkPassphrase())),
        ).toScAddress(),
    );
}

export function publicKeyToScVal(pubkey: string): xdr.ScVal {
    return xdr.ScVal.scvAddress(StellarSdk.Address.fromString(pubkey).toScAddress());
}

export function amountToUint32(amount: number): xdr.ScVal {
    return xdr.ScVal.scvU32(Math.floor(amount));
}

export function amountToUint64(amount: string, decimals = 7): xdr.ScVal {
    return new StellarSdk.XdrLargeInt(
        'u64',
        new BigNumber(Number(amount).toFixed(decimals)).times(Math.pow(10, decimals)).toFixed(),
    ).toU64();
}

export function amountToInt128(amount: string, decimals = 7): xdr.ScVal {
    return new StellarSdk.XdrLargeInt(
        'i128',
        new BigNumber(Number(amount).toFixed(decimals)).times(Math.pow(10, decimals)).toFixed(),
    ).toI128();
}

export function amountToUint128(amount: string, decimals = 7): xdr.ScVal {
    return new StellarSdk.XdrLargeInt(
        'u128',
        new BigNumber(Number(amount).toFixed(decimals)).times(Math.pow(10, decimals)).toFixed(),
    ).toU128();
}

export function scValToNative(value: xdr.ScVal) {
    return StellarSdk.scValToNative(value);
}

export function i128ToInt(val: xdr.ScVal, decimals = 7): string {
    return new BigNumber(StellarSdk.scValToNative(val)).div(Math.pow(10, decimals)).toString();
}

export function hashToScVal(hash: string): xdr.ScVal {
    const bytes = Buffer.from(hash, 'hex');

    return xdr.ScVal.scvBytes(bytes);
}

export function tickToScVal(tick: number): xdr.ScVal {
    return xdr.ScVal.scvI32(Math.trunc(tick));
}

export function getAmountByAsset(amounts: Map<string, string>, asset: Token): string {
    return amounts.get(getAssetString(asset)) || amounts.get(asset.contract) || '0';
}

export function toTokenAmountsScVal(
    orderedTokens: Token[],
    amounts: Map<string, string>,
): xdr.ScVal {
    return scValToArray(
        orderedTokens.map(asset =>
            amountToUint128(getAmountByAsset(amounts, asset), (asset as SorobanToken).decimal),
        ),
    );
}

export function parseTokenAmountsScVal(values: xdr.ScVal[], orderedTokens: Token[]): string[] {
    return values.map((val, index) =>
        i128ToInt(val, (orderedTokens[index] as SorobanToken).decimal),
    );
}
