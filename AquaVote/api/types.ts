export type ListResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

export type AssetSimple = {
    code: string;
    issuer: string;
};

export type Asset = {
    asset_string: string | null;
    code: string | undefined;
    home_domain: string | null;
    image: string | null;
    issuer: string;
    name: string;
    auth_required?: boolean;
};

export type MarketVotes = {
    market_key: string;
    rank: number;
    timestamp: string;
    votes_value: string;
    voting_amount: number;
    upvote_value: string;
    downvote_value: string;
};

export type MarketKey = {
    account_id: string;
    asset1: string;
    asset1_code: string;
    asset1_issuer: string;
    asset2: string;
    asset2_code: string;
    asset2_issuer: string;
    created_at: string;
    id: number;
    locked_at: string;
    downvote_account_id: string;
    no_liquidity: boolean;
    auth_required: boolean;
    adjusted_votes_value: string;
};

export type PairStats = MarketKey & MarketVotes;

export type TotalStats = {
    market_key_count: number;
    votes_value_sum: string;
    voting_amount_sum: number;
    timestamp: string;
    adjusted_votes_value_sum: string;
};
