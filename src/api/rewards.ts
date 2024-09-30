import axios from 'axios';

import { API_REWARDS_BACKEND } from 'constants/api';

import { ListResponse } from 'store/assetsStore/types';

import { Rewards, TotalRewards } from 'pages/vote/api/types';

export const getTotalRewards = (): Promise<TotalRewards> =>
    axios.get<TotalRewards>(`${API_REWARDS_BACKEND}total/`).then(({ data }) => data);

export enum RewardsSort {
    sdexUp = '-daily_sdex_reward',
    sdexDown = 'daily_sdex_reward',
    ammUp = '-daily_amm_reward',
    ammDown = 'daily_amm_reward',
    totalUp = '-daily_total_reward',
    totalDown = 'daily_total_reward',
}

export const getRewards = (sort: RewardsSort): Promise<Rewards[]> =>
    axios
        .get<ListResponse<Rewards>>(`${API_REWARDS_BACKEND}?ordering=${sort}&page=1&page_size=200`)
        .then(({ data }) => data.results);
