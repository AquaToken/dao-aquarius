import axios from 'axios';
import { AssetsService } from '../../../common/services/globalServices';
import { Asset } from '@stellar/stellar-sdk';
import { getAssetFromString, getAssetString } from '../../../common/helpers/helpers';
import {
    FindSwapPath,
    ListResponse,
    NativePrice,
    Pool,
    PoolBalance,
    PoolEvent,
    PoolExtended,
    PoolProcessed,
    PoolStatistics,
    PoolUser,
    PoolUserProcessed,
} from './types';

const API_URL = 'https://amm-api-staging.aqua.network';

export enum FilterOptions {
    all = '',
    stable = 'stable',
    constant = 'constant_product',
}

export enum PoolsSortFields {
    liquidityUp = '-liquidity',
    liquidityDown = 'liquidity',
    volumeUp = '-volume',
    volumeDown = 'volume',
    rewardsUp = '-reward',
    rewardsDown = 'reward',
    apyUp = '-apy',
    apyDown = 'apy',
    rewardsApyUp = '-rewards_apy',
    rewardsApyDown = 'rewards_apy',
}

const processPools = (pools: Array<Pool | PoolUser>): Array<PoolProcessed> => {
    const assetsStr: Set<string> = pools.reduce((acc: Set<string>, item: Pool | PoolUser) => {
        item.tokens_str.forEach((str) => acc.add(str));
        return acc;
    }, new Set<string>());

    // @ts-ignore
    AssetsService.processAssets([...assetsStr].map((str) => getAssetFromString(str)));

    return pools.map((pool) => {
        return { ...pool, assets: pool.tokens_str.map((str) => getAssetFromString(str)) };
    });
};

export const getPools = async (
    filter: FilterOptions,
    page: number,
    size: number,
    sort: PoolsSortFields,
    search?: string,
): Promise<{ total: number; pools: PoolProcessed[] }> => {
    const capitalizedSearch = (search || '').toUpperCase();

    const { data } = await axios.get<ListResponse<Pool>>(
        `${API_URL}/pools/?pool_type=${filter}&sort=${sort}&page=${page}&size=${size}&search=${
            capitalizedSearch === 'XLM' ? 'native' : capitalizedSearch
        }`,
    );
    const processed = await processPools(data.items);
    return { pools: processed, total: data.total };
};

const getPoolInfo = async (id: string): Promise<PoolProcessed> => {
    const { data } = await axios.get<Pool>(`${API_URL}/pools/${id}/`);
    const [processed] = await processPools([data]);
    return processed;
};

const getPoolStats = async (id: string): Promise<{ stats: PoolStatistics[] }> => {
    try {
        const { data } = await axios.get<ListResponse<PoolStatistics>>(
            `${API_URL}/statistics/pool/${id}/?size=1000`,
        );
        return { stats: data.items.reverse() };
    } catch {
        return { stats: [] };
    }
};

export const getPoolMembers = async (
    id: string,
    page: number,
    size: number,
): Promise<{ members: PoolBalance[]; total: number; page: number }> => {
    try {
        const { data } = await axios.get<ListResponse<PoolBalance>>(
            `${API_URL}/pools/${id}/balances/?sort=-balance&size=${size}&page=${page} `,
        );
        return { members: data.items, total: data.total, page: data.page };
    } catch {
        return { members: [], total: 0, page: 1 };
    }
};

const getPoolMembersCount = async (id: string): Promise<{ membersCount: number }> => {
    try {
        const { data } = await axios.get<ListResponse<PoolBalance>>(
            `${API_URL}/pools/${id}/balances/?size=1 `,
        );
        return { membersCount: data.total };
    } catch {
        return { membersCount: 0 };
    }
};

export const getPoolEvents = async (
    id: string,
    page: number,
    size: number,
): Promise<{ events: PoolEvent[]; total: number; page: number }> => {
    try {
        const { data } = await axios.get<ListResponse<PoolEvent>>(
            `${API_URL}/events/pool/${id}/?size=${size}&page=${page}`,
        );
        return { events: data.items, total: data.total, page: data.page };
    } catch {
        return { events: [], total: 0, page: 1 };
    }
};

export const getPool = async (id: string): Promise<PoolExtended> => {
    const [info, stats, membersCount] = await Promise.all([
        getPoolInfo(id),
        getPoolStats(id),
        getPoolMembersCount(id),
    ]);
    return Object.assign({}, info, stats, membersCount);
};

export const getUserPools = (accountId: string): Promise<PoolUserProcessed[]> => {
    return axios
        .get<ListResponse<PoolUser>>(`${API_URL}/pools/user/${accountId}/?size=1000`)
        .then(({ data }) => processPools(data.items) as PoolUserProcessed[]);
};

export const findSwapPath = async (
    baseId: string,
    counterId: string,
    amount: string,
): Promise<FindSwapPath> => {
    const headers = { 'Content-Type': 'application/json' };

    const body = JSON.stringify({
        token_in_address: baseId,
        token_out_address: counterId,
        amount: (+amount * 1e7).toString(),
    });
    const { data } = await axios.post<FindSwapPath>(`${API_URL}/pools/find-path/`, body, {
        headers,
    });
    return data;
};

export const getTotalStats = async (): Promise<PoolStatistics[]> => {
    const { data } = await axios.get<ListResponse<PoolStatistics>>(`${API_URL}/statistics/totals/`);
    return data.items.reverse();
};
export const getNativePrices = async (
    assets: Array<Asset>,
    batchSize: number = 100,
): Promise<Map<string, string>> => {
    const batches = [];

    // Split assets into batches of 100
    for (let i = 0; i < assets.length; i += batchSize) {
        const batch = assets.slice(i, i + batchSize);
        batches.push(batch);
    }

    const allPrices = new Map<string, string>();

    // Process each batch
    for (const batch of batches) {
        const { data } = await axios.get<ListResponse<NativePrice>>(
            `${API_URL}/tokens/?name__in=${batch.map((asset) => getAssetString(asset)).join(',')}`,
        );
        const prices = data.items;

        prices.forEach((price) => {
            allPrices.set(price.name, price.price_xlm);
        });
    }

    return allPrices;
};

export const getPathPoolsFee = async (addresses: Array<string>): Promise<Map<string, Pool>> => {
    const { data } = await axios.get<ListResponse<Pool>>(
        `${API_URL}/pools/?address__in=${addresses.join(',')}`,
    );

    return processPools(data.items).reduce((acc, pool) => {
        acc.set(pool.address, pool.fee);
        return acc;
    }, new Map());
};
