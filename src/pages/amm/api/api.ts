import axios from 'axios';
import { AssetsService } from '../../../common/services/globalServices';
import { Asset } from '@stellar/stellar-sdk';

const API_URL = 'https://amm-api-testnet.aqua.network';

export enum FilterOptions {
    all = '',
    stable = 'stable',
    constant = 'constant_product',
}

const stringToAsset = (str: string): Asset => {
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
const getPoolsInfo = (filter: FilterOptions, page: number, size: number) => {
    let total = 0;
    return axios
        .get(`${API_URL}/pools/?pool_type=${filter}&page=${page}&size=${size}`)
        .then(({ data }) => data)
        .then((res) => {
            // @ts-ignore
            total = res.total;
            // @ts-ignore
            return processPools(res.items);
        })
        .then((pools) => [pools, total]);
};

const getPoolsStats = () => {
    // @ts-ignore
    return axios.get(`${API_URL}/statistics/?size=1000`).then(({ data }) => data.items);
};

const getPoolsRewards = () => {
    // @ts-ignore
    return axios.get(`${API_URL}/pool-rewards/?size=1000`).then(({ data }) => data.items);
};

export const getPools = (filter: FilterOptions, page: number, size: number) => {
    let totalCount = 0;
    return Promise.all([getPoolsInfo(filter, page, size), getPoolsStats(), getPoolsRewards()])
        .then(([[info, total], stats, rewards]) => {
            totalCount = total;
            return info.map((poolInf) => {
                // @ts-ignore
                const poolStat = stats.find(({ pool_address }) => pool_address === poolInf.address);
                // @ts-ignore
                const poolRewards = rewards.find(
                    ({ pool_address }) => pool_address === poolInf.address,
                );

                return {
                    ...poolInf,
                    ...poolStat,
                    ...poolRewards,
                };
            });
        })
        .then((pools) => [pools, totalCount]);
};

const getPoolInfo = (id: string) => {
    return axios
        .get(`${API_URL}/pools/${id}/`)
        .then(({ data }) => data)
        .then((res) => processPools([res]))
        .then(([res]) => res);
};

const getPoolStats = (id: string) => {
    return axios.get(`${API_URL}/statistics/pool/${id}/`).then(({ data }) => data[0]);
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

const getPoolRewards = (id: string) => {
    return axios
        .get(`${API_URL}/pool-rewards/${id}/`)
        .then(({ data }) => data)
        .catch(() => ({}));
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
        getPoolRewards(id),
        getPoolMembers(id),
        getPoolEvents(id),
    ]).then(([info, stats, rewards, members, events]) =>
        Object.assign({}, info, stats, rewards, members, events),
    );
};

export const getUserPools = (accountId: string) => {
    return (
        axios
            .get(`${API_URL}/pools/user/${accountId}/?size=1000`)
            // @ts-ignore
            .then(({ data }) => processPools(data.items))
    );
};
