type ProposalStatus = 'DISCUSSION' | 'VOTING' | 'VOTED' | 'EXPIRED';
type PaymentStatus =
    | 'HORIZON_ERROR'
    | 'BAD_MEMO'
    | 'INVALID_PAYMENT'
    | 'FINE'
    | 'FAILED_TRANSACTION';
type ProposalType = 'GENERAL' | 'ADD_ASSET' | 'REMOVE_ASSET' | 'general';
type OnchainActionType = 'NONE';
type OnchainExecutionStatus =
    | 'NOT_REQUIRED'
    | 'PENDING'
    | 'IN_PROGRESS'
    | 'SUBMITTED'
    | 'SUCCESS'
    | 'FAILED'
    | 'REQUIRES_REVIEW'
    | 'SKIPPED';

export type VoteChoiceSimple = 'vote_for' | 'vote_against' | 'vote_abstain';

export type ProposalSimple = {
    id: number;
    proposal_type?: ProposalType;
    proposed_by: string;
    title: string;
    text: string;
    start_at: string | null;
    end_at: string | null;
    vote_for_result: string;
    vote_against_result: string;
    vote_abstain_result?: string;
    is_simple_proposal: boolean;
    aqua_circulating_supply: string;
    proposal_status: ProposalStatus;
    last_updated_at: string;
    created_at: string;
    discord_channel_name?: string | null;
    discord_channel_url?: string | null;
    discord_username?: string | null;
    percent_for_quorum: number;
    ice_circulating_supply: string;
    logvote_set: LogVote[];
    vote_for_issuer: string;
    vote_against_issuer: string;
    abstain_issuer?: string;
};

export type LogVote = {
    account_issuer: string;
    amount: string;
    asset_code: string;
    claimable_balance_id: string;
    created_at: string;
    transaction_link: string;
    vote_choice: VoteChoiceSimple;
};

type ProposalHistory = {
    created_at: string;
    text: string;
    title: string;
    version: number;
};

export type Proposal = {
    id: number;
    proposal_type?: ProposalType;
    is_simple_proposal: boolean;
    end_at: string | null;
    proposed_by: string;
    start_at: string | null;
    text: string;
    title: string;
    vote_against_issuer: string;
    vote_against_result: string;
    abstain_issuer?: string;
    vote_abstain_result?: string;
    vote_for_issuer: string;
    vote_for_result: string;
    aqua_circulating_supply: string;
    discord_channel_name?: string | null;
    discord_channel_url?: string | null;
    discord_username?: string | null;
    payment_status: PaymentStatus;
    proposal_status: ProposalStatus;
    last_updated_at: string;
    created_at: string;
    history_proposal: ProposalHistory[];
    version: number;
    percent_for_quorum?: number;
    ice_circulating_supply?: string;
    asset_aquarius_traction?: string | null;
    asset_audit_info?: string | null;
    asset_code?: string | null;
    asset_community_references?: string | null;
    asset_contract_address?: string | null;
    asset_holder_distribution?: string | null;
    asset_issuer?: string | null;
    asset_issuer_commitments?: string | null;
    asset_issuer_information?: string | null;
    asset_liquidity?: string | null;
    asset_related_projects?: string | null;
    asset_stellar_flags?: string | null;
    asset_token_description?: string | null;
    asset_trading_volume?: string | null;
    onchain_action_args?: unknown[];
    onchain_action_type?: OnchainActionType;
    onchain_execution_poll_count?: number;
    onchain_execution_started_at?: string | null;
    onchain_execution_status?: OnchainExecutionStatus;
    onchain_execution_submitted_at?: string | null;
    onchain_execution_tx_hash?: string | null;
};

export type Vote = {
    account_issuer: string;
    amount: string;
    vote_choice: VoteChoiceSimple;
    transaction_link: string;
    created_at: string;
    asset_code: string;
};

export type ProposalCreateOptions = {
    proposed_by: string;
    title: string;
    text: string;
    start_at: string;
    end_at: string;
    transaction_hash: string;
    envelope_xdr: string;
    discord_username?: string;
    discord_channel_name?: string;
    discord_channel_url?: string;
};
