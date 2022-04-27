import axios, { AxiosResponse } from 'axios';
import { Proposal, ProposalCreateOptions, ProposalSimple, Vote } from './types';
import { ListResponse } from '../store/types';

export const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

const apiURL = 'https://governance-api.aqua.network/api';

export enum PROPOSAL_FILTER {
    ALL = 'all',
    ACTIVE = 'active',
    DISCUSSION = 'discussion',
    CLOSED = 'closed',
    MY = 'my',
}

export const getProposalsRequest = (
    filter: PROPOSAL_FILTER,
    pubkey: string,
): Promise<AxiosResponse<ListResponse<ProposalSimple>>> => {
    const params = new URLSearchParams();
    if (filter === PROPOSAL_FILTER.ACTIVE) {
        params.append('status', 'voting');
    } else if (filter === PROPOSAL_FILTER.CLOSED) {
        params.append('status', 'voted');
    } else if (filter === PROPOSAL_FILTER.DISCUSSION) {
        params.append('status', 'discussion');
    } else if (filter === PROPOSAL_FILTER.MY) {
        params.append('owner_public_key', pubkey);
    }

    return axios.get(`${apiURL}/proposal/`, { params });
};

export const getProposalRequest = (id: string): Promise<AxiosResponse<Proposal>> => {
    return axios.get(`${apiURL}/proposal/${id}/`);
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

export const createProposal = (proposal: ProposalCreateOptions): Promise<Proposal> => {
    return axios.post<Proposal>(`${apiURL}/proposal/`, proposal).then(({ data }) => data);
};

export const editProposal = (
    proposal: Partial<ProposalCreateOptions>,
    id: number,
): Promise<Proposal> => {
    return axios.patch<Proposal>(`${apiURL}/proposal/${id}/`, proposal).then(({ data }) => data);
};

export const publishProposal = (
    proposal: Partial<ProposalCreateOptions>,
    id: number,
): Promise<Proposal> => {
    return axios
        .post<Proposal>(`${apiURL}/proposal/${id}/submit/`, proposal)
        .then(({ data }) => data);
};

export const checkProposalStatus = (hash: number): Promise<Proposal> => {
    return axios
        .post<Proposal>(`${apiURL}/proposal/${hash}/check_payment/`)
        .then(({ data }) => data);
};
