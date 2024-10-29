import { API_URLS } from 'constants/api';
import { ENV_PRODUCTION, ENV_TESTNET } from 'constants/env';
import { LS_ENV_NAME } from 'constants/local-storage';
import { NETWORK_PASSPHRASES } from 'constants/stellar';

export const getEnv = () => localStorage.getItem(LS_ENV_NAME);
export const getIsTestnetEnv = () => getEnv() === ENV_TESTNET;
export const getIsProductionEnv = () => getEnv() === ENV_PRODUCTION;
export const setTestnetEnv = () => {
    localStorage.setItem(LS_ENV_NAME, ENV_TESTNET);
    window.location.reload();
};
export const setProductionEnv = () => {
    localStorage.setItem(LS_ENV_NAME, ENV_PRODUCTION);
    window.location.reload();
};

export const getNetworkPassphrase = () => NETWORK_PASSPHRASES[getEnv()];
