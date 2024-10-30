import { ENV_PRODUCTION, ENV_TESTNET } from './env';

export const DEFAULT_BUY_CRYPTO_CODE = 'xlm';
export const DEFAULT_BUY_CRYPTO_CODE_TEST = 'xlm';

export const MOONPAY_API_KEY_TEST = 'pk_test_6lvVjasw2rT5fpJcd63Zv43EtggBmE6';
export const MOONPAY_API_KEY = 'pk_live_vey5ThAFsfLfZKBBTtyk2KjIxh4omHHV';

export const MOONPAY_ENV_KEYS = {
    [ENV_PRODUCTION]: MOONPAY_API_KEY,
    [ENV_TESTNET]: MOONPAY_API_KEY_TEST,
};

export const MOONPAY_CURRENCY_PREFIXES = {
    aud: '$',
    bgn: 'лв',
    brl: 'R$',
    cad: '$',
    chf: 'CHF',
    cop: '$',
    czk: 'Kč',
    dkk: 'kr',
    dop: 'RD$',
    egp: '£',
    eur: '€',
    gbp: '£',
    hkd: '$',
    idr: 'Rp',
    ils: '₪',
    jod: 'JD',
    kes: 'KSh',
    kwd: 'KD',
    lkr: 'Rs',
    mxn: '$',
    ngn: '₦',
    nok: 'kr',
    nzd: '$',
    omr: 'ر.ع.',
    pen: 'S/',
    pln: 'zł',
    ron: 'lei',
    sek: 'kr',
    thb: '฿',
    try: '₺',
    twd: 'NT$',
    usd: '$',
    vnd: '₫',
    zar: 'R',
};
