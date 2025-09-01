import { ENV_PRODUCTION, ENV_TESTNET } from './env';

export const CONTRACTS = {
    [ENV_PRODUCTION]: {
        amm: 'CA7RQDMMV6E53P5EDZA5GPWBZ33AMW2ZNO42XLI2RGRIAP4QXIARUOJQ', // staging
        batch: 'CBZX5A64HWVYXGGXSSWGYZZTUYFNGVKLAESK3XOZDJXYKLOY7MTCFAEV',
    },
    [ENV_TESTNET]: {
        amm: 'CBCFTQSPDBAIZ6R6PJQKSQWKNKWH2QIV3I4J72SHWBIK3ADRRAM5A6GD',
        batch: 'CCNMIX72UQIM44MB4T3LIKIMADPFBNIBVHTX27QTFLB6IACJLRWM6PA4',
    },
};

export enum AMM_CONTRACT_METHOD {
    GET_POOLS = 'get_pools',
    INIT_CONSTANT_POOL = 'init_standard_pool',
    INIT_STABLESWAP_POOL = 'init_stableswap_pool',
    DEPOSIT = 'deposit',
    SHARE_ID = 'share_id',
    ESTIMATE_SWAP_ROUTED = 'estimate_swap_routed',
    WITHDRAW = 'withdraw',
    SWAP = 'swap',
    SWAP_CHAINED = 'swap_chained',
    SWAP_CHAINED_RECEIVE = 'swap_chained_strict_receive',
    GET_RESERVES = 'get_reserves',
    POOL_TYPE = 'pool_type',
    FEE_FRACTION = 'get_fee_fraction',
    GET_REWARDS_INFO = 'get_rewards_info',
    GET_INFO = 'get_info',
    GET_USER_REWARD = 'get_user_reward',
    GET_TOTAL_SHARES = 'get_total_shares',
    CLAIM = 'claim',
    GET_STABLE_CREATION_FEE = 'get_stable_pool_payment_amount',
    GET_CONSTANT_CREATION_FEE = 'get_standard_pool_payment_amount',
    GET_CREATION_FEE_TOKEN = 'get_init_pool_payment_token',
    GET_INIT_POOL_DESTINATION = 'get_init_pool_payment_address',
    CALC_WITHDRAW_ONE_COIN = 'calc_withdraw_one_coin',
    WITHDRAW_ONE_COIN = 'withdraw_one_coin',
    WITHDRAW_CUSTOM = 'remove_liquidity_imbalance',
    SCHEDULE_INCENTIVE = 'pool_gauge_schedule_reward',
    GET_INCENTIVES_INFO = 'gauges_get_reward_info',
    CLAIM_INCENTIVES = 'gauges_claim',
    GET_INCENTIVES_MIN_DAILY_AMOUNT = 'pool_gauge_get_min_daily_amount',
    GET_INCENTIVES_MIN_DURATION = 'pool_gauge_get_min_duration',
}

export enum BATCH_CONTRACT_METHOD {
    batch = 'batch',
}

export enum ASSET_CONTRACT_METHOD {
    GET_ALLOWANCE = 'allowance',
    APPROVE_ALLOWANCE = 'approve',
    GET_BALANCE = 'balance',
    NAME = 'name',
    TRANSFER = 'transfer',
    BURN = 'burn',
    SYMBOL = 'symbol',
    DECIMALS = 'decimals',
}

export enum CONTRACT_STATUS {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    NOT_FOUND = 'not_found',
}
