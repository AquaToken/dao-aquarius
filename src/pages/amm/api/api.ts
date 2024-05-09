import axios from 'axios';
import { AssetsService, SorobanService } from '../../../common/services/globalServices';
import { SorobanEvent } from '../../../common/services/soroban.service';

const API_URL = 'https://amm-api-testnet.aqua.network';

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

    AssetsService.processAssets(assets);

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
    return axios
        .get(`${API_URL}/pool-rewards/${id}/`)
        .then(({ data }) => data)
        .catch(() => ({}));
};

export const getPool = (id: string) => {
    return Promise.all([getPoolInfo(id), getPoolStats(id), getPoolRewards(id)]).then(
        ([info, stats, rewards]) => Object.assign({}, info, stats, rewards),
    );
};

export const getUserPools = (accountId: string) => {
    return axios.get(`${API_URL}/pools/user/${accountId}/`).then(({ data }) => processPools(data));
};