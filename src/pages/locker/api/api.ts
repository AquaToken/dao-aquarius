import axios from 'axios';
import { Distribution, ListResponse, Statistics } from './types';

const apiUrl = 'https://ice-distributor.aqua.network/api';

const LIMIT = 200;

export const getDistributionForAccount = (accountId: string): Promise<Distribution[]> => {
    return axios
        .get<ListResponse<Distribution>>(
            `${apiUrl}/accounts/${accountId}/distributions/?limit=${LIMIT}`,
        )
        .then((result) => {
            if (result.data.next) {
                return getNextDistributions(result.data.results, result.data.next);
            }
            return result.data.results;
        });
};

const getNextDistributions = (records: Distribution[], url: string): Promise<Distribution[]> => {
    return axios.get<ListResponse<Distribution>>(url).then((result) => {
        if (result.data.next) {
            return getNextDistributions([...records, ...result.data.results], result.data.next);
        }

        return [...records, ...result.data.results];
    });
};

export const getStatistics = () => {
    return axios.get<Statistics>(`${apiUrl}/distributions/stats/`).then(({ data }) => data);
};
