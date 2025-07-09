import { Asset } from 'types/stellar';

export enum TokenType {
    classic = 'classic',
    soroban = 'soroban',
}

export type ClassicToken = Asset & {
    type: TokenType.classic;
    contract: string;
};

export type SorobanToken = {
    type: TokenType.soroban;
    contract: string;
    name: string;
    code: string;
};

export type Token = ClassicToken | SorobanToken;
