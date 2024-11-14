import {
    MOONPAY_CURRENCY_PREFIXES,
    MOONPAY_ENV_KEYS,
    MOONPAY_DEFAULT_PROXY_CODE,
} from 'constants/moonpay';

import { getEnv } from './env';

export const getMoonpayKeyByEnv = () => MOONPAY_ENV_KEYS[getEnv()];

export const getDefaultProxyCrypto = () => MOONPAY_DEFAULT_PROXY_CODE[getEnv()];

export const getMoonpayCurrencyPrefix = (currencyCode?: string) =>
    MOONPAY_CURRENCY_PREFIXES[currencyCode] || '';
