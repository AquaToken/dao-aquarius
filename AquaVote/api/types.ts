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
    desc?: string;
    accounts_authorized?: number;
    anchor_asset: string;
    anchor_asset_type: string;
    auth_clawback_enabled: boolean;
    auth_immutable: boolean;
    auth_revocable: boolean;
    balances_authorized: string;
    claimable_balances_amount: string;
    conditions: string;
    is_asset_anchored: boolean;
    is_verified: boolean;
    liquidity_pools_amount: string;
    is_supply_locked: boolean;
    first_transaction: string;
};

export type MarketVotes = {
    market_key: string;
    rank: number;
    timestamp: string;
    votes_value: string;
    voting_amount: number;
    upvote_value: string;
    downvote_value: string;
    extra: {
        downvote_assets: MarketVotesAssetStats[];
        upvote_assets: MarketVotesAssetStats[];
    };
};

type MarketVotesAssetStats = {
    asset: string;
    votes_count: number;
    votes_sum: string;
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

export type MarketBribes = {
    market_key: string;
    aggregated_bribes: Bribe[];
};

export type Bribe = {
    market_key: string;
    total_reward_amount: string;
    start_at: string;
    stop_at: string;
    asset_code: string;
    asset_issuer: string;
    daily_amount: string;
    aqua_total_reward_amount_equivalent: string;
    daily_aqua_equivalent: string;
};

export type PairStats = MarketKey & MarketVotes & MarketBribes;

export type TotalStats = {
    market_key_count: number;
    votes_value_sum: string;
    voting_amount_sum: number;
    timestamp: string;
    adjusted_votes_value_sum: string;
    total_votes_sum: string;
};

export type UpcomingBribe = {
    amount: string;
    aqua_total_reward_amount_equivalent: string;
    asset_code: string;
    asset_issuer: string;
    claimable_balance_id: string;
    created_at: string;
    market_key: string;
    sponsor: string;
    start_at: string;
    stop_at: string;
    unlock_time: string;
};

export type Rewards = {
    daily_amm_reward: number;
    daily_sdex_reward: number;
    daily_total_reward: number;
    last_updated: string;
    market_key: RewardMarketKey;
};

export type RewardMarketKey = {
    asset1_code: string;
    asset1_issuer: string;
    asset2_code: string;
    asset2_issuer: string;
};
