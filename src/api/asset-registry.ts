import axios from 'axios';

import { getNativePrices } from 'api/amm';
import { getLumenUsdPrice } from 'api/price';

import { getAmmAquaUrl, getGovernanceUrl } from 'helpers/url';

import { ListResponse as GovernanceListResponse } from 'store/assetsStore/types';

import { ListResponse, Pool } from 'types/amm';
import { Proposal } from 'types/governance';

import {
    RegistryAssetMarketStatsMap,
    RegistryAssetsResponse,
} from 'web/pages/asset-registry/pages/AssetRegistryMainPage/AssetRegistryMainPage.types';

export const getRegistryAssetsRequest = (): Promise<RegistryAssetsResponse> =>
    axios
        .get<RegistryAssetsResponse>(`${getGovernanceUrl()}/asset-tokens/`)
        .then(({ data }) => data);

export const getActiveRegistryVotingRequest = (): Promise<Proposal | null> =>
    axios
        .get<GovernanceListResponse<Proposal>>(`${getGovernanceUrl()}/proposal/`, {
            params: {
                proposal_type: 'asset',
                status: 'voting',
                limit: 1,
                page: 1,
                ordering: '-created_at',
            },
        })
        .then(({ data }) => data.results[0] ?? null);

export const getUpcomingRegistryVotesRequest = (): Promise<Proposal[]> =>
    axios
        .get<GovernanceListResponse<Proposal>>(`${getGovernanceUrl()}/proposal/`, {
            params: {
                proposal_type: 'asset',
                status: 'discussion',
                limit: 100,
                page: 1,
                ordering: 'start_at',
            },
        })
        .then(({ data }) => data.results);

const AMM_PAGE_SIZE = 500;
const STELLAR_DECIMALS = 1e7;

const getAllAmmPools = async (): Promise<Pool[]> => {
    const baseUrl = getAmmAquaUrl();
    const pools: Pool[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
        const { data } = await axios.get<ListResponse<Pool>>(
            `${baseUrl}/pools/?size=${AMM_PAGE_SIZE}&page=${page}`,
        );

        pools.push(...data.items);
        totalPages = data.pages;
        page += 1;
    }

    return pools;
};

export const getRegistryAssetMarketStatsRequest =
    async (): Promise<RegistryAssetMarketStatsMap> => {
        const [pools, nativePrices, lumenUsdPrice] = await Promise.all([
            getAllAmmPools(),
            getNativePrices(),
            getLumenUsdPrice(),
        ]);

        return pools.reduce<RegistryAssetMarketStatsMap>((acc, pool) => {
            pool.tokens_addresses.forEach((tokenAddress, index) => {
                const reserve = Number(pool.reserves[index]);
                const tokenPriceInXlm = Number(nativePrices.get(tokenAddress)?.price ?? 0);

                if (!acc[tokenAddress]) {
                    acc[tokenAddress] = {
                        tvlUsd: 0,
                        volumeUsd: 0,
                    };
                }

                acc[tokenAddress].tvlUsd +=
                    (reserve / STELLAR_DECIMALS) * tokenPriceInXlm * lumenUsdPrice;
                acc[tokenAddress].volumeUsd += Number(pool.volume_usd) / STELLAR_DECIMALS;
            });

            return acc;
        }, {});
    };
