import { ENV_PRODUCTION, ENV_TESTNET } from './env';

export const API_LIMIT = 200;

export const API_URL_STELLAR_EXPERT = 'https://api.stellar.expert/';
export const API_URL_ICE_LOCKER = 'https://ice-distributor.aqua.network/api';
export const API_REWARDS_BACKEND = 'https://reward-api.aqua.network/api/rewards/';
export const API_CMC = 'https://cmc.aqua.network/api';
export const API_ASSETS_LIST_URL = 'https://fed.stellarterm.com/issuer_orgs/';
export const API_ASSETS_INFO = 'https://assets.aqua.network/api/v1/assets/';

export const BRIBES_API_URL = 'https://bribes-api.aqua.network/api/';
export const MARKET_KEY_API_URL = 'https://marketkeys-tracker.aqua.network/api/market-keys/';
export const VOTING_TRACKER_API_URL = 'https://voting-tracker.aqua.network/api/voting-snapshot/';

export const API_URLS = {
    [ENV_PRODUCTION]: {
        moonpay: 'https://api.moonpay.com/v3',
        onRampProxy: 'https://soroban-on-ramp.coindisco.com',
        horizon: 'https://horizon.stellar.org',
        // soroban: 'https://mainnet.sorobanrpc.com/',
        soroban: 'https://soroban-rpc.aqua.network/',
        ammAqua: 'https://amm-api-staging.aqua.network', //staging
    },
    [ENV_TESTNET]: {
        moonpay: 'https://api.moonpay.com/v3',
        onRampProxy: 'https://soroban-on-ramp-testnet.aqua.network',
        horizon: 'https://horizon-testnet.stellar.org',
        soroban: 'https://soroban-testnet.stellar.org:443/',
        ammAqua: 'https://amm-api-testnet.aqua.network',
    },
};
