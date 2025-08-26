import { AMM_TOKENS_LIST } from 'constants/local-storage';

import { StellarService } from 'services/globalServices';

import { Token, TokenType } from 'types/token';

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

        const lumen = StellarService.createLumen();

        return lumen.contract === token.contract
            ? { lumen }
            : StellarService.createAsset(token.code, token.issuer);
    });
};
