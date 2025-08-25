import * as StellarSdk from '@stellar/stellar-sdk';
import { Asset, StrKey, xdr } from '@stellar/stellar-sdk';
import BigNumber from 'bignumber.js';

import { getAssetContractId } from 'services/soroban/contracts/tokenContract';

export function contractIdToScVal(contractId: string) {
    return StellarSdk.Address.contract(StrKey.decodeContract(contractId)).toScVal();
}

export function scValToArray(array: xdr.ScVal[]): xdr.ScVal {
    return xdr.ScVal.scvVec(array);
}

export function assetToScVal(asset: Asset): xdr.ScVal {
    return xdr.ScVal.scvAddress(
        StellarSdk.Address.contract(StrKey.decodeContract(getAssetContractId(asset))).toScAddress(),
    );
}

export function publicKeyToScVal(pubkey: string): xdr.ScVal {
    return xdr.ScVal.scvAddress(StellarSdk.Address.fromString(pubkey).toScAddress());
}

export function amountToUint32(amount: number): xdr.ScVal {
    return xdr.ScVal.scvU32(Math.floor(amount));
}

export function amountToInt128(amount: string, decimals = 7): xdr.ScVal {
    return new StellarSdk.XdrLargeInt(
        'i128',
        new BigNumber(amount).times(Math.pow(10, decimals)).toFixed(),
    ).toI128();
}

export function amountToUint128(amount: string, decimals = 7): xdr.ScVal {
    return new StellarSdk.XdrLargeInt(
        'u128',
        new BigNumber(amount).times(Math.pow(10, decimals)).toFixed(),
    ).toU128();
}

export function scValToNative(value: xdr.ScVal) {
    return StellarSdk.scValToNative(value);
}

export function i128ToInt(val: xdr.ScVal, decimals = 7): string {
    return new BigNumber(StellarSdk.scValToNative(val)).div(Math.pow(10, decimals)).toString();
}
