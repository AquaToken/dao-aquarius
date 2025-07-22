import axios from 'axios';

import { BRIBES_API_URL, MARKET_KEY_API_URL } from 'constants/api';

import { getAssetString } from 'helpers/assets';

import { AssetSimple } from 'store/assetsStore/types';

import { StellarService } from 'services/globalServices';

import { UpcomingBribe } from './types';

import { MarketBribes, MarketKey, ListResponse } from '../../vote/api/types';

const getAssetParam = (asset: AssetSimple) =>
    getAssetString(StellarService.createAsset(asset.code, asset.issuer));

export const getMarketPair = (base, counter) =>
    axios
        .get<MarketKey>(`${MARKET_KEY_API_URL}${getAssetParam(base)}-${getAssetParam(counter)}`)
        .then(({ data }) => data)
        .catch(() => null);

export enum BribeSortFields {
    aquaAmountUp = '-aqua_total_reward_amount_equivalent',
    aquaAmountDown = 'aqua_total_reward_amount_equivalent',
    startAtUp = '-start_at',
    startAtDown = 'start_at',
}

const processBribes = async (results: UpcomingBribe[] | MarketBribes[], count: number) => {
    const keysParams = new URLSearchParams();

    results.forEach(bribe => {
        keysParams.append('account_id', bribe.market_key);
    });

    const marketKeys = await axios.get<ListResponse<MarketKey>>(MARKET_KEY_API_URL, {
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

export const getUpcomingBribes = async (
    pageSize: number,
    page: number,
    sort: BribeSortFields,
    filterByAmount: boolean,
) => {
    const { count, results } = await axios
        .get<ListResponse<UpcomingBribe>>(
            `${BRIBES_API_URL}pending-bribes/?limit=${pageSize}&page=${page}&ordering=${sort}&aqua_total_reward_amount_equivalent__gte=${
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

    return processBribes(results, count);
};
