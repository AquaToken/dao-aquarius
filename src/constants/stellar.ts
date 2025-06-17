import * as StellarSdk from '@stellar/stellar-sdk';

import { ENV_PRODUCTION, ENV_TESTNET } from './env';

export const NETWORK_PASSPHRASES = {
    [ENV_PRODUCTION]: StellarSdk.Networks.PUBLIC,
    [ENV_TESTNET]: StellarSdk.Networks.TESTNET,
};

// First stellar account:)
export const ACCOUNT_FOR_SIMULATE = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7';

export const BASE_FEE = '100000';
