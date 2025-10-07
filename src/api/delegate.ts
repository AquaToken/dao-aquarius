import axios from 'axios';

import { API_DELEGATION_URL } from 'constants/api';
import { ICE_DELEGATION_MAP } from 'constants/assets';

import { getAssetString } from 'helpers/assets';

import { Delegatee, DelegateeVote, MyDelegatees } from 'types/delegate';
import { ClassicToken } from 'types/token';

import { getMarketsMap } from 'pages/vote/api/api';
import { MarketKey } from 'pages/vote/api/types';
import { UP_ICE } from 'pages/vote/components/MainPage/MainPage';

const API_URL_V1 = `${API_DELEGATION_URL}`;
const API_URL_V2 = `${API_DELEGATION_URL}v2/`;

export const getDelegatees = (): Promise<Delegatee[]> =>
    axios
        .get<Delegatee[]>(`${API_URL_V2}stats/`)
        .then(({ data }) =>
            data.sort(
                (a, b) =>
                    +b.is_recommended - +a.is_recommended ||
                    +b.managed_ice?.[getAssetString(UP_ICE)] -
                        +a.managed_ice?.[getAssetString(UP_ICE)],
            ),
        );

export const getDelegateeVotes = async (
    accountId: string,
    token: ClassicToken,
): Promise<(DelegateeVote & MarketKey)[]> => {
    const votes = await axios
        .get<DelegateeVote[]>(
            `${API_URL_V2}${accountId}/distribution?asset=${ICE_DELEGATION_MAP.get(
                getAssetString(token),
            )}`,
        )
        .then(({ data }) => data);

    const markets = await getMarketsMap(votes.map(item => item.market_key));

    return votes.map(item => ({ ...item, ...markets.get(item.market_key) }));
};

function combine(data: MyDelegatees[]): Partial<Delegatee>[] {
    const map = new Map<string, Partial<Delegatee>>();

    for (const item of data) {
        if (!map.has(item.account)) {
            map.set(item.account, {
                account: item.account,
                managed_ice: {},
                delegated: {},
            });
        }

        const acc = map.get(item.account)!;
        acc.managed_ice[item.asset] = +item.managed_ice;
        acc.delegated[item.asset] = +item.delegated;
    }

    return Array.from(map.values());
}

export const getMyDelegatees = (accountId: string): Promise<Partial<Delegatee>[]> =>
    axios
        .get<MyDelegatees[]>(`${API_URL_V2}${accountId}/delegation/`)
        .then(({ data }) => combine(data));

type CreateDelegateeArgs = {
    name: string;
    account: string;
    avatar: string;
    discord: string;
    project: string;
    description: string;
    strategy: string;
    xLink: string;
};

export const createDelegatee = ({
    name,
    account,
    avatar,
    discord,
    project,
    description,
    strategy,
    xLink,
}: CreateDelegateeArgs) => {
    const body = JSON.stringify({
        name,
        description,
        voting_strategy: strategy,
        account,
        discord_handle: discord,
        twitter_link: xLink,
        affiliate_project: project,
        image: avatar,
    });

    const headers = { 'Content-Type': 'application/json' };

    return axios.post(`${API_URL_V1}application/`, body, { headers });
};
