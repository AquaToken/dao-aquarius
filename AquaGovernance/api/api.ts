import axios, { AxiosResponse } from 'axios';
import { ListResponse } from '../store/proposalsStore/types';
import { Proposal, ProposalSimple, Vote } from './types';

export const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

const apiURL = 'https://governance-api.aqua.network/api';

export const getProposalsRequest = (): Promise<AxiosResponse<ListResponse<ProposalSimple>>> => {
    return axios.get(`${apiURL}/proposals/`);
};

export const getProposalRequest = (id: string): Promise<AxiosResponse<Proposal>> => {
    return axios.get(`${apiURL}/proposals/${id}/`);
};

export enum VoteFields {
    account = 'account',
    solution = 'solution',
    amount = 'amount',
    date = 'date',
}

export const VotesOrdering = {
    [VoteFields.account]: 'account_issuer',
    [VoteFields.solution]: 'vote_choice',
    [VoteFields.amount]: 'amount',
    [VoteFields.date]: 'created_at',
};

export const getVotes = (
    id: string,
    pageSize: number,
    page: number,
    ordering: VoteFields,
    isReverse: boolean,
): Promise<AxiosResponse<ListResponse<Vote>>> => {
    return axios.get(
        `${apiURL}/votes-for-proposal/?proposal_id=${id}&limit=${pageSize}&page=${page}&ordering=${
            isReverse ? '' : '-'
        }${VotesOrdering[ordering]}`,
    );
};

export const getVoteTxHash = (url: string): Promise<string> => {
    return axios.get<any>(url).then((result) => result?.data?._embedded?.records?.[0]?.hash);
};
