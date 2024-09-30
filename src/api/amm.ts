import { Asset } from '@stellar/stellar-sdk';
import axios from 'axios';

import { API_AMM_BACKEND } from 'constants/api';

import { getAssetFromString, getAssetString } from 'helpers/assets';

import {
    FindSwapPath,
    ListResponse,
    NativePrice,
    Pool,
    PoolBalance,
    PoolEvent,
    PoolExtended,
    PoolProcessed,
    PoolRewards,
    PoolStatistics,
    PoolUser,
    PoolUserProcessed,
    PoolVolume24h,
} from 'types/amm';

const API_URL = 'https://amm-api-staging.aqua.network';
import { AssetsService, SorobanService, StellarService } from 'services/globalServices';
import { AQUA_CODE, AQUA_ISSUER } from 'services/stellar.service';

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
        item.tokens_str.forEach(str => acc.add(str));
        return acc;
    }, new Set<string>());

    AssetsService.processAssets([...assetsStr].map(str => getAssetFromString(str)));

    return pools.map(pool => ({
        ...pool,
        assets: pool.tokens_str.map(str => getAssetFromString(str)),
    }));
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
        `${API_AMM_BACKEND}/pools/?pool_type=${filter}&sort=${sort}&page=${page}&size=${size}&search=${
            capitalizedSearch === 'XLM' ? 'native' : capitalizedSearch
        }`,
    );
    const processed = processPools(data.items);
    return { pools: processed, total: data.total };
};

export const getPoolInfo = async (id: string): Promise<PoolProcessed> => {
    const { data } = await axios.get<Pool>(`${API_AMM_BACKEND}/pools/${id}/`);
    const [processed] = processPools([data]);
    return processed;
};

const getPoolStats = async (id: string): Promise<{ stats: PoolStatistics[] }> => {
    try {
        const { data } = await axios.get<ListResponse<PoolStatistics>>(
            `${API_AMM_BACKEND}/statistics/pool/${id}/?size=1000`,
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
            `${API_AMM_BACKEND}/pools/${id}/balances/?sort=-balance&size=${size}&page=${page} `,
        );
        return { members: data.items, total: data.total, page: data.page };
    } catch {
        return { members: [], total: 0, page: 1 };
    }
};

const getPoolMembersCount = async (id: string): Promise<{ membersCount: number }> => {
    try {
        const { data } = await axios.get<ListResponse<PoolBalance>>(
            `${API_AMM_BACKEND}/pools/${id}/balances/?size=1 `,
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
            `${API_AMM_BACKEND}/events/pool/${id}/?size=${size}&page=${page}`,
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

export const getUserPools = (accountId: string): Promise<PoolUserProcessed[]> =>
    axios
        .get<ListResponse<PoolUser>>(`${API_AMM_BACKEND}/pools/user/${accountId}/?size=1000`)
        .then(({ data }) => processPools(data.items) as PoolUserProcessed[]);

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
    const { data } = await axios.post<FindSwapPath>(`${API_AMM_BACKEND}/pools/find-path/`, body, {
        headers,
    });
    return data;
};

export const getTotalStats = async (): Promise<PoolStatistics[]> => {
    const { data } = await axios.get<ListResponse<PoolStatistics>>(
        `${API_AMM_BACKEND}/statistics/totals/`,
    );
    return data.items.reverse();
};

export const getVolume24h = async (): Promise<PoolVolume24h> => {
    const { data } = await axios.get<PoolVolume24h>(`${API_AMM_BACKEND}/statistics/24h/`);
    return data;
};
export const getNativePrices = async (
    assets: Array<Asset>,
    batchSize: number = 50,
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
            `${API_AMM_BACKEND}/tokens/?name__in=${batch
                .map((asset: Asset) => getAssetString(asset))
                .join(',')}`,
        );
        const prices = data.items;

        prices.forEach(price => {
            allPrices.set(price.name, price.price_xlm);
        });
    }

    return allPrices;
};

export const getPathPoolsFee = async (addresses: Array<string>): Promise<Map<string, Pool>> => {
    const { data } = await axios.get<ListResponse<Pool>>(
        `${API_AMM_BACKEND}/pools/?address__in=${addresses.join(',')}`,
    );

    return processPools(data.items).reduce((acc, pool) => {
        acc.set(pool.address, pool.fee);
        return acc;
    }, new Map());
};

export const getPoolsToMigrate = async (base: Asset, counter: Asset): Promise<Pool[] | null> => {
    const { data } = await axios.get<ListResponse<Pool>>(
        `${API_AMM_BACKEND}/pools?tokens__in=${SorobanService.getAssetContractId(
            base,
        )},${SorobanService.getAssetContractId(counter)}`,
    );

    const pools = data.items.filter(item => item.tokens_str.length === 2);

    if (!pools.length) {
        return null;
    }
    return processPools(pools);
};

export const getAmmRewards = async (): Promise<number> => {
    const { data } = await axios.get<ListResponse<PoolRewards>>(`${API_AMM_BACKEND}/pool-rewards/`);

    const sumTps = data.items.reduce((acc, item) => acc + Number(item.tps) / 1e7, 0);

    return sumTps * 60 * 60 * 24;
};

export const getAquaInPoolsSum = async (): Promise<number> => {
    const AQUA = StellarService.createAsset(AQUA_CODE, AQUA_ISSUER);
    const { data } = await axios.get<ListResponse<Pool>>(
        `${API_AMM_BACKEND}/pools/?&search=${SorobanService.getAssetContractId(AQUA)}&size=500`,
    );

    return data.items.reduce((acc, item) => {
        const aquaIndex = item.tokens_str.findIndex(str => str === getAssetString(AQUA));

        return acc + Number(item.reserves[aquaIndex]) / 1e7;
    }, 0);
};
