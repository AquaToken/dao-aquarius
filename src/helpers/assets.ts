import { ASSETS_ENV_DATA } from 'constants/assets';

import { createAsset, createLumen, getTokensFromCache } from 'helpers/token';

import { SorobanService } from 'services/globalServices';
import { isValidContract } from 'services/stellar/utils/validators';

import { Asset } from 'types/stellar';
import { ClassicToken, Token, TokenType } from 'types/token';

import { getEnv, getNetworkPassphrase } from './env';

export const getAssetString = (asset: Token): string => {
    if (asset.type === TokenType.soroban) {
        return asset.contract;
    }
    if (asset?.isNative?.()) {
        return 'native';
    }
    return `${asset.code}:${asset.issuer}`;
};

export const getStellarAsset = (code: string, issuer: string): Asset => {
    if (!issuer) {
        return createLumen();
    }

    return createAsset(code, issuer);
};

export const getAssetFromString = (str: string, onUpdateCB?: (token: Token) => void): Token => {
    if (isValidContract(str)) {
        const result = { contract: str, type: TokenType.soroban } as Token;

        const cache = getTokensFromCache();
        const cachedToken = cache?.find(({ contract }) => contract === str);

        if (cachedToken) {
            if (onUpdateCB) {
                onUpdateCB(cachedToken);
            }
            return cachedToken;
        }

        SorobanService.token.parseTokenContractId(str).then((res: Token) => {
            Object.assign(result, res);
            if (onUpdateCB) {
                onUpdateCB(result);
            }
        });
        return result;
    }
    if (str === 'native') {
        const asset: ClassicToken = createLumen() as ClassicToken;

        asset.type = TokenType.classic;
        asset.contract = asset.contractId(getNetworkPassphrase());
        asset.decimal = 7;
        if (onUpdateCB) {
            onUpdateCB(asset);
        }
        return asset;
    }

    const [code, issuer] = str.split(':');

    const asset: ClassicToken = createAsset(code, issuer) as ClassicToken;
    asset.type = TokenType.classic;
    asset.contract = asset.contractId(getNetworkPassphrase());
    asset.decimal = 7;
    if (onUpdateCB) {
        onUpdateCB(asset);
    }
    return asset;
};

// TODO: refactor getassetData to one function
export const getAquaAssetData = () => {
    const env = getEnv();
    const data = ASSETS_ENV_DATA[env].aqua;
    const asset = createAsset(data.aquaCode, data.aquaIssuer);

    return {
        ...data,
        aquaStellarAsset: asset,
        aquaContract: asset.contractId(getNetworkPassphrase()),
    };
};

export const getUsdcAssetData = () => {
    const env = getEnv();
    const data = ASSETS_ENV_DATA[env].usdc;
    const asset = createAsset(data.usdcCode, data.usdcIssuer);

    return {
        ...data,
        usdcStellarAsset: asset,
        usdcContract: asset.contractId(getNetworkPassphrase()),
    };
};
