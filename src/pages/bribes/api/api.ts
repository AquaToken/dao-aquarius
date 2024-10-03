import * as StellarSdk from '@stellar/stellar-sdk';
import axios from 'axios';

import { AssetSimple, ListResponse } from 'store/assetsStore/types';

import { UpcomingBribe } from './types';

import { MarketKey } from '../../vote/api/types';
const marketKeysUrl = 'https://marketkeys-tracker.aqua.network/api/market-keys/';
const bribesApiUrl = 'https://bribes-api.aqua.network/api/';

const getAssetParam = (asset: AssetSimple) =>
    new StellarSdk.Asset(asset.code, asset.issuer).isNative()
        ? 'native'
        : `${asset.code}:${asset.issuer}`;

export const getMarketPair = (base, counter) =>
    axios
        .get<MarketKey>(`${marketKeysUrl}${getAssetParam(base)}-${getAssetParam(counter)}`)
        .then(({ data }) => data)
        .catch(() => null);

export enum BribeSortFields {
    aquaAmountUp = '-aqua_total_reward_amount_equivalent',
    aquaAmountDown = 'aqua_total_reward_amount_equivalent',
    startAtUp = '-start_at',
    startAtDown = 'start_at',
}

export const getBribes = async (
    pageSize: number,
    page: number,
    sort: BribeSortFields,
    filterByAmount: boolean,
) => {
    const { count, results } = await axios
        .get<ListResponse<UpcomingBribe>>(
            `${bribesApiUrl}pending-bribes/?limit=${pageSize}&page=${page}&ordering=${sort}&aqua_total_reward_amount_equivalent__gte=${
                filterByAmount ? '100000' : '-1'
            }`,
        )
        .then(result => {
            const { count, results } = result.data;
            return {
                count,
                results,
            };
        });

    const keysParams = new URLSearchParams();

    results.forEach(bribe => {
        keysParams.append('account_id', bribe.market_key);
    });

    const marketKeys = await axios.get<ListResponse<MarketKey>>(marketKeysUrl, {
        params: keysParams,
    });

    const bribes = results.map(bribe => {
        const marketKey = marketKeys.data.results.find(
            marketKey => marketKey.account_id === bribe.market_key,
        );

        return { ...bribe, ...marketKey };
    });

    return { count, bribes };
};
