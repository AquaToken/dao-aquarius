import { ASSETS_ENV_DATA } from 'constants/assets';

import { SorobanService, StellarService } from 'services/globalServices';

import { Asset } from 'types/stellar';
import { ClassicToken, Token, TokenType } from 'types/token';

import { getEnv, getNetworkPassphrase } from './env';

export const getAssetString = (asset: Token): string => {
    if (asset.type === TokenType.soroban) {
        return asset.contract;
    }
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

export const getAssetFromString = (str: string, onUpdateCB?: () => void): Token => {
    if (StellarService.isValidContract(str)) {
        const result = { contract: str } as Token;

        SorobanService.parseTokenContractId(str).then((res: Token) => {
            Object.assign(result, res);
            if (onUpdateCB) {
                onUpdateCB();
            }
        });
        return result;
    }
    if (str === 'native') {
        const asset: ClassicToken = StellarService.createLumen() as ClassicToken;

        asset.type = TokenType.classic;
        asset.contract = asset.contractId(getNetworkPassphrase());
        return asset;
    }

    const [code, issuer] = str.split(':');

    const asset: ClassicToken = StellarService.createAsset(code, issuer) as ClassicToken;
    asset.type = TokenType.classic;
    asset.contract = asset.contractId(getNetworkPassphrase());
    return asset;
};

// TODO: refactor getassetData to one function
export const getAquaAssetData = () => {
    const env = getEnv();
    const data = ASSETS_ENV_DATA[env].aqua;
    const asset = StellarService.createAsset(data.aquaCode, data.aquaIssuer);

    return {
        ...data,
        aquaStellarAsset: asset,
        aquaContract: asset.contractId(getNetworkPassphrase()),
    };
};

export const getUsdcAssetData = () => {
    const env = getEnv();
    const data = ASSETS_ENV_DATA[env].usdc;
    const asset = StellarService.createAsset(data.usdcCode, data.usdcIssuer);

    return {
        ...data,
        usdcStellarAsset: asset,
        usdcContract: asset.contractId(getNetworkPassphrase()),
    };
};
