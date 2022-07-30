import axios from 'axios';
import { Distribution, ListResponse } from './types';

const apiUrl = 'https://ice-distributor.aqua.network/api/accounts/';

export const getDistributionForAccount = (accountId: string): Promise<Distribution[]> => {
    return axios
        .get<ListResponse<Distribution>>(`${apiUrl}${accountId}/distributions/?limit=200`)
        .then((result) => result.data.results);
};
