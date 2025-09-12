import axios from 'axios';

import { convertNativePriceToToken, processPools } from 'api/amm';

import { getAmmAquaUrl } from 'helpers/url';

import { ListResponse, Pool, PoolProcessed } from 'types/amm';
import { Incentive, IncentiveProcessed } from 'types/incentives';

export const getPoolsWithIncentives = (): Promise<PoolProcessed[]> => {
    const baseUrl = getAmmAquaUrl();

    return axios
        .get<ListResponse<Pool>>(`${baseUrl}/pools/?gauge_rewards=true`)
        .then(res => processPools(res.data.items));
};

export const getIncentives = async (isActive = true): Promise<IncentiveProcessed[]> => {
    const baseUrl = getAmmAquaUrl();

    const { data } = await axios.get<ListResponse<Incentive>>(
        `${baseUrl}/pool-rewards/custom/?active=${isActive}`,
    );

    const pools = await processPools(data.items.map(({ pool }) => pool));

    return data.items.map((incentive, index) => ({
        ...incentive,
        pool: pools[index],
        tokenInstance: convertNativePriceToToken(incentive.token),
    }));
};
