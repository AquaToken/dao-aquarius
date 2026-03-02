import * as StellarSdk from '@stellar/stellar-sdk';
import { Asset, StrKey, xdr } from '@stellar/stellar-sdk';
import BigNumber from 'bignumber.js';

import { getNetworkPassphrase } from 'helpers/env';

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

const scaleAmount = (amount: string, decimals: number) =>
    new BigNumber(amount)
        .times(new BigNumber(10).pow(decimals))
        .integerValue(BigNumber.ROUND_DOWN)
        .toFixed(0);

export function amountToUint64(amount: string, decimals = 7): xdr.ScVal {
    return new StellarSdk.XdrLargeInt('u64', scaleAmount(amount, decimals)).toU64();
}

export function amountToInt128(amount: string, decimals = 7): xdr.ScVal {
    return new StellarSdk.XdrLargeInt('i128', scaleAmount(amount, decimals)).toI128();
}

export function amountToUint128(amount: string, decimals = 7): xdr.ScVal {
    return new StellarSdk.XdrLargeInt('u128', scaleAmount(amount, decimals)).toU128();
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
