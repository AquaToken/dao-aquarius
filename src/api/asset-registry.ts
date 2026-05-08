import axios from 'axios';

import { getTokenStatsRequest } from 'api/amm';

import { getGovernanceUrl } from 'helpers/url';

import { ListResponse as GovernanceListResponse } from 'store/assetsStore/types';

import { Proposal } from 'types/governance';

import {
    RegistryAssetMarketStatsMap,
    RegistryAssetsResponse,
    RegistryProposalPreview,
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

export const getRegistryMyVotesRequest = (pubkey: string): Promise<RegistryProposalPreview[]> => {
    const params = new URLSearchParams();

    params.append('limit', '100');
    params.append('page', '1');
    params.append('ordering', '-created_at');
    params.append('proposal_type', 'asset');
    params.append('vote_owner_public_key', pubkey);
    params.append('active', 'true');

    return axios
        .get<GovernanceListResponse<RegistryProposalPreview>>(`${getGovernanceUrl()}/proposal/`, {
            params,
        })
        .then(({ data }) => data.results);
};

export const getRegistryVoteHistoryRequest = (
    pubkey: string,
): Promise<RegistryProposalPreview[]> => {
    const params = new URLSearchParams();

    params.append('limit', '100');
    params.append('page', '1');
    params.append('ordering', '-created_at');
    params.append('proposal_type', 'asset');
    params.append('vote_owner_public_key', pubkey);

    return axios
        .get<GovernanceListResponse<RegistryProposalPreview>>(`${getGovernanceUrl()}/proposal/`, {
            params,
        })
        .then(({ data }) => data.results);
};

export const getRegistryAssetMarketStatsRequest = async (
    contractIds: string[],
): Promise<RegistryAssetMarketStatsMap> => {
    const uniqueContractIds = [...new Set(contractIds.filter(Boolean))];

    const stats = await Promise.all(
        uniqueContractIds.map(contractId =>
            getTokenStatsRequest(contractId)
                .then(tokenStats => ({ contractId, tokenStats }))
                .catch(() => null),
        ),
    );

    return stats.reduce<RegistryAssetMarketStatsMap>((acc, item) => {
        if (!item) {
            return acc;
        }

        acc[item.contractId] = {
            tvlUsd: item.tokenStats.tvl_usd,
            totalVolumeUsd: item.tokenStats.total_volume_usd,
            dailyAverageVolumeUsd: item.tokenStats.daily_average_volume_30d_usd,
        };

        return acc;
    }, {});
};
