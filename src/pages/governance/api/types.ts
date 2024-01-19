export type ProposalSimple = {
    id: number;
    proposed_by: string;
    title: string;
    text: string;
    start_at: string;
    end_at: string;
    vote_for_result: string;
    vote_against_result: string;
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
};

export type LogVote = {
    account_issuer: string;
    amount: string;
    asset_code: string;
    claimable_balance_id: string;
    created_at: string;
    transaction_link: string;
    vote_choice: string;
};

type ProposalStatus = 'DISCUSSION' | 'VOTING' | 'VOTED' | 'EXPIRED';
type PaymentStatus =
    | 'HORIZON_ERROR'
    | 'BAD_MEMO'
    | 'INVALID_PAYMENT'
    | 'FINE'
    | 'FAILED_TRANSACTION';

type ProposalHistory = {
    created_at: string;
    text: string;
    title: string;
    version: number;
};

export type Proposal = {
    id: number;
    is_simple_proposal: boolean;
    end_at: string;
    proposed_by: string;
    start_at: string;
    text: string;
    title: string;
    vote_against_issuer: string;
    vote_against_result: string;
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
};

export type VoteChoiceSimple = 'vote_for' | 'vote_against';

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
