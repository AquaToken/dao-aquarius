import { Asset } from '@stellar/stellar-sdk';
import axios from 'axios';
import BigNumber from 'bignumber.js';

import {
    getAquaAssetData,
    getAssetFromString,
    getAssetString,
    getUsdcAssetData,
} from 'helpers/assets';
import { getAmmAquaUrl } from 'helpers/url';

import { AssetSimple } from 'store/assetsStore/types';

import { AssetsService, SorobanService } from 'services/globalServices';

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

export enum FilterOptions {
    all = 'all',
    stable = 'stable',
    constant = 'volatile',
}

const FilterOptionsMap = {
    [FilterOptions.all]: '',
    [FilterOptions.stable]: 'stable',
    [FilterOptions.constant]: 'constant_product',
};

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
    const baseUrl = getAmmAquaUrl();

    const { data } = await axios.get<ListResponse<Pool>>(
        `${baseUrl}/pools/?pool_type=${
            FilterOptionsMap[filter]
        }&sort=${sort}&page=${page}&size=${size}&search=${
            capitalizedSearch === 'XLM' ? 'native' : capitalizedSearch
        }`,
    );
    const processed = processPools(data.items);
    return { pools: processed, total: data.total };
};

export const getPoolsWithAssets = (assets: Asset[]): Promise<PoolProcessed[]> => {
    const baseUrl = getAmmAquaUrl();
    const params = assets.map(asset => SorobanService.getAssetContractId(asset)).join(',');

    return axios
        .get<ListResponse<Pool>>(`${baseUrl}/pools/?tokens__in=${params}`)
        .then(res => processPools(res.data.items));
};
export const getPoolInfo = async (id: string): Promise<PoolProcessed> => {
    const baseUrl = getAmmAquaUrl();

    const { data } = await axios.get<Pool>(`${baseUrl}/pools/${id}/`);
    const [processed] = processPools([data]);
    return processed;
};

export const getPoolStats = async (id: string): Promise<{ stats: PoolStatistics[] }> => {
    const baseUrl = getAmmAquaUrl();

    try {
        const { data } = await axios.get<ListResponse<PoolStatistics>>(
            `${baseUrl}/statistics/pool/${id}/?size=1000`,
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
    const baseUrl = getAmmAquaUrl();

    try {
        const { data } = await axios.get<ListResponse<PoolBalance>>(
            `${baseUrl}/pools/${id}/balances/?sort=-balance&size=${size}&page=${page} `,
        );
        return { members: data.items, total: data.total, page: data.page };
    } catch {
        return { members: [], total: 0, page: 1 };
    }
};

export const getPoolMembersCount = async (id: string): Promise<{ membersCount: number }> => {
    const baseUrl = getAmmAquaUrl();

    try {
        const { data } = await axios.get<ListResponse<PoolBalance>>(
            `${baseUrl}/pools/${id}/balances/?size=1 `,
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
    const baseUrl = getAmmAquaUrl();

    try {
        const { data } = await axios.get<ListResponse<PoolEvent>>(
            `${baseUrl}/events/pool/${id}/?size=${size}&page=${page}`,
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
    const baseUrl = getAmmAquaUrl();

    return axios
        .get<ListResponse<PoolUser>>(`${baseUrl}/pools/user/${accountId}/?size=1000`)
        .then(({ data }) => processPools(data.items) as PoolUserProcessed[]);
};

export const getAmmAquaBalance = async (accountId: string): Promise<number> => {
    const baseUrl = getAmmAquaUrl();
    const { aquaContract, aquaAssetString } = getAquaAssetData();

    const { data } = await axios.get<ListResponse<PoolUser>>(
        `${baseUrl}/pools/user/${accountId}/?size=1000&tokens__in=${aquaContract}`,
    );

    const aquaSum: BigNumber = data.items.reduce((acc, item) => {
        const aquaIndex = item.tokens_str.findIndex(str => str === aquaAssetString);
        const aquaAmount = new BigNumber(item.reserves[aquaIndex])
            .div(1e7)
            .times(new BigNumber(item.balance))
            .div(new BigNumber(item.total_share));
        acc = acc.plus(aquaAmount);
        return acc;
    }, new BigNumber(0));

    return aquaSum.toNumber();
};

export const findSwapPath = async (
    baseId: string,
    counterId: string,
    amount: string | number,
): Promise<FindSwapPath> => {
    const headers = { 'Content-Type': 'application/json' };
    const baseUrl = getAmmAquaUrl();

    const body = JSON.stringify({
        token_in_address: baseId,
        token_out_address: counterId,
        amount: (+amount * 1e7).toString(),
    });
    const { data } = await axios.post<FindSwapPath>(`${baseUrl}/pools/find-path/`, body, {
        headers,
    });
    return data;
};

export const getTotalStats = async (): Promise<PoolStatistics[]> => {
    const baseUrl = getAmmAquaUrl();

    const { data } = await axios.get<ListResponse<PoolStatistics>>(
        `${baseUrl}/statistics/totals/?size=365`,
    );
    return data.items.reverse();
};

export const getVolume24h = async (): Promise<PoolVolume24h> => {
    const baseUrl = getAmmAquaUrl();

    const { data } = await axios.get<PoolVolume24h>(`${baseUrl}/statistics/24h/`);
    return data;
};
export const getNativePrices = async (
    assets: Array<Asset>,
    batchSize: number = 50,
): Promise<Map<string, string>> => {
    const baseUrl = getAmmAquaUrl();

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
            `${baseUrl}/tokens/?name__in=${batch
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
    const baseUrl = getAmmAquaUrl();

    const { data } = await axios.get<ListResponse<Pool>>(
        `${baseUrl}/pools/?address__in=${addresses.join(',')}`,
    );

    return processPools(data.items).reduce((acc, pool) => {
        acc.set(pool.address, pool.fee);
        return acc;
    }, new Map());
};

export const getPoolsToMigrate = async (base: Asset, counter: Asset): Promise<Pool[] | null> => {
    const baseUrl = getAmmAquaUrl();

    const { data } = await axios.get<ListResponse<Pool>>(
        `${baseUrl}/pools?tokens__in=${SorobanService.getAssetContractId(
            base,
        )},${SorobanService.getAssetContractId(counter)}`,
    );

    const pools = data.items
        .filter(item => item.tokens_str.length === 2)
        .sort((a, b) => +b.liquidity_usd - +a.liquidity_usd);

    if (!pools.length) {
        return null;
    }
    return processPools(pools);
};

// TODO: remove this method when this data is placed on the backend
export const getAmmRewards = async (): Promise<number> => {
    const baseUrl = getAmmAquaUrl();

    const { data } = await axios.get<ListResponse<PoolRewards>>(`${baseUrl}/pool-rewards/`);

    const sumTps = data.items.reduce((acc, item) => acc + Number(item.tps) / 1e7, 0);

    return sumTps * 60 * 60 * 24;
};

// TODO: remove this method when this data is placed on the backend
export const getAquaInPoolsSum = async (): Promise<number> => {
    const baseUrl = getAmmAquaUrl();

    const { aquaContract, aquaAssetString } = getAquaAssetData();

    const { data } = await axios.get<ListResponse<Pool>>(
        `${baseUrl}/pools/?&search=${aquaContract}&size=500`,
    );

    return data.items.reduce((acc, item) => {
        const aquaIndex = item.tokens_str.findIndex(str => str === aquaAssetString);

        return acc + Number(item.reserves[aquaIndex]) / 1e7;
    }, 0);
};

export const getAssetsList = async (): Promise<AssetSimple[]> => {
    const baseUrl = getAmmAquaUrl();

    const { data } = await axios.get<ListResponse<NativePrice>>(
        `${baseUrl}/tokens/?pooled=true&size=200`,
    );

    const { aquaAssetString } = getAquaAssetData();
    const { usdcAssetString } = getUsdcAssetData();

    const assetsSet = new Set();

    data.items.forEach(({ name }) => {
        if (name === aquaAssetString || name === usdcAssetString || name === 'native') {
            return;
        }
        assetsSet.add(name);
    });

    return [
        aquaAssetString,
        'native',
        usdcAssetString,
        ...[...assetsSet].sort((a: string, b: string) => a.localeCompare(b)),
    ].map((str: string) => getAssetFromString(str));
};
