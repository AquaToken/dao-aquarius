import { ASSETS_ENV_DATA } from 'constants/assets';

import { StellarService } from 'services/globalServices';

import { Asset } from 'types/stellar';

import { getEnv } from './env';
import { getAquaContract, getUsdcContract } from './soroban';

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

// TODO: refactor getassetData to one function
export const getAquaAssetData = () => {
    const env = getEnv();
    const data = ASSETS_ENV_DATA[env].aqua;

    return {
        ...data,
        aquaStellarAsset: StellarService.createAsset(data.aquaCode, data.aquaIssuer),
        aquaContract: getAquaContract(),
    };
};

export const getUsdcAssetData = () => {
    const env = getEnv();
    const data = ASSETS_ENV_DATA[env].usdc;

    return {
        ...data,
        usdcStellarAsset: StellarService.createAsset(data.usdcCode, data.usdcIssuer),
        usdcContract: getUsdcContract(),
    };
};
