import axios from 'axios';
import { SorobanService } from '../../../common/services/globalServices';

const API_URL = 'https://0061-103-175-215-255.ngrok-free.app';

export enum FilterOptions {
    all = 'all',
    stable = 'stable',
    constant = 'constant',
}

const processPools = async (pools) => {
    const contracts = pools.reduce((acc, item) => {
        item.tokens_addresses.forEach((address) => acc.add(address));
        return acc;
    }, new Set());

    const assets = await Promise.all(
        [...contracts].map((id) => SorobanService.getAssetFromContractId(id)),
    );

    pools.forEach((pool) => {
        pool.assets = [];
        pool.tokens_addresses.forEach((address, index) => {
            pool.assets[index] = assets[[...contracts].findIndex((key) => key === address)];
        });
    });
    return pools;
};
const getPoolsInfo = (filter?: FilterOptions) => {
    return axios
        .get(`${API_URL}/pools/`)
        .then(({ data }) => data)
        .then((res) => processPools(res));
};

const getPoolsStats = () => {
    return axios.get(`${API_URL}/statistics/`).then(({ data }) => data);
};

const getPoolsRewards = () => {
    return axios.get(`${API_URL}/pool-rewards/`).then(({ data }) => data);
};

export const getPools = () => {
    return Promise.all([getPoolsInfo(), getPoolsStats(), getPoolsRewards()]).then(
        ([info, stats, rewards]) => {
            return info.map((poolInf) => {
                const poolStat = stats.find(({ pool_address }) => pool_address === poolInf.address);
                const poolRewards = rewards.find(
                    ({ pool_address }) => pool_address === poolInf.address,
                );

                return {
                    ...poolInf,
                    ...poolStat,
                    ...poolRewards,
                };
            });
        },
    );
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

const getPoolRewards = (id: string) => {
    return axios.get(`${API_URL}/pool-rewards/${id}/`).then(({ data }) => data);
};

export const getPool = (id: string) => {
    return Promise.all([getPoolInfo(id), getPoolStats(id), getPoolRewards(id)]).then(
        ([info, stats, rewards]) => Object.assign({}, info, stats, rewards),
    );
};

export const getUserPools = (accountId: string) => {
    return axios.get(`${API_URL}/pools/user/${accountId}/`).then(({ data }) => data);
};
