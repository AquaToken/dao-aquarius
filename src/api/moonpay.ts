import axios from 'axios';

import { API_URLS } from 'constants/api';

import { getEnv } from 'helpers/env';
import { getMoonpayKeyByEnv } from 'helpers/moonpay';

import { MoonpayCurrencies, MoonpayQuote } from 'types/api-moonpay';

export const getMoonpayCurrencies = (): Promise<MoonpayCurrencies> => {
    const env = getEnv();
    const baseUrl = API_URLS[env].moonpay;

    return axios
        .get<MoonpayCurrencies>(`${baseUrl}/currencies?apiKey=${getMoonpayKeyByEnv()}`)
        .then(result => result.data);
};

type getMoonpayBuyQuoteParams = {
    cryptoCode: string;
    baseCurrencyCode: string;
    baseCurrencyAmount: string;
};

export const getMoonpayBuyQuote = ({
    cryptoCode,
    baseCurrencyCode,
    baseCurrencyAmount,
}: getMoonpayBuyQuoteParams): Promise<MoonpayQuote> => {
    const env = getEnv();
    const baseUrl = API_URLS[env].moonpay;

    return axios
        .get<MoonpayQuote>(
            `${baseUrl}/currencies/${cryptoCode}/buy_quote?apiKey=${getMoonpayKeyByEnv()}&baseCurrencyCode=${baseCurrencyCode}&baseCurrencyAmount=${baseCurrencyAmount}`,
        )
        .then(result => result.data);
};
export type ProxyFederationResponse = {
    account_id: string;
    memo: string;
};

export const getMoonpayFederationMemo = (
    publicKey: string,
): Promise<ProxyFederationResponse['memo']> => {
    const env = getEnv();
    const baseUrl = API_URLS[env].onRampProxy;

    return axios
        .get<ProxyFederationResponse>(`${baseUrl}/federation/?type=id&q=${publicKey}`)
        .then(res => res.data.memo);
};

export type ProxyAddressResponse = {
    address: string;
};

export const getMoonpayProxyAddress = (publicKey: string): Promise<string> => {
    const env = getEnv();
    const baseUrl = API_URLS[env].onRampProxy;

    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };
    const TESTNET_AQUA_CONTRACT = 'CDNVQW44C3HALYNVQ4SOBXY5EWYTGVYXX6JPESOLQDABJI5FC5LTRRUE';

    const body = JSON.stringify({
        destination: publicKey,
        token_to_buy: TESTNET_AQUA_CONTRACT,
    });

    return axios
        .post<ProxyAddressResponse>(`${baseUrl}/api/pool/proxy/generate/`, body, {
            headers,
        })
        .then(res => res.data.address);
};
