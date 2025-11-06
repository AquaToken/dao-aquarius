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
