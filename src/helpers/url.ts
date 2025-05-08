import { API_URLS } from 'constants/api';
import { COINDISCO_WIDGET_URL } from 'constants/urls';

import { getEnv } from './env';

export const getHorizonUrl = () => API_URLS[getEnv()].horizon;
export const getSorobanUrl = () => API_URLS[getEnv()].soroban;
export const getAmmAquaUrl = () => API_URLS[getEnv()].ammAqua;

export const getOnRampWidgetUrl = (params): string => {
    const urlParams = new URLSearchParams(params).toString();
    return `${COINDISCO_WIDGET_URL}?${urlParams}`;
};
