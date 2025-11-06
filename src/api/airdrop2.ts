import axios from 'axios';

import { API_AIRDROP_2 } from 'constants/api';

import { AccountEligibility, AirdropStats } from 'types/airdrop2';

export const getAirdropStats = (): Promise<AirdropStats> =>
    axios.get<AirdropStats>(`${API_AIRDROP_2}stats/`).then(({ data }) => data);

export const getAccountEligibility = (accountId): Promise<AccountEligibility> =>
    axios.get<AccountEligibility>(`${API_AIRDROP_2}${accountId}/`).then(({ data }) => data);
