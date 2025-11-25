import { POOL_TYPE } from 'constants/amm';

import { PoolClassic, PoolClassicReserves } from 'types/stellar';

import { ClassicToken, Token } from './token';

export type ListResponse<T> = {
    items: T[];
    page: number;
    pages: number;
    size: number;
    total: number;
    next?: string;
    previous?: string;
};

export type Pool = {
    index: string;
    address: string;
    share_token_address: string;
    tokens_addresses: string[];
    reserves: string[];
    pool_type: POOL_TYPE;
    fee: string;
    a: number | null;
    deposit_killed: boolean;
    swap_killed: boolean;
    claim_killed: boolean;
    share_token_decimals: number;
    tokens_str: string[];
    volume: string;
    liquidity: string;
    reward_tps: string;
    total_share?: string;
    apy: string;
    liquidity_usd: string;
    volume_usd: string;
    apy_tier: number;
    rewards_tps: string;
    rewards_apy: string;
    incentive_tps_per_token: { [key: string]: string };
    incentive_apy_per_token: { [key: string]: string };
    incentive_apy: string;
    total_apy: string;
};

export type PoolRewards = {
    tps: string;
    pool_address: string;
    expired_at_str: string;
};

export interface PoolUser extends Pool {
    balance: string;
}

export interface PoolProcessed extends Pool {
    tokens: Token[];
}

export interface PoolUserProcessed extends PoolUser {
    tokens: Token[];
}

export type PoolStatistics = {
    volume: string;
    liquidity: string;
    date_str?: string;
    volume_usd: string;
    liquidity_usd: string;
    datetime_str?: string;
};

export type PoolVolume24h = {
    volume: string;
    volume_usd: string;
};

export type PoolBalance = {
    balance: string;
    account_address: string;
};

export enum PoolEventType {
    deposit = 'deposit',
    withdraw = 'withdraw',
    swap = 'swap',
    claim = 'claim',
    claimIncentives = 'claim_incentives',
}

export type PoolEvent = {
    event_type: PoolEventType;
    ledger: number;
    amounts: string[];
    transaction_hash: string;
    ledger_close_at_str: string;
    account_address: string;
    tokens?: string[];
    pool_tokens: string[];
};

export type CombinedSwapEvent = Omit<PoolEvent, 'tokens' | 'amounts' | 'event_type'> & {
    event_type: 'swap_combined';
    tokens: [string, string];
    amounts: [string, string];
    original_swaps: PoolEvent[];
    path: string[];
};

export interface PoolExtended extends PoolProcessed {
    stats: PoolStatistics[];
    membersCount: number;
}

export type NativePrice = {
    name: string;
    code: string;
    address: string;
    issuer: string | null;
    price_xlm: string;
    decimals: number;
    home_domain: null | string;
    description: null | string;
    asset_name: null | string;
    logo: null | string;
    is_sac: boolean;
};

export type FindSwapPath = {
    success: boolean;
    swap_chain_xdr: string;
    pools: string[];
    tokens: string[];
    amount: string;
    tokens_addresses: string[];
};

export interface PoolClassicProcessed extends Omit<PoolClassic, 'reserves'> {
    tokens: ClassicToken[];
    reserves: (string | PoolClassicReserves)[];
    total_share: string;
    fee: number;
    liquidity: string;
    pool_type: POOL_TYPE;
}

export type PoolRewardsInfo = {
    acc: string;
    block: string;
    exp_at: number;
    last_time: number;
    pool_acc: string;
    to_claim: string;
    tps: string;
    usr_block: string;
    boost_balance: string;
    boost_supply: string;
    new_working_balance: string;
    new_working_supply: string;
    supply: string;
    working_balance: string;
    working_supply: string;
};

export type PoolIncentives = {
    token: Token;
    info: {
        expired_at: string;
        tps: string;
        user_reward: string;
    };
};

export enum RewardType {
    aquaReward = 'aqua_reward',
    incentive = 'incentive',
}

type BaseUserReward<T> = {
    id: string;
    poolAddress: string;
    tokens: Token[];
    poolType: POOL_TYPE;
    fee: string;
    type: T;
};

export type UserAquaReward = BaseUserReward<RewardType.aquaReward> & { amount: number };
export type UserIncentive = BaseUserReward<RewardType.incentive> & { incentives: PoolIncentives[] };
export type UserReward = UserAquaReward | UserIncentive;
