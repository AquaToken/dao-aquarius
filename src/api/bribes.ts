import axios from 'axios';

import { BRIBES_API_URL, MARKET_KEY_API_URL, VOTING_TRACKER_API_URL } from 'constants/api';
import { BribeSortFields, BribesTypes, BribesWeeksFilters } from 'constants/bribes';

import { getAssetString } from 'helpers/assets';
import { getNextWeekStartFromString } from 'helpers/date';

import type { UpcomingBribe } from 'types/bribes';
import type { ClassicToken } from 'types/token';

import type { ListResponse, MarketBribes, MarketKey, MarketVotes } from 'pages/vote/api/types';

/**
 * Fetches the market key data for a specific pair of tokens.
 * Returns `null` if the request fails.
 */
export const getMarketPair = async (
    base: ClassicToken,
    counter: ClassicToken,
): Promise<MarketKey | null> => {
    try {
        const { data } = await axios.get<MarketKey>(
            `${MARKET_KEY_API_URL}${getAssetString(base)}-${getAssetString(counter)}`,
        );
        return data;
    } catch {
        return null;
    }
};

const processBribes = async (
    results: UpcomingBribe[] | MarketBribes[],
    count: number,
): Promise<{
    count: number;
    bribes: (UpcomingBribe & Partial<MarketKey> & Partial<MarketVotes>)[];
}> => {
    if (!results.length) return { count, bribes: [] };

    // Prepare URL query parameters for bulk requests
    const keysParams = new URLSearchParams();
    const votesParams = new URLSearchParams();

    results.forEach(bribe => {
        keysParams.append('account_id', bribe.market_key);
        votesParams.append('market_key', bribe.market_key);
    });

    // Fetch market key and voting data in parallel
    const [marketsVotesRes, marketsKeysRes] = await Promise.all([
        axios.get<ListResponse<MarketVotes>>(VOTING_TRACKER_API_URL, { params: votesParams }),
        axios.get<ListResponse<MarketKey>>(MARKET_KEY_API_URL, { params: keysParams }),
    ]);

    const marketsVotes = marketsVotesRes.data.results;
    const marketsKeys = marketsKeysRes.data.results;

    // Combine bribe data with its associated market key and votes
    const bribes = results.map(bribe => {
        const marketKey = marketsKeys.find(k => k.account_id === bribe.market_key);
        const marketVote = marketsVotes.find(v => v.market_key === bribe.market_key);
        return { ...bribe, ...marketKey, ...marketVote };
    });

    return { count, bribes };
};

type UpcomingRequestParams = {
    limit: number;
    page: number;
    ordering: BribeSortFields;
    start_at__gte?: string;
    start_at__lt?: string;
    aqua_total_reward_amount_equivalent__gte: string;
    is_amm_protocol?: boolean;
};

export const getUpcomingBribes = async (
    pageSize: number,
    page: number,
    sort: BribeSortFields,
    minBribeAmount: string,
    weekFilter: BribesWeeksFilters | string,
    type: BribesTypes,
): Promise<{
    count: number;
    bribes: (UpcomingBribe & Partial<MarketKey> & Partial<MarketVotes>)[];
}> => {
    try {
        // Build query parameters
        const params: UpcomingRequestParams = {
            limit: pageSize,
            page,
            ordering: sort,
            aqua_total_reward_amount_equivalent__gte: minBribeAmount,
        };

        if (weekFilter !== BribesWeeksFilters.all) {
            params.start_at__gte = weekFilter;
            params.start_at__lt = getNextWeekStartFromString(weekFilter);
        }

        if (type !== BribesTypes.all) {
            params.is_amm_protocol = type === BribesTypes.protocol;
        }

        // Fetch pending bribes
        const { data } = await axios.get<ListResponse<UpcomingBribe>>(
            `${BRIBES_API_URL}pending-bribes/`,
            { params },
        );

        // Merge bribe data with market information
        return await processBribes(data.results, data.count);
    } catch (error) {
        console.error('Failed to fetch upcoming bribes:', error);
        return { count: 0, bribes: [] };
    }
};
