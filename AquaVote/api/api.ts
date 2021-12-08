import axios from 'axios';
import * as StellarSdk from 'stellar-sdk';
import {
    Asset,
    AssetSimple,
    ListResponse,
    MarketKey,
    MarketVotes,
    PairStats,
    TotalStats,
} from './types';

const assetsListUrl = 'https://fed.stellarterm.com/issuer_orgs/';
const assetsInfoUrl = 'https://assets.ultrastellar.com/api/v1/assets/';
const marketKeysUrl = 'https://marketkeys-tracker.aqua.network/api/market-keys/';
const votingTrackerUrl = 'https://voting-tracker.aqua.network/api/voting-snapshot/';

export const getAssetsRequest = () => {
    return axios.get<{ issuer_orgs: any[] }>(assetsListUrl).then(({ data }) => {
        const issuerOrgs = data.issuer_orgs;

        return issuerOrgs.reduce((acc, anchor) => {
            anchor.assets.forEach((asset) => {
                if (!asset.disabled && !anchor.disabled && !asset.unlisted) {
                    acc.push(asset);
                }
            });

            return acc;
        }, []);
    });
};

export const getAssetsInfo = (assets) => {
    const params = new URLSearchParams();

    assets.forEach((asset) => {
        params.append('asset', `${asset.code}:${asset.issuer}`);
    });

    return axios
        .get<ListResponse<Asset[]>>(assetsInfoUrl, { params })
        .then(({ data }) => data.results);
};

export enum SortTypes {
    popular = 'popular',
    topVoted = 'top',
    yourVotes = 'your_votes',
}

const getPairUrl = (sortType: SortTypes, pageSize: number, page: number): string => {
    switch (sortType) {
        case SortTypes.popular:
            return `${votingTrackerUrl}top-volume/?limit=100&page=1`;
        case SortTypes.topVoted:
            return `${votingTrackerUrl}top-volume/?limit=${pageSize}&page=${page}`;
    }
};

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
};

let randomPairs = [];

export const getPairsList = async (
    sortType: SortTypes,
    pageSize: number,
    page: number,
): Promise<{ pairs: PairStats[]; count: number }> => {
    if (sortType !== SortTypes.popular) {
        randomPairs = [];
    }

    if (sortType === SortTypes.popular && randomPairs.length) {
        const votes = randomPairs.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

        return addKeysToMarketVotes(votes, randomPairs.length);
    }

    const url = getPairUrl(sortType, pageSize, page);

    const marketsVotes = await axios.get<ListResponse<MarketVotes>>(url);

    if (sortType === SortTypes.popular && !randomPairs.length) {
        shuffleArray(marketsVotes.data.results);
        randomPairs = marketsVotes.data.results;
        const votes = randomPairs.slice((page - 1) * pageSize, pageSize);

        return addKeysToMarketVotes(votes, randomPairs.length);
    }

    return addKeysToMarketVotes(marketsVotes.data.results, marketsVotes.data.count);
};

const addKeysToMarketVotes = async (votes: MarketVotes[], count) => {
    const params = new URLSearchParams();

    votes.forEach((marketVotes) => {
        params.append('account_id', marketVotes.market_key);
    });

    const marketsKeys = await axios.get<ListResponse<MarketKey>>(marketKeysUrl, { params });

    const pairs = votes.map((marketVotes) => {
        const marketKey = marketsKeys.data.results.find(
            (key) => key.account_id === marketVotes.market_key,
        );

        return { ...marketVotes, ...marketKey };
    });

    return { count, pairs };
};

export const updateVotesForMarketKeys = async (pairs: PairStats[]): Promise<PairStats[]> => {
    if (!pairs?.length) {
        return pairs;
    }
    const params = new URLSearchParams();

    pairs.forEach((pair) => {
        params.append('market_key', pair.market_key);
    });

    const marketsVotes = await axios.get<ListResponse<MarketVotes>>(votingTrackerUrl, {
        params,
    });

    return pairs.map((pair) => {
        const marketVotes = marketsVotes.data.results.find(
            (vote) => vote.market_key === pair.account_id,
        );

        if (marketVotes) {
            return { ...pair, ...marketVotes };
        } else {
            return { ...pair, ...{ market_key: pair.account_id } };
        }
    });
};

export const getUserPairsList = async (keys: string[]) => {
    if (!keys.length) {
        return [];
    }

    const params = new URLSearchParams();

    keys.forEach((key) => {
        params.append('account_id', key);
    });

    const marketKeys = await axios.get<ListResponse<MarketKey>>(`${marketKeysUrl}?limit=200`, {
        params,
    });

    const marketVotesParams = new URLSearchParams();

    marketKeys.data.results.forEach((marketKey) => {
        marketVotesParams.append('market_key', marketKey.account_id);
    });

    const marketsVotes = await axios.get<ListResponse<MarketVotes>>(votingTrackerUrl, {
        params: marketVotesParams,
    });

    return marketKeys.data.results.map((marketKey) => {
        const marketVotes = marketsVotes.data.results.find(
            (vote) => vote.market_key === marketKey.account_id,
        );

        if (marketVotes) {
            return { ...marketKey, ...marketVotes };
        } else {
            return { ...marketKey, ...{ market_key: marketKey.account_id } };
        }
    });
};

const getAssetParam = (asset: AssetSimple) =>
    new StellarSdk.Asset(asset.code, asset.issuer).isNative()
        ? 'native'
        : `${asset.code}:${asset.issuer}`;

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

    marketKeys.forEach((marketKey) => {
        marketVotesParams.append('market_key', marketKey.account_id);
    });

    const marketsVotes = await axios.get<ListResponse<MarketVotes>>(votingTrackerUrl, {
        params: marketVotesParams,
    });

    const pairs = marketKeys.map((marketKey) => {
        const marketVotes = marketsVotes.data.results.find(
            (vote) => vote.market_key === marketKey.account_id,
        );

        if (marketVotes) {
            return { ...marketKey, ...marketVotes };
        } else {
            return { ...marketKey, ...{ market_key: marketKey.account_id } };
        }
    });

    return { count, pairs };
};

export const getTotalVotingStats = (): Promise<TotalStats> => {
    return axios.get<TotalStats>(`${votingTrackerUrl}stats/`).then(({ data }) => data);
};
