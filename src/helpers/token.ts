import * as StellarSdk from '@stellar/stellar-sdk';

import { AMM_TOKENS_LIST } from 'constants/local-storage';

import { getNetworkPassphrase } from 'helpers/env';

import { ClassicToken, Token, TokenType } from 'types/token';

export const createLumen = (): ClassicToken => {
    const asset: ClassicToken = StellarSdk.Asset.native() as ClassicToken;

    asset.type = TokenType.classic;
    asset.contract = asset.contractId(getNetworkPassphrase());
    asset.decimal = 7;

    return asset;
};

export const createAsset = (code: string, issuer: string): ClassicToken => {
    if (code === 'XLM' && !issuer) {
        return createLumen();
    }
    const asset: ClassicToken = new StellarSdk.Asset(code, issuer) as ClassicToken;

    asset.type = TokenType.classic;
    asset.contract = asset.contractId(getNetworkPassphrase());
    asset.decimal = 7;

    return asset;
};

export const cacheTokens = (tokens: Token[]) => {
    localStorage.setItem(AMM_TOKENS_LIST, JSON.stringify(tokens));
};

export const getTokensFromCache = (): Token[] | null => {
    const tokens = JSON.parse(localStorage.getItem(AMM_TOKENS_LIST));

    if (!tokens) return null;

    return tokens.map(token => {
        if (token.type === TokenType.soroban) {
            return token;
        }

        const lumen = createLumen();

        return lumen.contract === token.contract ? lumen : createAsset(token.code, token.issuer);
    });
};
