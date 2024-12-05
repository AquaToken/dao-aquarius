import * as StellarSdk from '@stellar/stellar-sdk';

import { ENV_PRODUCTION, ENV_TESTNET } from './env';

export const NETWORK_PASSPHRASES = {
    [ENV_PRODUCTION]: StellarSdk.Networks.PUBLIC,
    [ENV_TESTNET]: StellarSdk.Networks.TESTNET,
};
