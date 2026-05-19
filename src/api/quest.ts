import { Memo, MemoType, Operation, Transaction } from '@stellar/stellar-sdk';
import axios from 'axios';

import { getRewardQuestUrl } from 'helpers/url';

import { StellarService } from 'services/globalServices';

import { ChallengeResponse, ListResponse, QuestTaskStatus } from 'types/quest';

export const getQuestStatus = (accountId: string): Promise<QuestTaskStatus[]> =>
    axios
        .get<ListResponse<QuestTaskStatus>>(
            `${getRewardQuestUrl()}participant/${accountId}/status/`,
        )
        .then(({ data }) => data.results)
        .catch(() => null);

export const getChallenge = (
    accountId: string,
): Promise<Transaction<Memo<MemoType>, Operation[]>> =>
    axios
        .get<ChallengeResponse>(`${getRewardQuestUrl()}confirm-participation?account=${accountId}`)
        .then(
            ({ data }) =>
                StellarService.tx.buildTxFromXdr(data.transaction) as Transaction<
                    Memo<MemoType>,
                    Operation[]
                >,
        );

export const sendSignedChallenge = (xdr: string) => {
    const body = JSON.stringify({ transaction: xdr });
    const headers = { 'Content-Type': 'application/json' };
    return axios
        .post(`${getRewardQuestUrl()}confirm-participation/`, body, { headers })
        .then(({ data }) => data)
        .catch(e => {
            const errorText = e.response?.data
                ? Object.values(e.response?.data).join(' ')
                : 'Something went wrong.';
            throw new Error(errorText);
        });
};
