import axios from 'axios';
import { AccountEligibility, AirdropStats } from './types';

const AirdropApi = 'https://airdrop2-checker-api.aqua.network/api/snapshot/';

export const getAirdropStats = (): Promise<AirdropStats> => {
    return axios.get<AirdropStats>(`${AirdropApi}stats/`).then(({ data }) => data);
};

export const getAccountEligibility = (accountId): Promise<AccountEligibility> => {
    return axios.get<AccountEligibility>(`${AirdropApi}${accountId}/`).then(({ data }) => data);
};
