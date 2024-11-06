import axios from 'axios';

import { API_LIMIT, API_URL_ICE_LOCKER } from 'constants/api';

import { AccountIceDistribution, ListResponse, IceStatistics } from 'types/api-ice-locker';

const getNextDistributions = (
    records: AccountIceDistribution[],
    url: string,
): Promise<AccountIceDistribution[]> =>
    axios.get<ListResponse<AccountIceDistribution>>(url).then(result => {
        if (result.data.next) {
            return getNextDistributions([...records, ...result.data.results], result.data.next);
        }

        return [...records, ...result.data.results];
    });

export const getDistributionForAccount = (accountId: string): Promise<AccountIceDistribution[]> =>
    axios
        .get<ListResponse<AccountIceDistribution>>(
            `${API_URL_ICE_LOCKER}/accounts/${accountId}/distributions/?limit=${API_LIMIT}`,
        )
        .then(result => {
            if (result.data.next) {
                return getNextDistributions(result.data.results, result.data.next);
            }
            return result.data.results;
        });

export const getIceStatistics = (): Promise<IceStatistics> =>
    axios.get<IceStatistics>(`${API_URL_ICE_LOCKER}/distributions/stats/`).then(({ data }) => data);
