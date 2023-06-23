import axios from 'axios';
import { Rewards, TotalRewards } from '../../vote/api/types';
import { ListResponse } from '../../../store/assetsStore/types';

const rewardsApi = 'https://voting-tracker.aqua.network/api/voting-rewards-v2/';
const totalApi = 'https://voting-tracker.aqua.network/api/voting-rewards-v2-stats/';

export const getTotalRewards = (): Promise<TotalRewards> => {
    return axios.get<TotalRewards>(totalApi).then(({ data }) => {
        return data;
    });
};

export enum RewardsSort {
    sdexUp = '-daily_sdex_reward',
    sdexDown = 'daily_sdex_reward',
    ammUp = '-daily_amm_reward',
    ammDown = 'daily_amm_reward',
    totalUp = '-daily_total_reward',
    totalDown = 'daily_total_reward',
}

export const getRewards = (sort): Promise<Rewards[]> => {
    return axios
        .get<ListResponse<Rewards>>(`${rewardsApi}?ordering=${sort}&page=1&page_size=200`)
        .then(({ data }) => data.results);
};
