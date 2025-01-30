import { Asset } from '@stellar/stellar-sdk';

import { POOL_TYPE } from 'services/soroban.service';

import { PoolClassic, PoolClassicReserves } from 'types/stellar';

export type ListResponse<T> = {
    items: T[];
    page: number;
    pages: number;
    size: number;
    total: number;
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
    rewards_apy: string;
    liquidity_usd: string;
    volume_usd: string;
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
    assets: Asset[];
}

export interface PoolUserProcessed extends PoolUser {
    assets: Asset[];
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
}

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

export interface PoolClassicProcessed extends Omit<PoolClassic, 'reserves'> {
    assets: Asset[];
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
};
