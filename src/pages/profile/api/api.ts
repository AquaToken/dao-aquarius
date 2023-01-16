import axios from 'axios';
import { ListResponse } from '../../vote/api/types';
import { AmmReward, SdexReward } from './types';

const API_URL = 'https://profile-api.aqua.network/api/';

export const getAmmRewards = (accountId: string): Promise<AmmReward[]> => {
    return axios
        .get<ListResponse<AmmReward>>(`${API_URL}amm_rewards/${accountId}?limit=100`)
        .then(({ data }) => data.results.filter(({ reward_amount }) => Boolean(reward_amount)));
};

export const getSdexRewards = (accountId: string): Promise<SdexReward[]> => {
    return axios
        .get<ListResponse<SdexReward>>(`${API_URL}sdex_rewards/${accountId}?limit=100`)
        .then(({ data }) => data.results.filter(({ maker_reward }) => Boolean(maker_reward)));
};
