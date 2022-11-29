import axios from 'axios';
import * as StellarSdk from 'stellar-sdk';
import {
    Asset,
    AssetSimple,
    ListResponse,
    MarketBribes,
    MarketKey,
    MarketVotes,
    PairStats,
    Rewards,
    TotalStats,
    UpcomingBribe,
} from './types';

const assetsListUrl = 'https://fed.stellarterm.com/issuer_orgs/';
const assetsInfoUrl = 'https://assets.aqua.network/api/v1/assets/';
const marketKeysUrl = 'https://marketkeys-tracker.aqua.network/api/market-keys/';
const votingTrackerUrl = 'https://voting-tracker.aqua.network/api/voting-snapshot/';
const bribesApiUrl = 'https://bribes-api.aqua.network/api/';
const rewardsApi =
    'https://reward-api.aqua.network/api/rewards/?ordering=-daily_total_reward&page=1&page_size=200';

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

export const getPairsList = async (
    sortType: SortTypes,
    pageSize: number,
    page: number,
): Promise<{ pairs: PairStats[]; count: number }> => {
    const url = getPairUrl(sortType, pageSize, page);

    const marketsVotes = await axios.get<ListResponse<MarketVotes>>(url);

    return addKeysToMarketVotes(marketsVotes.data.results, marketsVotes.data.count);
};

const addKeysToMarketVotes = async (votes: MarketVotes[], count) => {
    const params = new URLSearchParams();
    const bribesParams = new URLSearchParams();

    votes.forEach((marketVotes) => {
        params.append('account_id', marketVotes.market_key);
        bribesParams.append('market_key', marketVotes.market_key);
    });

    const [marketsKeys, bribes] = await Promise.all([
        axios.get<ListResponse<MarketKey>>(marketKeysUrl, { params }),
        axios.get<ListResponse<MarketBribes>>(`${bribesApiUrl}bribes/?limit=200`, {
            params: bribesParams,
        }),
    ]);

    const pairs = votes.map((marketVotes) => {
        const marketKey = marketsKeys.data.results.find(
            (key) => key.account_id === marketVotes.market_key,
        );

        const bribe = bribes.data.results.find((key) => key.market_key === marketVotes.market_key);

        return { ...marketVotes, ...marketKey, ...bribe };
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

    const paramsUp = new URLSearchParams();
    const paramsDown = new URLSearchParams();

    keys.forEach((key) => {
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

    const marketKeys = [...marketKeysUp.data.results, ...marketKeysDown.data.results].filter(
        (value, index, self) => index === self.findIndex((t) => t.account_id === value.account_id),
    );

    const marketVotesParams = new URLSearchParams();

    marketKeys.forEach((marketKey) => {
        marketVotesParams.append('market_key', marketKey.account_id);
    });

    const [marketsVotes, bribes] = await Promise.all([
        axios.get<ListResponse<MarketVotes>>(votingTrackerUrl, {
            params: marketVotesParams,
        }),
        axios.get<ListResponse<MarketBribes>>(`${bribesApiUrl}bribes/?limit=200`, {
            params: marketVotesParams,
        }),
    ]);

    return marketKeys.map((marketKey) => {
        const marketVotes = marketsVotes.data.results.find(
            (vote) => vote.market_key === marketKey.account_id,
        );

        const bribe = bribes.data.results.find(
            (bribe) => bribe.market_key === marketKey.account_id,
        );

        if (marketVotes) {
            return { ...marketKey, ...marketVotes, ...bribe };
        } else {
            return { ...marketKey, ...{ market_key: marketKey.account_id }, ...bribe };
        }
    });
};

export const getPairsWithBribes = async (pageSize: number, page: number) => {
    const bribes = await axios.get<ListResponse<MarketBribes>>(
        `${bribesApiUrl}bribes/?limit=${pageSize}&page=${page}`,
    );

    if (!bribes.data.results.length) {
        return { pairs: [], count: 0 };
    }

    const votesParams = new URLSearchParams();
    const keysParams = new URLSearchParams();

    bribes.data.results.forEach((bribe) => {
        votesParams.append('market_key', bribe.market_key);
        keysParams.append('account_id', bribe.market_key);
    });

    const [marketsVotes, marketsKeys] = await Promise.all([
        axios.get<ListResponse<MarketVotes>>(votingTrackerUrl, {
            params: votesParams,
        }),
        axios.get<ListResponse<MarketKey>>(marketKeysUrl, { params: keysParams }),
    ]);

    const pairs = bribes.data.results.map((bribe) => {
        const marketKey = marketsKeys.data.results.find(
            (key) => key.account_id === bribe.market_key,
        );

        const marketVote = marketsVotes.data.results.find(
            (vote) => vote.market_key === bribe.market_key,
        );

        return { ...bribe, ...marketKey, ...marketVote };
    });

    return { pairs, count: bribes.data.count };
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
    const bribesParams = new URLSearchParams();

    marketKeys.forEach((marketKey) => {
        marketVotesParams.append('market_key', marketKey.account_id);
        bribesParams.append('market_key', marketKey.account_id);
    });

    const [marketsVotes, bribes] = await Promise.all([
        axios.get<ListResponse<MarketVotes>>(votingTrackerUrl, {
            params: marketVotesParams,
        }),
        axios.get<ListResponse<MarketBribes>>(`${bribesApiUrl}bribes/?limit=200`, {
            params: bribesParams,
        }),
    ]);

    const pairs = marketKeys.map((marketKey) => {
        const marketVotes = marketsVotes.data.results.find(
            (vote) => vote.market_key === marketKey.account_id,
        );

        const bribe = bribes.data.results.find((key) => key.market_key === marketKey.account_id);

        if (marketVotes) {
            return { ...marketKey, ...marketVotes, ...bribe };
        } else {
            return { ...marketKey, ...{ market_key: marketKey.account_id }, ...bribe };
        }
    });

    return { count, pairs };
};

export const getTotalVotingStats = (): Promise<TotalStats> => {
    return axios.get<TotalStats>(`${votingTrackerUrl}stats/`).then(({ data }) => data);
};

export const getMarketPair = (base, counter) => {
    return axios
        .get<MarketKey>(`${marketKeysUrl}${getAssetParam(base)}-${getAssetParam(counter)}`)
        .then(({ data }) => data)
        .catch(() => null);
};

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
        .then((result) => {
            const { count, results } = result.data;
            return {
                count,
                results,
            };
        });

    const keysParams = new URLSearchParams();

    results.forEach((bribe) => {
        keysParams.append('account_id', bribe.market_key);
    });

    const marketKeys = await axios.get<ListResponse<MarketKey>>(marketKeysUrl, {
        params: keysParams,
    });

    const bribes = results.map((bribe) => {
        const marketKey = marketKeys.data.results.find(
            (marketKey) => marketKey.account_id === bribe.market_key,
        );

        return { ...bribe, ...marketKey };
    });

    return { count, bribes };
};

export const getUpcomingBribesForMarket = (marketKey) => {
    return axios
        .get<ListResponse<UpcomingBribe>>(
            `${bribesApiUrl}pending-bribes/?limit=200&ordering=start_at&market_key=${marketKey}`,
        )
        .then(({ data }) => {
            return data.results;
        });
};

export const getRewards = (): Promise<Rewards[]> => {
    return axios.get<ListResponse<Rewards>>(rewardsApi).then((res) => {
        return res.data.results;
    });
};
