export type MarketPair = {
    asset1_code: string;
    asset1_issuer: string;
    asset2_code: string;
    asset2_issuer: string;
};

export type SdexReward = {
    boosted_reward: number;
    daily_amm_reward: number;
    daily_sdex_reward: number;
    last_updated: string;
    maker_reward: number;
    market_key: MarketPair;
};
