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

const API_URL = 'https://amm-api.aqua.network';

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
            `${API_URL}/statistics/pool/${id}/`,
        );
        return { stats: data.items.reverse() };
    } catch {
        return { stats: [] };
    }
};

const getPoolMembers = async (
    id: string,
): Promise<{ members: PoolBalance[]; membersCount: number }> => {
    try {
        const { data } = await axios.get<ListResponse<PoolBalance>>(
            `${API_URL}/pools/${id}/balances/?sort=-balance&size=20 `,
        );
        return { members: data.items, membersCount: data.total };
    } catch {
        return { members: [], membersCount: 0 };
    }
};

const getPoolEvents = async (id: string): Promise<{ events: PoolEvent[] }> => {
    try {
        const { data } = await axios.get<ListResponse<PoolEvent>>(
            `${API_URL}/events/pool/${id}/?size=20`,
        );
        return { events: data.items };
    } catch {
        return { events: [] };
    }
};

export const getPool = async (id: string): Promise<PoolExtended> => {
    const [info, stats, members, events] = await Promise.all([
        getPoolInfo(id),
        getPoolStats(id),
        getPoolMembers(id),
        getPoolEvents(id),
    ]);
    return Object.assign({}, info, stats, members, events);
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
export const getNativePrices = async (assets: Array<Asset>): Promise<Map<string, string>> => {
    const { data } = await axios.get<ListResponse<NativePrice>>(
        `${API_URL}/tokens/?name__in=${assets.map((asset) => getAssetString(asset)).join(',')}`,
    );
    const prices = data.items;
    return prices.reduce((acc, price) => {
        acc.set(price.name, price.price_xlm);
        return acc;
    }, new Map());
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
