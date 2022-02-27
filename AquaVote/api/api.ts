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
    TotalStats,
} from './types';
import { COLLECTOR_KEY } from '../../common/services/stellar.service';

const assetsListUrl = 'https://fed.stellarterm.com/issuer_orgs/';
const assetsInfoUrl = 'https://assets.ultrastellar.com/api/v1/assets/';
const marketKeysUrl = 'https://marketkeys-tracker.aqua.network/api/market-keys/';
const votingTrackerUrl = 'https://voting-tracker.aqua.network/api/voting-snapshot/';
const bribesApiUrl = 'https://bribes-api.aqua.network/api/bribes/?limit=200';

const MOCK_DATA = {
    count: 2,
    next: null,
    previous: null,
    results: [
        {
            market_key: 'GDLJR23GLUMUTYOH2M6CMLBCLM4F7COSRCM6ZR2C43FMSC5MYW2WH44J',
            aggregated_bribes: [
                {
                    market_key: 'GDLJR23GLUMUTYOH2M6CMLBCLM4F7COSRCM6ZR2C43FMSC5MYW2WH44J',
                    total_reward_amount: '2962.5107379',
                    start_at: '2022-02-28T00:00:00Z',
                    stop_at: '2022-03-07T00:00:00Z',
                    asset_code: 'XLM',
                    asset_issuer: '',
                    daily_amount: '423.2158197',
                    aqua_total_reward_amount_equivalent: '144753.8876505',
                    daily_aqua_equivalent: '20679.1268072',
                },
                {
                    market_key: 'GDLJR23GLUMUTYOH2M6CMLBCLM4F7COSRCM6ZR2C43FMSC5MYW2WH44J',
                    total_reward_amount: '665017.0000000',
                    start_at: '2022-02-28T00:00:00Z',
                    stop_at: '2022-03-07T00:00:00Z',
                    asset_code: 'AQUA',
                    asset_issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA',
                    daily_amount: '95002.4285714',
                    aqua_total_reward_amount_equivalent: '665017.0000000',
                    daily_aqua_equivalent: '95002.4285714',
                },
            ],
        },
        {
            market_key: 'GBPF7NLFCYGZNHU6HS64ZGTE4YCRLAWTLFGOMFTHQ3WSUUFIGOSQFPJT',
            aggregated_bribes: [
                {
                    market_key: 'GBPF7NLFCYGZNHU6HS64ZGTE4YCRLAWTLFGOMFTHQ3WSUUFIGOSQFPJT',
                    total_reward_amount: '100000.0000000',
                    start_at: '2022-02-28T00:00:00Z',
                    stop_at: '2022-03-07T00:00:00Z',
                    asset_code: 'AQUA',
                    asset_issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA',
                    daily_amount: '14285.7142857',
                    aqua_total_reward_amount_equivalent: '100000.0000000',
                    daily_aqua_equivalent: '14285.7142857',
                },
                {
                    market_key: 'GBPF7NLFCYGZNHU6HS64ZGTE4YCRLAWTLFGOMFTHQ3WSUUFIGOSQFPJT',
                    total_reward_amount: '65319.2338981',
                    start_at: '2022-02-28T00:00:00Z',
                    stop_at: '2022-03-07T00:00:00Z',
                    asset_code: 'DUST',
                    asset_issuer: 'GDO6LNF7EEJS642LKPEXG5K2GQZTGADOFPJ5A34ZYHUYIRVGZMC7DUST',
                    daily_amount: '9331.3191283',
                    aqua_total_reward_amount_equivalent: '5879.4646133',
                    daily_aqua_equivalent: '839.9235161',
                },
            ],
        },
    ],
};

const MOCK_AXIOS_REQUEST = (): Promise<{ data: ListResponse<MarketBribes> }> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve({ data: MOCK_DATA }), 1000);
    });
};

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

    const [marketsKeys, bribes] = await Promise.all([
        axios.get<ListResponse<MarketKey>>(marketKeysUrl, { params }),
        MOCK_AXIOS_REQUEST(),
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
        MOCK_AXIOS_REQUEST(),
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
    const bribes = await MOCK_AXIOS_REQUEST();

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

export const getMarketPair = (base, counter) => {
    return axios
        .get<MarketKey>(`${marketKeysUrl}${getAssetParam(base)}-${getAssetParam(counter)}`)
        .then(({ data }) => data)
        .catch(() => null);
};

export const processBribes = async (claims) => {
    if (!claims.length) {
        return [];
    }
    const uniqMarkerKeys = [];

    const filtered = claims.filter((claim) => {
        if (claim.claimants.length !== 2) {
            return false;
        }

        const collectorClaimant = claim.claimants.find(
            (claimant) => claimant.destination === COLLECTOR_KEY,
        );

        if (
            !collectorClaimant ||
            !Boolean(collectorClaimant.predicate?.not?.abs_before) ||
            new Date(collectorClaimant.predicate?.not?.abs_before).getTime() <= Date.now()
        ) {
            return false;
        }

        const markerClaimant = claim.claimants.find(
            (claimant) => claimant.destination !== COLLECTOR_KEY,
        );

        if (!markerClaimant || !Boolean(markerClaimant.predicate?.not?.unconditional)) {
            return false;
        }

        if (!uniqMarkerKeys.includes(markerClaimant.destination)) {
            uniqMarkerKeys.push(markerClaimant.destination);
        }

        return true;
    });

    if (!filtered.length) {
        return [];
    }

    const params = new URLSearchParams();

    uniqMarkerKeys.forEach((key) => {
        params.append('account_id', key);
    });

    const marketKeys = await axios.get<ListResponse<MarketKey>>(`${marketKeysUrl}?limit=200`, {
        params,
    });

    return filtered
        .map((claim) => {
            const markerClaimant = claim.claimants.find(
                (claimant) => claimant.destination !== COLLECTOR_KEY,
            );

            const marker = marketKeys.data.results.find(
                (marketKey) => marketKey.account_id === markerClaimant.destination,
            );

            if (!marker) {
                return null;
            }

            const collectorClaimant = claim.claimants.find(
                (claimant) => claimant.destination === COLLECTOR_KEY,
            );

            const claimDate = collectorClaimant.predicate?.not?.abs_before;

            return { ...claim, ...marker, claimDate };
        })
        .filter((item) => item !== null);
};
