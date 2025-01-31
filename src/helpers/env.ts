import { ENV_PRODUCTION, ENV_TESTNET } from 'constants/env';
import { LS_ENV_NAME } from 'constants/local-storage';
import { NETWORK_PASSPHRASES } from 'constants/stellar';

import { Environment } from 'types/env';

export const getEnv = (): Environment => {
    const env = localStorage.getItem(LS_ENV_NAME);
    return (env as Environment) || ENV_TESTNET;
};
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
