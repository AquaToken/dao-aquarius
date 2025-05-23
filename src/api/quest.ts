// https://reward-api.aqua.network/api/quest/participant/GB7FLFH2GJ7NRJEOI377AQIMTO67PJC3REC7QROARUU7MTJHERN2YBCL/status/
// https://reward-api.aqua.network/api/quest/confirm-participation/

import { Memo, MemoType, Operation, Transaction } from '@stellar/stellar-sdk';
import axios from 'axios';

import { StellarService } from 'services/globalServices';

import { ChallengeResponse, ListResponse, QuestTaskStatus } from 'types/quest';

const API_URL = 'https://reward-api.aqua.network/api/quest/';

export const getQuestStatus = (accountId: string): Promise<QuestTaskStatus[]> =>
    axios
        .get<ListResponse<QuestTaskStatus>>(`${API_URL}participant/${accountId}/status/`)
        .then(({ data }) => data.results)
        .catch(() => null);

export const getChallenge = (
    accountId: string,
): Promise<Transaction<Memo<MemoType>, Operation[]>> =>
    axios
        .get<ChallengeResponse>(`${API_URL}confirm-participation?account=${accountId}`)
        .then(
            ({ data }) =>
                StellarService.buildTxFromXdr(data.transaction) as Transaction<
                    Memo<MemoType>,
                    Operation[]
                >,
        );

export const sendSignedChallenge = (xdr: string) => {
    const body = JSON.stringify({ transaction: xdr });
    const headers = { 'Content-Type': 'application/json' };
    return axios
        .post(`${API_URL}confirm-participation/`, body, { headers })
        .then(({ data }) => data)
        .catch(e => {
            const errorText = e.response?.data
                ? Object.values(e.response?.data).join(' ')
                : 'Something went wrong.';
            throw new Error(errorText);
        });
};
