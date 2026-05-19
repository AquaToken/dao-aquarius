import axios from 'axios';

import { getProfileUrl } from 'helpers/url';

import { SdexReward } from './types';

import { ListResponse } from '../../vote/api/types';

export const getSdexRewards = (accountId: string): Promise<SdexReward[]> =>
    axios
        .get<ListResponse<SdexReward>>(`${getProfileUrl()}sdex_rewards/${accountId}?limit=100`)
        .then(({ data }) => data.results.filter(({ maker_reward }) => Boolean(maker_reward)));
