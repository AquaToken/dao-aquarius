export type MarketPair = {
    asset1_code: string;
    asset1_issuer: string;
    asset2_code: string;
    asset2_issuer: string;
};

export type AmmReward = {
    boosted_reward: number;
    market_pair: MarketPair;
    pool_id: string;
    reserve_a_amount: string;
    reserve_a_asset: string;
    reserve_b_amount: string;
    reserve_b_asset: string;
    reward_amount: number;
    reward_volume: string;
    total_shares: string;
    total_trustlines: number;
};

export type SdexReward = {
    boosted_reward: number;
    daily_amm_reward: number;
    daily_sdex_reward: number;
    last_updated: string;
    maker_reward: number;
    market_key: MarketPair;
};
