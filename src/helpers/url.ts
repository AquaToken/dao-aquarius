import { API_URLS } from 'constants/api';
import { COINDISCO_WIDGET_URL } from 'constants/urls';

import { getEnv } from './env';

export const getHorizonUrl = () => API_URLS[getEnv()].horizon;
export const getSorobanUrl = () => API_URLS[getEnv()].soroban;
export const getAmmAquaUrl = () => API_URLS[getEnv()].ammAqua;
export const getGovernanceUrl = () => API_URLS[getEnv()].governance;
export const getMarketKeysUrl = () => API_URLS[getEnv()].marketKeys;
export const getVotingTrackerUrl = () => API_URLS[getEnv()].votingTracker;
export const getRewardUrl = () => API_URLS[getEnv()].reward;
export const getRewardsUrl = () => `${getRewardUrl()}rewards/`;
export const getRewardQuestUrl = () => `${getRewardUrl()}quest/`;
export const getBribesUrl = () => API_URLS[getEnv()].bribes;
export const getProfileUrl = () => API_URLS[getEnv()].profile;
export const getDelegationUrl = () => API_URLS[getEnv()].delegation;

export const getOnRampWidgetUrl = (params): string => {
    const urlParams = new URLSearchParams(params).toString();
    return `${COINDISCO_WIDGET_URL}?${urlParams}`;
};

export const normalizePath = (path: string) => (path !== '/' ? path.replace(/\/+$/, '') : path);
