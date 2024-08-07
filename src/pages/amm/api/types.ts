import { Asset } from '@stellar/stellar-sdk';

export type ListResponse<T> = {
    items: T[];
    page: number;
    pages: number;
    size: number;
    total: number;
};

export type PoolType = 'constant_product' | 'stable';

export type Pool = {
    index: string;
    address: string;
    share_token_address: string;
    tokens_addresses: string[];
    reserves: string[];
    pool_type: PoolType;
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
    rewards_apy: string;
};

export interface PoolUser extends Pool {
    balance: string;
}

export interface PoolProcessed extends Pool {
    assets: Asset[];
}

export interface PoolUserProcessed extends PoolUser {
    assets: Asset[];
}

export type PoolStatistics = {
    volume: string;
    liquidity: string;
    date_str: string;
};

export type PoolBalance = {
    balance: string;
    account_address: string;
};

export type PoolEventType = 'deposit' | 'withdraw' | 'swap';

export type PoolEvent = {
    event_type: PoolEventType;
    ledger: number;
    amounts: string[];
    transaction_hash: string;
    ledger_close_at_str: string;
    account_address: string;
};

export interface PoolExtended extends PoolProcessed {
    stats: PoolStatistics[];
    membersCount: number;
}

export type NativePrice = {
    name: string;
    code: string;
    address: string;
    issuer: string;
    price_xlm: string;
};

export type FindSwapPath = {
    success: boolean;
    swap_chain_xdr: string;
    pools: string[];
    tokens: string[];
    amount: string;
};
