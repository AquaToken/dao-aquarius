import axios from 'axios';

import { SdexReward } from './types';

import { ListResponse } from '../../vote/api/types';

const API_URL = 'https://profile-api.aqua.network/api/';

export const getSdexRewards = (accountId: string): Promise<SdexReward[]> =>
    axios
        .get<ListResponse<SdexReward>>(`${API_URL}sdex_rewards/${accountId}?limit=100`)
        .then(({ data }) => data.results.filter(({ maker_reward }) => Boolean(maker_reward)));
