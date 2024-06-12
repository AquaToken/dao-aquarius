import axios from 'axios';
import { AssetsService } from '../../../common/services/globalServices';
import { Asset } from '@stellar/stellar-sdk';

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

export const stringToAsset = (str: string): Asset => {
    const [code, issuer] = str.split(':');

    if (code === 'native') {
        return Asset.native();
    }
    return new Asset(code, issuer);
};

const processPools = async (pools) => {
    const assetsStr = pools.reduce((acc, item) => {
        item.tokens_str.forEach((str) => acc.add(str));
        return acc;
    }, new Set());

    AssetsService.processAssets([...assetsStr].map((str) => stringToAsset(str)));

    pools.forEach((pool) => {
        pool.assets = pool.tokens_str.map((str) => stringToAsset(str));
    });
    return pools;
};

export const getPools = (
    filter: FilterOptions,
    page: number,
    size: number,
    sort: PoolsSortFields,
    search?: string,
) => {
    let total = 0;

    const capitalizedSearch = (search || '').toUpperCase();

    return axios
        .get(
            `${API_URL}/pools/?pool_type=${filter}&sort=${sort}&page=${page}&size=${size}&search=${
                capitalizedSearch === 'XLM' ? 'native' : capitalizedSearch
            }`,
        )
        .then(({ data }) => data)
        .then((res) => {
            // @ts-ignore
            total = res.total;
            // @ts-ignore
            return processPools(res.items);
        })
        .then((pools) => [pools, total]);
};

const getPoolInfo = (id: string) => {
    return axios
        .get(`${API_URL}/pools/${id}/`)
        .then(({ data }) => data)
        .then((res) => processPools([res]))
        .then(([res]) => res);
};

const getPoolStats = (id: string) => {
    return (
        axios
            .get(`${API_URL}/statistics/pool/${id}/`)
            // @ts-ignore
            .then(({ data }) => ({ stats: data.items.reverse() }))
    );
};

const getPoolMembers = (id: string) => {
    return (
        axios
            .get(`${API_URL}/pools/${id}/balances/?size=100`)
            .then(({ data }) => data)
            // @ts-ignore
            .then((data) => ({ members: data.items }))
            .catch(() => ({ members: [] }))
    );
};

const getPoolEvents = (id) => {
    return (
        axios
            .get(`${API_URL}/events/pool/${id}/?size=20`)
            .then(({ data }) => data)
            // @ts-ignore
            .then((data) => ({ events: data.items }))
            .catch(() => ({ events: [] }))
    );
};

export const getPool = (id: string) => {
    return Promise.all([
        getPoolInfo(id),
        getPoolStats(id),
        getPoolMembers(id),
        getPoolEvents(id),
    ]).then(([info, stats, members, events]) => Object.assign({}, info, stats, members, events));
};

export const getUserPools = (accountId: string) => {
    return (
        axios
            .get(`${API_URL}/pools/user/${accountId}/?size=1000`)
            // @ts-ignore
            .then(({ data }) => processPools(data.items))
    );
};

export const findSwapPath = (baseId: string, counterId: string, amount: string) => {
    const headers = { 'Content-Type': 'application/json' };

    const body = JSON.stringify({
        token_in_address: baseId,
        token_out_address: counterId,
        amount: (+amount * 1e7).toString(),
    });
    return axios.post(`${API_URL}/pools/find-path/`, body, { headers }).then(({ data }) => data);
};

export const getTotalStats = () => {
    return (
        axios
            .get(`${API_URL}/statistics/totals/`)
            // @ts-ignore
            .then(({ data }) => data.items.reverse())
    );
};
