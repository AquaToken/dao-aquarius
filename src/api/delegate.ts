// https://api-delegation.aqua.network/api/delegation/stats/?format=json
//api-delegation.aqua.network/api/delegation/GAXL77JO7PKJ6IVO3LVZEYTMRN2ZG5A5N7ZQXLCR2RORTAKE4NAJQBAX/distribution?format=json

import axios from 'axios';

import { Delegatee, DelegateeVote, MyDelegatees } from 'types/delegate';

import { getMarketsMap } from 'pages/vote/api/api';
import { MarketKey } from 'pages/vote/api/types';

const API_URL = 'https://api-delegation.aqua.network/api/delegation/';

export const getDelegatees = (): Promise<Delegatee[]> =>
    axios
        .get<Delegatee[]>(`${API_URL}stats/`)
        .then(({ data }) =>
            data.sort(
                (a, b) => +b.is_recommended - +a.is_recommended || +b.managed_ice - +a.managed_ice,
            ),
        );

export const getDelegateeVotes = async (
    accountId: string,
): Promise<(DelegateeVote & MarketKey)[]> => {
    const votes = await axios
        .get<DelegateeVote[]>(`${API_URL}${accountId}/distribution`)
        .then(({ data }) => data);

    const markets = await getMarketsMap(votes.map(item => item.market_key));

    return votes.map(item => ({ ...item, ...markets.get(item.market_key) }));
};

export const getMyDelegatees = (accountId: string): Promise<MyDelegatees[]> =>
    axios.get<MyDelegatees[]>(`${API_URL}${accountId}/delegation/`).then(({ data }) => data);
