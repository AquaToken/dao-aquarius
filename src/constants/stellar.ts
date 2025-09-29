import * as StellarSdk from '@stellar/stellar-sdk';

import { ENV_PRODUCTION, ENV_TESTNET } from './env';

export const NETWORK_PASSPHRASES = {
    [ENV_PRODUCTION]: StellarSdk.Networks.PUBLIC,
    [ENV_TESTNET]: StellarSdk.Networks.TESTNET,
};

export const BASE_FEE = '100000';

export enum THRESHOLDS {
    LOW = 'low_threshold',
    MED = 'med_threshold',
    HIGH = 'high_threshold',
    MULTIPLE = 'multiple',
    UNKNOWN = 'unknown',
}

export const THRESHOLD_ORDER = {
    [THRESHOLDS.LOW]: 1,
    [THRESHOLDS.MED]: 2,
    [THRESHOLDS.HIGH]: 3,
};

export const OP_THRESHOLDS = {
    [THRESHOLDS.LOW]: ['allowTrust', 'inflation', 'bumpSequence', 'setTrustLineFlags'],
    [THRESHOLDS.MED]: [
        'createAccount',
        'payment',
        'pathPayment',
        'pathPaymentStrictSend',
        'pathPaymentStrictReceive',
        'manageBuyOffer',
        'manageSellOffer',
        'createPassiveSellOffer',
        'changeTrust',
        'manageData',
        'createClaimableBalance',
        'claimClaimableBalance',
        'beginSponsoringFutureReserves',
        'endSponsoringFutureReserves',
        'revokeSponsorship',
        'revokeAccountSponsorship',
        'revokeTrustlineSponsorship',
        'revokeOfferSponsorship',
        'revokeDataSponsorship',
        'revokeClaimableBalanceSponsorship',
        'revokeLiquidityPoolSponsorship',
        'revokeSignerSponsorship',
        'clawback',
        'clawbackClaimableBalance',
        'invokeHostFunction',
        'extendFootprintTtl',
        'restoreFootprint',
        'liquidityPoolDeposit',
        'liquidityPoolWithdraw',
    ],
    [THRESHOLDS.HIGH]: ['accountMerge'],
    [THRESHOLDS.MULTIPLE]: ['setOptions'], // med or high
};
