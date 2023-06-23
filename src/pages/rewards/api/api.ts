import axios from 'axios';
import { Rewards, TotalRewards } from '../../vote/api/types';
import { ListResponse } from '../../../store/assetsStore/types';

const rewardsApi = 'https://reward-api.aqua.network/api/rewards/';

const rewardsApiV2 = 'https://voting-tracker.aqua.network/api/voting-rewards-v2/';
const totalApiV2 = 'https://voting-tracker.aqua.network/api/voting-rewards-v2-stats/';

export const getTotalRewards = (isV2?: boolean): Promise<TotalRewards> => {
    return axios.get<TotalRewards>(isV2 ? totalApiV2 : `${rewardsApi}total/`).then(({ data }) => {
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

export const getRewards = (sort, isV2?: boolean): Promise<Rewards[]> => {
    return axios
        .get<ListResponse<Rewards>>(
            isV2 ? rewardsApiV2 : `${rewardsApi}?ordering=${sort}&page=1&page_size=200`,
        )
        .then(({ data }) => data.results);
};
