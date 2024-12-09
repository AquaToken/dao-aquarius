export interface FiatCurrency {
    id: string;
    createdAt: string;
    updatedAt: string;
    type: 'fiat';
    name: string;
    code: string;
    precision: number;
    decimals: number | null;
    icon: string;
    maxAmount: number;
    minAmount: number;
    minBuyAmount: number;
    maxBuyAmount: number;
    isSellSupported: boolean;
    isUtxoCompatible: boolean;
}

interface CryptoMetadata {
    contractAddress: string | null;
    coinType: string | null;
    chainId: string | null;
    networkCode: string;
}

export interface CryptoCurrency {
    notAllowedUSStates?: string[];
    notAllowedCountries?: string[];
    id: string;
    createdAt: string;
    updatedAt: string;
    type: 'crypto';
    name: string;
    code: string;
    precision: number;
    decimals: number;
    icon: string;
    maxAmount: number | null;
    minAmount: number | null;
    minBuyAmount: number;
    maxBuyAmount: number | null;
    isSellSupported: boolean;
    isUtxoCompatible: boolean;
    addressRegex: string;
    testnetAddressRegex: string;
    supportsAddressTag: boolean;
    addressTagRegex: string | null;
    supportsTestMode: boolean;
    supportsLiveMode: boolean;
    isSuspended: boolean;
    isStableCoin: boolean;
    confirmationsRequired: number | null;
    minSellAmount: number;
    maxSellAmount: number | null;
    isSwapBaseSupported: boolean;
    isSwapQuoteSupported: boolean;
    isBaseAsset: boolean;
    isSupportedInUS: boolean;
    metadata: CryptoMetadata;
}

export type MoonpayCurrencies = (FiatCurrency | CryptoCurrency)[];
export type MoonpayCurrency = FiatCurrency | CryptoCurrency;

export interface QuoteCurrency {
    id: string;
    createdAt: string;
    updatedAt: string;
    type: 'fiat' | 'crypto';
    name: string;
    code: string;
    precision: number;
    minBuyAmount: number;
    maxBuyAmount: number;
    minSellAmount?: number;
    maxSellAmount?: number;
    addressRegex?: string;
    testnetAddressRegex?: string;
    supportsAddressTag?: boolean;
    addressTagRegex?: string | null;
    supportsTestMode?: boolean;
    isSuspended?: boolean;
    isSupportedInUs?: boolean;
    isSellSupported: boolean;
    notAllowedUSStates?: string[];
    notAllowedCountries?: string[];
    metadata?: {
        contractAddress?: number;
        chainId?: string;
        networkCode?: string;
    };
}

export interface MoonpayQuote {
    accountId: string;
    baseCurrency: QuoteCurrency;
    baseCurrencyCode: string;
    baseCurrencyAmount: number;
    quoteCurrency: QuoteCurrency;
    quoteCurrencyCode: string;
    quoteCurrencyAmount: number;
    quoteCurrencyPrice: number;
    paymentMethod: 'credit_debit_card' | 'bank_transfer' | string;
    feeAmount: number;
    extraFeePercentage: number;
    extraFeeAmount: number;
    networkFeeAmount: number;
    networkFeeAmountNonRefundable: boolean;
    totalAmount: number;
    externalId: string | null;
    externalCustomerId: string | null;
    signature: string;
    expiresIn: number;
    expiresAt: string;
}

export type MoonpayBuyQuoteParams = {
    cryptoCode: string;
    baseCurrencyCode: string;
    baseCurrencyAmount: string;
};

export type ProxyMemoResponse = {
    account_id: string;
    memo: string;
};

export type ProxyAddressResponse = {
    address: string;
};

export type MoonpaySignatureResponse = {
    signature: string;
};

export type ProxyTrxResponse = {
    address: string;
    operation_status: 'payment' | 'request' | 'completed';
    proxy_wallet: string;
    destination_address: string;
    payment_op_id: number;
    payment_tx_id: string;
    request_tx_id: string | null;
    swap_tx_id: string | null;
    last_tx_envelope: string;
    last_tx_error: string;
    created: string;
    modified: string;
};

export type ProxyTrxListResponse = {
    count: number;
    next: string | null;
    previous: string | null;
    results: ProxyTrxResponse[];
};

export type MoonpayProxyFeeResponse = {
    operational: number;
};
