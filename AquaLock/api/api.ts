import axios from 'axios';
import { Distribution, ListResponse, Statistics } from './types';

const apiUrl = 'https://ice-distributor.aqua.network/api';

export const getDistributionForAccount = (accountId: string): Promise<Distribution[]> => {
    return axios
        .get<ListResponse<Distribution>>(`${apiUrl}/accounts/${accountId}/distributions/?limit=200`)
        .then((result) => result.data.results);
};

export const getStatistics = () => {
    return axios.get<Statistics>(`${apiUrl}/distributions/stats/`).then(({ data }) => data);
};
