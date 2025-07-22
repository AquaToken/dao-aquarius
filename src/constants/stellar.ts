import * as StellarSdk from '@stellar/stellar-sdk';

import { ENV_PRODUCTION, ENV_TESTNET } from './env';

export const NETWORK_PASSPHRASES = {
    [ENV_PRODUCTION]: StellarSdk.Networks.PUBLIC,
    [ENV_TESTNET]: StellarSdk.Networks.TESTNET,
};

// AQUA issuer account:)
export const ACCOUNT_FOR_SIMULATE = 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA';

export const BASE_FEE = '100000';
