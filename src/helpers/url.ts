import { API_AMM_BACKEND_STAGING, API_URLS } from 'constants/api';

import { getEnv } from './env';

export const getHorizonUrl = () => API_URLS[getEnv()].horizon;
export const getSorobanUrl = () => API_URLS[getEnv()].soroban;
export const getAmmAquaUrl = () => {
    if (window.location.hostname.includes('staging')) {
        return API_AMM_BACKEND_STAGING;
    }
    return API_URLS[getEnv()].ammAqua;
};
