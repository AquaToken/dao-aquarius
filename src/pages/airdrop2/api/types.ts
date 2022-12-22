export type AirdropStats = {
    accounts: number;
    accounts_with_lock: number;
    aqua_price: string;
    locked_aqua: string;
    share_price: string;
    timestamp: string;
    total_aqua: string;
    total_shares: string;
    total_xlm: string;
};

export type AccountEligibility = {
    account_id: string;
    airdrop_boost: string;
    airdrop_reward: string;
    airdrop_shares: string;
    aqua_balance: string;
    aqua_lock_balance: string;
    aqua_lock_term: number;
    aqua_pool_balance: string;
    native_balance: string;
    native_pool_balance: string;
    raw_airdrop_reward: string;
    raw_airdrop_shares: string;
    yxlm_balance: string;
    yxlm_pool_balance: string;
};
