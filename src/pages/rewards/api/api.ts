import axios from 'axios';

import { ListResponse } from 'store/assetsStore/types';

import { Rewards, TotalRewards } from '../../vote/api/types';

const rewardsApi = 'https://reward-api.aqua.network/api/rewards/';

export const getTotalRewards = (): Promise<TotalRewards> =>
    axios.get<TotalRewards>(`${rewardsApi}total/`).then(({ data }) => data);

export enum RewardsSort {
    sdexUp = '-daily_sdex_reward',
    sdexDown = 'daily_sdex_reward',
    ammUp = '-daily_amm_reward',
    ammDown = 'daily_amm_reward',
    totalUp = '-daily_total_reward',
    totalDown = 'daily_total_reward',
}

export const getRewards = (sort): Promise<Rewards[]> =>
    axios
        .get<ListResponse<Rewards>>(`${rewardsApi}?ordering=${sort}&page=1&page_size=200`)
        .then(({ data }) => data.results);
