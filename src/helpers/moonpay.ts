import {
    MOONPAY_CURRENCY_PREFIXES,
    MOONPAY_ENV_KEYS,
    MOONPAY_PROXY_CRYPTO_CODES,
} from 'constants/moonpay';

import { getEnv } from './env';

export const getMoonpayKeyByEnv = () => MOONPAY_ENV_KEYS[getEnv()];

export const getMoonpayCurrencyPrefix = (currencyCode?: string) =>
    MOONPAY_CURRENCY_PREFIXES[currencyCode] || '';

export const getMoonpayProxyCrypto = () => MOONPAY_PROXY_CRYPTO_CODES[getEnv()];
