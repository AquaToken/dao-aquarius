import { Asset } from '@stellar/stellar-sdk';
import axios from 'axios';
import BigNumber from 'bignumber.js';

import { getAquaAssetData, getUsdcAssetData } from 'helpers/assets';
import chunkFunction from 'helpers/chunk-function';
import { getNetworkPassphrase } from 'helpers/env';
import { createAsset, createLumen } from 'helpers/token';
import { getAmmAquaUrl } from 'helpers/url';

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
    RewardType,
    UserReward,
} from 'types/amm';
import { ClassicToken, Token, TokenType } from 'types/token';

import { AllTimeStats } from './amm.types';

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
    totalApyUp = '-total_apy',
    totalApyDown = 'total_apy',
}

export const processPools = async <T extends { tokens_addresses: string[] }>(
    pools: T[],
): Promise<(T & { tokens: Token[] })[]> => {
    const contracts: Set<string> = pools.reduce((acc: Set<string>, item: T) => {
        item.tokens_addresses.forEach(id => acc.add(id));
        return acc;
    }, new Set<string>());

    const tokens = await Promise.all(
        [...contracts].map(id => SorobanService.token.parseTokenContractId(id)),
    );

    AssetsService.processAssets(
        tokens.filter(({ type }) => type === TokenType.classic) as ClassicToken[],
    );

    return pools.map(pool => ({
        ...pool,
        tokens: pool.tokens_addresses.map(str => tokens.find(token => token.contract === str)),
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
    const processed = await processPools(data.items);
    return { pools: processed, total: data.total };
};

export const getPoolsWithAssets = (assets: Asset[]): Promise<PoolProcessed[]> => {
    const baseUrl = getAmmAquaUrl();
    const params = assets.map(asset => SorobanService.token.getAssetContractId(asset)).join(',');

    return axios
        .get<ListResponse<Pool>>(`${baseUrl}/pools/?tokens__in=${params}`)
        .then(res => processPools(res.data.items));
};
export const getPoolInfo = async (id: string): Promise<PoolProcessed> => {
    const baseUrl = getAmmAquaUrl();

    const { data } = await axios.get<Pool>(`${baseUrl}/pools/${id}/`);
    const [processed] = await processPools([data]);
    return processed;
};

export const getPoolStats = async (id: string): Promise<{ stats: PoolStatistics[] }> => {
    const baseUrl = getAmmAquaUrl();

    try {
        const { data } = await axios.get<ListResponse<PoolStatistics>>(
            `${baseUrl}/statistics/pool/${id}/?size=1000`,
        );
        return {
            stats: data.items
                .filter(({ liquidity, volume }) => Number(liquidity) !== 0 && Number(volume) !== 0)
                .reverse(),
        };
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

export const getUserPools = async (accountId: string): Promise<PoolUserProcessed[]> => {
    const baseUrl = getAmmAquaUrl();

    const { data } = await axios.get<ListResponse<PoolUser>>(
        `${baseUrl}/pools/user/${accountId}/?size=1000`,
    );
    const res = (await processPools(data.items)) as PoolUserProcessed[];
    return res;
};

export const getUserHistory = async (
    accountId: string,
    filter?: string,
): Promise<ListResponse<PoolEvent>> => {
    const baseUrl = getAmmAquaUrl();

    const { data } = await axios.get<ListResponse<PoolEvent>>(
        `${baseUrl}/events/user/${accountId}/`,
        {
            params: {
                size: 500,
                ...(event && { event_type__in: filter }),
            },
        },
    );

    return data;
};

export const getNextUserHistory = async (link: string): Promise<ListResponse<PoolEvent>> => {
    const { data } = await axios.get<ListResponse<PoolEvent>>(link);

    return data;
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
    isSend: boolean,
    decimals: number,
): Promise<FindSwapPath> => {
    const headers = { 'Content-Type': 'application/json' };
    const baseUrl = getAmmAquaUrl();

    const body = JSON.stringify({
        token_in_address: baseId,
        token_out_address: counterId,
        amount: new BigNumber(amount).times(Math.pow(10, decimals)).toFixed(),
    });
    const { data } = await axios.post<FindSwapPath>(
        isSend ? `${baseUrl}/pools/find-path/` : `${baseUrl}/pools/find-path-strict-receive/`,
        body,
        {
            headers,
        },
    );
    return data;
};

export const getTotalStats = async (pageSize = 365): Promise<PoolStatistics[]> => {
    const baseUrl = getAmmAquaUrl();

    const { data } = await axios.get<ListResponse<PoolStatistics>>(
        `${baseUrl}/statistics/totals/?size=${pageSize}`,
    );
    return data.items.reverse();
};

export const getVolume24h = async (): Promise<PoolVolume24h> => {
    const baseUrl = getAmmAquaUrl();

    const { data } = await axios.get<PoolVolume24h>(`${baseUrl}/statistics/24h/`);
    return data;
};

interface GetNativePricesOpts {
    onlySoroban: boolean;
}

export const convertNativePriceToToken = (item: NativePrice): Token =>
    item.name === 'native' && item.is_sac
        ? createLumen()
        : item.is_sac
          ? createAsset(item.code, item.issuer)
          : {
                contract: item.address,
                type: TokenType.soroban,
                name: item.name,
                code: item.code,
                decimal: item.decimals,
            };

export const getNativePrices = async (
    opts?: GetNativePricesOpts,
): Promise<Map<string, { price: string; token: Token }>> => {
    const baseUrl = getAmmAquaUrl();

    const allPrices = new Map<string, { price: string; token: Token }>();

    const { data } = await axios.get<ListResponse<NativePrice>>(
        `${baseUrl}/tokens/?pooled=true&size=500`,
    );
    const prices = data.items.filter(item => {
        if (opts?.onlySoroban) {
            return !item.is_sac;
        }

        return true;
    });

    prices.forEach(price => {
        allPrices.set(price.address, {
            price: (+price.price_xlm * Math.pow(10, price.decimals - 7)).toFixed(7),
            token: convertNativePriceToToken(price),
        });
    });

    return allPrices;
};

export const getPathPoolsFee = async (addresses: Array<string>): Promise<Map<string, Pool>> => {
    const baseUrl = getAmmAquaUrl();

    const { data } = await axios.get<ListResponse<Pool>>(
        `${baseUrl}/pools/?address__in=${addresses.join(',')}`,
    );

    return (await processPools(data.items)).reduce((acc, pool) => {
        acc.set(pool.address, pool.fee);
        return acc;
    }, new Map());
};

export const getPoolsToMigrate = async (base: Asset, counter: Asset): Promise<Pool[] | null> => {
    const baseUrl = getAmmAquaUrl();

    const { data } = await axios.get<ListResponse<Pool>>(
        `${baseUrl}/pools?tokens__in=${SorobanService.token.getAssetContractId(
            base,
        )},${SorobanService.token.getAssetContractId(counter)}`,
    );

    const pools = data.items
        .filter(item => item.tokens_str.length === 2)
        .sort((a, b) => +b.liquidity_usd - +a.liquidity_usd);

    if (!pools.length) {
        return null;
    }
    return processPools(pools);
};

export const getPoolsForIncentives = async (): Promise<PoolProcessed[] | null> => {
    const baseUrl = getAmmAquaUrl();

    const { data } = await axios.get<ListResponse<Pool>>(
        `${baseUrl}/pools/?gauge_enabled=true&size=500`,
    );

    return processPools(data.items);
};

// TODO: remove this method when this data is placed on the backend
export const getAmmRewards = async (): Promise<number> => {
    const baseUrl = getAmmAquaUrl();

    const { data } = await axios.get<ListResponse<PoolRewards>>(`${baseUrl}/pool-rewards/`);

    const sumTps = data.items.reduce((acc, item) => acc + Number(item.tps) / 1e7, 0);

    return sumTps * 60 * 60 * 24;
};

// TODO: remove this method when this data is placed on the backend
export const getAquaInPoolsSum = async (): Promise<{ sum: number; sum_usd: number }> => {
    const baseUrl = getAmmAquaUrl();

    const { aquaContract, aquaAssetString } = getAquaAssetData();

    const { data } = await axios.get<ListResponse<Pool>>(
        `${baseUrl}/pools/?&search=${aquaContract}&size=500`,
    );

    return data.items.reduce(
        (acc, item) => {
            const aquaIndex = item.tokens_str.findIndex(str => str === aquaAssetString);

            acc.sum = acc.sum + Number(item.reserves[aquaIndex]) / 1e7;
            acc.sum_usd = acc.sum_usd + Number(item.liquidity_usd) / 1e7 / 2;

            return acc;
        },
        { sum: 0, sum_usd: 0 },
    );
};

// TODO: remove this method when this data is placed on the backend
export const getAquaPoolsMembers = async (): Promise<number> => {
    const baseUrl = getAmmAquaUrl();

    const { aquaContract } = getAquaAssetData();

    const { data } = await axios.get<ListResponse<Pool>>(
        `${baseUrl}/pools/?&search=${aquaContract}&size=500`,
    );

    const poolsId = data.items.map(item => item.address);

    const membersCount = await Promise.all(poolsId.map(id => getPoolMembersCount(id)));

    return membersCount.reduce((acc, item) => acc + item.membersCount, 0);
};

export const getAquaXlmRate = async (): Promise<number[]> => {
    const baseUrl = getAmmAquaUrl();

    const { aquaContract } = getAquaAssetData();

    const XLM_CONTRACT = Asset.native().contractId(getNetworkPassphrase());

    const { data } = await axios.get<ListResponse<Pool>>(
        `${baseUrl}/pools/?&tokens__in=${aquaContract},${XLM_CONTRACT}`,
    );

    const [bestPool] = data.items.sort((a, b) => Number(b.liquidity_usd) - Number(a.liquidity_usd));

    return bestPool.reserves.map(reserve => +reserve / 1e7);
};

// TODO: remove this method when this data is placed on the backend
export const getAssetsList = async (): Promise<Token[]> => {
    const baseUrl = getAmmAquaUrl();

    const { data } = await axios.get<ListResponse<NativePrice>>(
        `${baseUrl}/tokens/?pooled=true&size=200`,
    );

    // tokens in the top of the list - AQUA, XLM, USDC
    const { aquaStellarAsset } = getAquaAssetData();
    const { usdcStellarAsset } = getUsdcAssetData();
    const lumen = createLumen();

    const otherTokens = data.items
        .filter(
            ({ address }) =>
                address !== aquaStellarAsset.contract &&
                address !== usdcStellarAsset.contract &&
                address !== lumen.contract,
        )
        .map(price => convertNativePriceToToken(price));

    return [aquaStellarAsset, lumen, usdcStellarAsset, ...otherTokens];
};

function chunkArray<T>(arr: T[], size = 5) {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

export const getUserRewardsList = async (accountId: string): Promise<UserReward[]> => {
    const baseUrl = getAmmAquaUrl();

    const { data } = await axios.get<ListResponse<Pool>>(`${baseUrl}/pools/?size=500`);

    const results: UserReward[] = [];

    const processed = await processPools(data.items);

    const chunked = chunkArray(processed, 4);

    await chunkFunction(chunked, async chunk => {
        const rewards = await SorobanService.amm.getPoolsRewards(
            accountId,
            chunk.map(({ address }) => address),
        );
        const incentives = await SorobanService.amm.getPoolsIncentives(
            accountId,
            chunk.map(({ address }) => address),
        );

        rewards.forEach((item, index) => {
            if (Number(item.to_claim)) {
                results.push({
                    id: `${RewardType.aquaReward}-${chunk[index].address}`,
                    amount: Number(item.to_claim),
                    tokens: chunk[index].tokens,
                    poolType: chunk[index].pool_type,
                    fee: chunk[index].fee,
                    poolAddress: chunk[index].address,
                    type: RewardType.aquaReward,
                });
            }

            if (
                incentives[index].length &&
                incentives[index].some(incentive => !!Number(incentive.info.user_reward))
            ) {
                results.push({
                    id: `${RewardType.incentive}-${chunk[index].address}`,
                    poolAddress: chunk[index].address,
                    incentives: incentives[index],
                    tokens: chunk[index].tokens,
                    poolType: chunk[index].pool_type,
                    fee: chunk[index].fee,
                    type: RewardType.incentive,
                });
            }
        });
    });

    return results.sort(
        (a, b) =>
            Number(b.type === RewardType.aquaReward ? b.amount : b.incentives[0].info.user_reward) -
            Number(a.type === RewardType.aquaReward ? a.amount : a.incentives[0].info.user_reward),
    );
};

export const getAllTimeStats = async (): Promise<AllTimeStats> => {
    const baseUrl = getAmmAquaUrl();

    const { data } = await axios.get<AllTimeStats>(
        `${baseUrl}/api/external/v2/statistics/all-time/`,
    );

    return data;
};
