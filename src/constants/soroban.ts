import { ENV_PRODUCTION, ENV_TESTNET } from './env';

export const CONTRACTS = {
    [ENV_PRODUCTION]: {
        amm: 'CA7RQDMMV6E53P5EDZA5GPWBZ33AMW2ZNO42XLI2RGRIAP4QXIARUOJQ', // staging
        batch: 'CBZX5A64HWVYXGGXSSWGYZZTUYFNGVKLAESK3XOZDJXYKLOY7MTCFAEV',
    },
    [ENV_TESTNET]: {
        amm: 'CBVHOWNJ5JUQCRIJBIIIZCDY2DFD5TSD5T7ZKKGLMURBODXLSR2RQTKP',
        batch: 'CDVND7CJS2IC3WSU72PZMS4LAQ4OPDDIL3ILUSB5UNVELIEGF56OBTDI',
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
