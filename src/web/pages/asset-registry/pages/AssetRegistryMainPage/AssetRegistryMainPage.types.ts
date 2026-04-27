import { PROPOSAL_STATUS } from 'constants/dao';

export enum AssetRegistryFilter {
    all = 'all',
    whitelisted = 'whitelisted',
    revoked = 'revoked',
}

export type RegistryAssetProposalType = 'ADD_ASSET' | 'REMOVE_ASSET';

export type RegistryAssetProposalStatus = 'DISCUSSION' | 'VOTING' | 'VOTED' | 'EXPIRED';

export type RegistryAssetOnchainExecutionStatus =
    | 'NOT_REQUIRED'
    | 'PENDING'
    | 'IN_PROGRESS'
    | 'SUBMITTED'
    | 'SUCCESS'
    | 'FAILED'
    | 'REQUIRES_REVIEW'
    | 'SKIPPED';

export type RegistryAssetProposal = {
    id: number;
    proposal_type: RegistryAssetProposalType;
    proposal_status: RegistryAssetProposalStatus;
    title: string;
    start_at: string | null;
    end_at: string | null;
    new_start_at: string | null;
    new_end_at: string | null;
    vote_for_result: string;
    vote_against_result: string;
    vote_abstain_result: string;
    vote_for_issuer?: string | null;
    vote_against_issuer?: string | null;
    abstain_issuer?: string | null;
    onchain_execution_status: RegistryAssetOnchainExecutionStatus;
    onchain_execution_tx_hash: string | null;
    created_at: string;
    last_updated_at: string;
};

export type RegistryAsset = {
    asset_code: string | null;
    asset_issuer: string | null;
    asset_contract_address: string | null;
    whitelisted: boolean;
    proposals: RegistryAssetProposal[];
};

export type RegistryAssetsResponse = {
    count: number;
    next: string | null;
    previous: string | null;
    results: RegistryAsset[];
};

export type RegistryAssetMarketStats = {
    tvlUsd: number;
    volumeUsd: number;
};

export type RegistryAssetMarketStatsMap = Record<string, RegistryAssetMarketStats>;

export enum AssetRegistryBadgeVariant {
    whitelisted = 'whitelisted',
    revoked = 'revoked',
    rejected = 'rejected',
    accepted = 'accepted',
    noQuorum = 'noQuorum',
}

export type AssetRegistryHistoryEntry = {
    id: string;
    date: string;
    proposedToLabel: string;
    proposedToVariant: AssetRegistryBadgeVariant;
    voteForResult: string;
    voteAgainstResult: string;
    voteAbstainResult: string;
    resultsStatus: PROPOSAL_STATUS;
};

export type UpcomingVoteData = {
    id?: string;
    startsAt: string;
    assetCode: string;
    assetIssuer: string;
    type: RegistryAssetProposalType;
};
