import axios from 'axios';

import { API_URLS } from 'constants/api';

import { getEnv } from 'helpers/env';
import { getMoonpayKeyByEnv } from 'helpers/moonpay';
import { getAquaContract } from 'helpers/soroban';

import {
    MoonpayCurrencies,
    MoonpayQuote,
    GetProxyAddressResponse,
    GetProxyMemoResponse,
    GetMoonpayBuyQuoteParams,
    GetMoonpayProxyFee,
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
}: GetMoonpayBuyQuoteParams): Promise<MoonpayQuote> => {
    const env = getEnv();
    const baseUrl = API_URLS[env].moonpay;

    return axios
        .get<MoonpayQuote>(
            `${baseUrl}/currencies/${cryptoCode}/buy_quote?apiKey=${getMoonpayKeyByEnv()}&baseCurrencyCode=${baseCurrencyCode}&baseCurrencyAmount=${baseCurrencyAmount}`,
        )
        .then(result => result.data);
};

export const getMoonpayFederationMemo = (
    publicKey: string,
): Promise<GetProxyMemoResponse['memo']> => {
    const env = getEnv();
    const baseUrl = API_URLS[env].onRampProxy;

    return axios
        .get<GetProxyMemoResponse>(`${baseUrl}/federation/?type=id&q=${publicKey}`)
        .then(res => res.data.memo);
};

export const getMoonpayProxyAddress = (
    publicKey: string,
): Promise<GetProxyAddressResponse['address']> => {
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
        .post<GetProxyAddressResponse>(`${baseUrl}/api/pool/proxy/generate/`, body, {
            headers,
        })
        .then(res => res.data.address);
};

export const getMoonpayProxyFees = (): Promise<GetMoonpayProxyFee['operational']> => {
    const env = getEnv();
    const baseUrl = API_URLS[env].onRampProxy;

    return axios
        .get<GetMoonpayProxyFee>(`${baseUrl}/api/pool/proxy/fees/`)
        .then(res => res.data.operational / 1e7);
};
