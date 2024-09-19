import { Asset } from '@stellar/stellar-sdk';

export const getAssetString = (asset: Asset): string => {
    if (asset.isNative()) {
        return 'native';
    }
    return `${asset.code}:${asset.issuer}`;
};

export const getStellarAsset = (code: string, issuer: string): Asset => {
    if (!issuer) {
        return Asset.native();
    }

    return new Asset(code, issuer);
};
