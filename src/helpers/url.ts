import { API_URLS } from 'constants/api';

import { getEnv } from './env';

export const getHorizonUrl = () => API_URLS[getEnv()].horizon;
export const getSorobanUrl = () => API_URLS[getEnv()].soroban;
