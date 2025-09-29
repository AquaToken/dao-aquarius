import * as StellarSdk from '@stellar/stellar-sdk';

export function isValidPublicKey(key: string): boolean {
    return StellarSdk.StrKey.isValidEd25519PublicKey(key);
}

export function isValidContract(id: string): boolean {
    return StellarSdk.StrKey.isValidContract(id);
}
