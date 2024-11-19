import axios from 'axios';

import { API_URLS } from 'constants/api';

import { getEnv } from 'helpers/env';
import { getMoonpayKeyByEnv } from 'helpers/moonpay';
import { getAquaContract } from 'helpers/soroban';

import {
    MoonpayCurrencies,
    MoonpayQuote,
    ProxyAddressResponse,
    ProxyMemoResponse,
    MoonpayBuyQuoteParams,
    MoonpayProxyFeeResponse,
    ProxyTrxListResponse,
    ProxyTrxResponse,
    MoonpaySignatureResponse,
} from 'types/api-moonpay';

export const getMoonpayCurrencies = (): Promise<MoonpayCurrencies> => {
    const env = getEnv();
    const baseUrl = API_URLS[env].moonpay;

    return axios
        .get<MoonpayCurrencies>(`${baseUrl}/currencies?apiKey=${getMoonpayKeyByEnv()}`)
        .then(result => result.data);
};

export const getMoonpayBuyQuote = ({
    cryptoCode,
    baseCurrencyCode,
    baseCurrencyAmount,
}: MoonpayBuyQuoteParams): Promise<MoonpayQuote> => {
    const env = getEnv();
    const baseUrl = API_URLS[env].moonpay;

    return axios
        .get<MoonpayQuote>(
            `${baseUrl}/currencies/${cryptoCode}/buy_quote?apiKey=${getMoonpayKeyByEnv()}&baseCurrencyCode=${baseCurrencyCode}&baseCurrencyAmount=${baseCurrencyAmount}`,
        )
        .then(result => result.data);
};

export const getMoonpayProxyMemo = (publicKey: string): Promise<ProxyMemoResponse['memo']> => {
    const env = getEnv();
    const baseUrl = API_URLS[env].onRampProxy;

    return axios
        .get<ProxyMemoResponse>(`${baseUrl}/federation/?type=id&q=${publicKey}`)
        .then(res => res.data.memo);
};

export const getMoonpayProxyAddress = (
    publicKey: string,
): Promise<ProxyAddressResponse['address']> => {
    const env = getEnv();
    const baseUrl = API_URLS[env].onRampProxy;
    const aquaContract = getAquaContract();

    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };

    const body = JSON.stringify({
        destination: publicKey,
        token_to_buy: aquaContract,
    });

    return axios
        .post<ProxyAddressResponse>(`${baseUrl}/api/pool/proxy/generate/`, body, {
            headers,
        })
        .then(res => res.data.address);
};

export const getMoonpayProxyFees = (): Promise<MoonpayProxyFeeResponse['operational']> => {
    const env = getEnv();
    const baseUrl = API_URLS[env].onRampProxy;

    return axios
        .get<MoonpayProxyFeeResponse>(`${baseUrl}/api/pool/proxy/fees/`)
        .then(res => res.data.operational / 1e7);
};

// Here can be only 1 result in array for proxy address
export const getMoonpayProxyTrx = (publicKey: string): Promise<ProxyTrxResponse[]> => {
    const env = getEnv();

    const baseUrl = API_URLS[env].onRampProxy;

    return axios
        .get<ProxyTrxListResponse>(`${baseUrl}/api/pool/operations/?proxy_wallet=${publicKey}`)
        .then(res => res.data.results);
};

export const getMoonpayUrlSignature = (
    url: string,
): Promise<MoonpaySignatureResponse['signature']> => {
    const env = getEnv();
    const baseUrl = API_URLS[env].onRampProxy;

    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };

    const body = JSON.stringify({
        url,
    });

    return axios
        .post<MoonpaySignatureResponse>(
            `${baseUrl}/api/pool/integrations/moonpay/sign-url/`,
            body,
            {
                headers,
            },
        )
        .then(res => res.data.signature);
};
