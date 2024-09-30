import { Asset } from 'types/stellar';

import { StellarService } from 'services/globalServices';

export const getAssetString = (asset: Asset): string => {
    if (asset.isNative()) {
        return 'native';
    }
    return `${asset.code}:${asset.issuer}`;
};

export const getStellarAsset = (code: string, issuer: string): Asset => {
    if (!issuer) {
        return StellarService.createLumen();
    }

    return StellarService.createAsset(code, issuer);
};

export const getAssetFromString = (str: string): Asset => {
    if (str === 'native') {
        return StellarService.createLumen();
    }

    const [code, issuer] = str.split(':');

    return StellarService.createAsset(code, issuer);
};
