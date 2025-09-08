import axios from 'axios';

import { BRIBES_API_URL } from 'constants/api';

import { getAssetString } from 'helpers/assets';
import { createAsset } from 'helpers/token';

import { AssetSimple } from 'store/assetsStore/types';

import {
    ListResponse,
    MarketBribes,
    MarketKey,
    MarketVotes,
    PairStats,
    Rewards,
    TotalStats,
    UpcomingBribe,
} from './types';

const marketKeysUrl = 'https://marketkeys-tracker.aqua.network/api/market-keys/';
const votingTrackerUrl = 'https://voting-tracker.aqua.network/api/voting-snapshot/';
const rewardsApi =
    'https://reward-api.aqua.network/api/rewards/?ordering=-daily_total_reward&page=1&page_size=200';

export enum SortTypes {
    popular = 'popular',
    topVoted = 'top',
    withBribes = 'with_bribes',
    yourVotes = 'your_votes',
}

const getPairUrl = (sortType: SortTypes, pageSize: number, page: number): string => {
    switch (sortType) {
        case SortTypes.popular:
            return `${votingTrackerUrl}top-voted/?limit=${pageSize}&page=${page}`;
        case SortTypes.topVoted:
            return `${votingTrackerUrl}top-volume/?limit=${pageSize}&page=${page}`;
    }
};

export const getMarketsMap = async (marketKeys: string[]): Promise<Map<string, MarketKey>> => {
    const params = new URLSearchParams();

    marketKeys.forEach(marketKey => {
        params.append('account_id', marketKey);
    });

    const markets = await axios
        .get<ListResponse<MarketKey>>(marketKeysUrl, { params })
        .then(res => res.data.results);

    return markets.reduce((acc, marketKey) => {
        acc.set(marketKey.account_id, marketKey);
        return acc;
    }, new Map<string, MarketKey>());
};

const addKeysToMarketVotes = async (votes: MarketVotes[], count) => {
    const params = new URLSearchParams();
    const bribesParams = new URLSearchParams();

    votes.forEach(marketVotes => {
        params.append('account_id', marketVotes.market_key);
        bribesParams.append('market_key', marketVotes.market_key);
    });

    const [marketsKeys, bribes] = await Promise.all([
        axios.get<ListResponse<MarketKey>>(marketKeysUrl, { params }),
        axios.get<ListResponse<MarketBribes>>(`${BRIBES_API_URL}bribes/?limit=200`, {
            params: bribesParams,
        }),
    ]);

    const pairs = votes.map(marketVotes => {
        const marketKey = marketsKeys.data.results.find(
            key => key.account_id === marketVotes.market_key,
        );

        const bribe = bribes.data.results.find(key => key.market_key === marketVotes.market_key);

        return { ...marketVotes, ...marketKey, ...bribe };
    });

    return { count, pairs };
};

export const getPairsList = async (
    sortType: SortTypes,
    pageSize: number,
    page: number,
): Promise<{ pairs: PairStats[]; count: number }> => {
    const url = getPairUrl(sortType, pageSize, page);

    const marketsVotes = await axios.get<ListResponse<MarketVotes>>(url);

    return addKeysToMarketVotes(marketsVotes.data.results, marketsVotes.data.count);
};

export const updateVotesForMarketKeys = async (pairs: PairStats[]): Promise<PairStats[]> => {
    if (!pairs?.length) {
        return pairs;
    }
    const params = new URLSearchParams();

    pairs.forEach(pair => {
        params.append('market_key', pair.market_key);
    });

    const marketsVotes = await axios.get<ListResponse<MarketVotes>>(votingTrackerUrl, {
        params,
    });

    return pairs.map(pair => {
        const marketVotes = marketsVotes.data.results.find(
            vote => vote.market_key === pair.account_id,
        );

        if (marketVotes) {
            return { ...pair, ...marketVotes };
        } else {
            return { ...pair, ...{ market_key: pair.account_id } };
        }
    });
};

export const validateMarketKeys = async (keys: string[]): Promise<MarketKey[]> => {
    if (!keys || !keys.length) {
        return [];
    }

    const paramsUp = new URLSearchParams();
    const paramsDown = new URLSearchParams();

    keys.forEach(key => {
        paramsUp.append('account_id', key);
        paramsDown.append('downvote_account_id', key);
    });

    const [marketKeysUp, marketKeysDown] = await Promise.all([
        axios.get<ListResponse<MarketKey>>(`${marketKeysUrl}?limit=200`, {
            params: paramsUp,
        }),
        axios.get<ListResponse<MarketKey>>(`${marketKeysUrl}?limit=200`, {
            params: paramsDown,
        }),
    ]);

    return [...marketKeysUp.data.results, ...marketKeysDown.data.results].filter(
        (value, index, self) => index === self.findIndex(t => t.account_id === value.account_id),
    );
};

export const getUserPairsList = async (keys: string[]) => {
    const marketKeys = await validateMarketKeys(keys);

    if (!marketKeys.length) {
        return [];
    }

    const marketVotesParams = new URLSearchParams();

    marketKeys.forEach(marketKey => {
        marketVotesParams.append('market_key', marketKey.account_id);
    });

    const [marketsVotes, bribes] = await Promise.all([
        axios.get<ListResponse<MarketVotes>>(votingTrackerUrl, {
            params: marketVotesParams,
        }),
        axios.get<ListResponse<MarketBribes>>(`${BRIBES_API_URL}bribes/?limit=200`, {
            params: marketVotesParams,
        }),
    ]);

    return marketKeys.map(marketKey => {
        const marketVotes = marketsVotes.data.results.find(
            vote => vote.market_key === marketKey.account_id,
        );

        const bribe = bribes.data.results.find(bribe => bribe.market_key === marketKey.account_id);

        if (marketVotes) {
            return { ...marketKey, ...marketVotes, ...bribe };
        } else {
            return { ...marketKey, ...{ market_key: marketKey.account_id }, ...bribe };
        }
    });
};

export const getPairsWithBribes = async (pageSize: number, page: number) => {
    const bribes = await axios.get<ListResponse<MarketBribes>>(
        `${BRIBES_API_URL}bribes/?limit=${pageSize}&page=${page}`,
    );

    if (!bribes.data.results.length) {
        return { pairs: [], count: 0 };
    }

    const votesParams = new URLSearchParams();
    const keysParams = new URLSearchParams();

    bribes.data.results.forEach(bribe => {
        votesParams.append('market_key', bribe.market_key);
        keysParams.append('account_id', bribe.market_key);
    });

    const [marketsVotes, marketsKeys] = await Promise.all([
        axios.get<ListResponse<MarketVotes>>(votingTrackerUrl, {
            params: votesParams,
        }),
        axios.get<ListResponse<MarketKey>>(marketKeysUrl, { params: keysParams }),
    ]);

    const pairs = bribes.data.results.map(bribe => {
        const marketKey = marketsKeys.data.results.find(key => key.account_id === bribe.market_key);

        const marketVote = marketsVotes.data.results.find(
            vote => vote.market_key === bribe.market_key,
        );

        return { ...bribe, ...marketKey, ...marketVote };
    });

    return { pairs, count: bribes.data.count };
};

const getAssetParam = (asset: AssetSimple) => getAssetString(createAsset(asset.code, asset.issuer));
export const getFilteredPairsList = async (
    baseAsset: AssetSimple,
    counterAsset: AssetSimple,
    pageSize: number,
    page: number,
): Promise<{ pairs: Partial<PairStats>[]; count: number }> => {
    let marketKeys;
    let count;
    if (!counterAsset) {
        const marketParams = new URLSearchParams();

        marketParams.append('asset', getAssetParam(baseAsset));
        marketParams.append('limit', pageSize.toString());
        marketParams.append('page', page.toString());

        const result = await axios
            .get<ListResponse<MarketKey>>(`${marketKeysUrl}search/`, {
                params: marketParams,
            })
            .then(({ data }) => data);

        marketKeys = result.results;
        count = result.count;
    } else {
        const marketKey = await axios
            .get<MarketKey>(
                `${marketKeysUrl}${getAssetParam(baseAsset)}-${getAssetParam(counterAsset)}`,
            )
            .then(({ data }) => data)
            .catch(() => null);

        if (!marketKey) {
            return { pairs: [], count: 0 };
        }

        marketKeys = [marketKey];
        count = 1;
    }
    const marketVotesParams = new URLSearchParams();
    const bribesParams = new URLSearchParams();

    marketKeys.forEach(marketKey => {
        marketVotesParams.append('market_key', marketKey.account_id);
        bribesParams.append('market_key', marketKey.account_id);
    });

    const [marketsVotes, bribes] = await Promise.all([
        axios.get<ListResponse<MarketVotes>>(votingTrackerUrl, {
            params: marketVotesParams,
        }),
        axios.get<ListResponse<MarketBribes>>(`${BRIBES_API_URL}bribes/?limit=200`, {
            params: bribesParams,
        }),
    ]);

    const pairs = marketKeys.map(marketKey => {
        const marketVotes = marketsVotes.data.results.find(
            vote => vote.market_key === marketKey.account_id,
        );

        const bribe = bribes.data.results.find(key => key.market_key === marketKey.account_id);

        if (marketVotes) {
            return { ...marketKey, ...marketVotes, ...bribe };
        } else {
            return { ...marketKey, ...{ market_key: marketKey.account_id }, ...bribe };
        }
    });

    return { count, pairs };
};

export const getTotalVotingStats = (): Promise<TotalStats> =>
    axios.get<TotalStats>(`${votingTrackerUrl}stats/`).then(({ data }) => data);

export const getUpcomingBribesForMarket = (marketKey: string): Promise<UpcomingBribe[]> =>
    axios
        .get<ListResponse<UpcomingBribe>>(
            `${BRIBES_API_URL}pending-bribes/?limit=200&ordering=start_at&market_key=${marketKey}`,
        )
        .then(({ data }) => data.results);

export const getRewards = (): Promise<Rewards[]> =>
    axios.get<ListResponse<Rewards>>(rewardsApi).then(res => res.data.results);
