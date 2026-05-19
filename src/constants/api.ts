import { ENV_PRODUCTION, ENV_TESTNET } from './env';

export const API_LIMIT = 200;

export const API_URL_STELLAR_EXPERT = 'https://api.stellar.expert/';
export const API_URL_ICE_LOCKER = 'https://ice-distributor.aqua.network/api';
export const API_CMC = 'https://cmc.aqua.network/api';
export const API_ASSETS_LIST_URL = 'https://fed.stellarterm.com/issuer_orgs/';
export const API_ASSETS_INFO = 'https://assets.aqua.network/api/v1/assets/';

export const LOBSTR_VAULT_API_URL = 'https://vault.lobstr.co/api/transactions/';

export const API_ST_TICKER = 'https://api.stellarterm.com/v1/ticker.json';

export const API_DELEGATION_URL = 'https://api-delegation.aqua.network/api/delegation/';

export const API_AIRDROP_2 = 'https://airdrop2-checker-api.aqua.network/api/snapshot/';

export const API_URLS = {
    [ENV_PRODUCTION]: {
        onRampProxy: 'https://soroban-on-ramp.coindisco.com',
        horizon: 'https://horizon.stellar.org',
        // soroban: 'https://mainnet.sorobanrpc.com/',
        soroban: 'https://soroban-rpc.aqua.network/',
        ammAqua: 'https://amm-api.aqua.network',
        governance: 'https://governance-api.aqua.network/api',
        iceApproval: 'https://ice-approval.aqua.network/',
        marketKeys: 'https://marketkeys-tracker.aqua.network/api/market-keys/',
        votingTracker: 'https://voting-tracker.aqua.network/api/voting-snapshot/',
        reward: 'https://reward-api.aqua.network/api/',
        bribes: 'https://bribes-api.aqua.network/api/',
    },
    [ENV_TESTNET]: {
        onRampProxy: 'https://soroban-on-ramp-testnet.aqua.network',
        horizon: 'https://horizon-testnet.stellar.org',
        soroban: 'https://soroban-testnet.stellar.org:443/',
        ammAqua: 'https://amm-api-testnet.aqua.network',
        governance: 'https://governance-api-testnet.aqua.network/api',
        iceApproval: 'https://ice-approval-testnet.aqua.network/',
        marketKeys: 'https://marketkeys-tracker-testnet.aqua.network/api/market-keys/',
        votingTracker: 'https://voting-tracker-testnet.aqua.network/api/voting-snapshot/',
        reward: 'https://reward-api-testnet.aqua.network/api/',
        bribes: 'https://bribes-api-testnet.aqua.network/api/',
    },
};
