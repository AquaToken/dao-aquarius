import axios, { AxiosResponse } from 'axios';

import { ListResponse } from 'store/assetsStore/types';

import { TransactionRecord } from 'types/stellar';

import { Proposal, ProposalCreateOptions, ProposalSimple, Vote } from './types';

export const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

const apiURL = 'https://governance-api.aqua.network/api';

export enum PROPOSAL_FILTER {
    ALL = 'all',
    ACTIVE = 'active',
    DISCUSSION = 'discussion',
    CLOSED = 'closed',
    MY = 'my',
    MY_VOTES = 'my_votes',
    HISTORY = 'history',
}

export const getProposalsRequest = async ({
    filter,
    pubkey,
    page,
    pageSize,
}: {
    filter: PROPOSAL_FILTER;
    pubkey?: string;
    page: number;
    pageSize: number;
}): Promise<{
    proposals: ListResponse<ProposalSimple>;
    filter: PROPOSAL_FILTER;
    total: number;
}> => {
    const params = new URLSearchParams();
    params.append('limit', pageSize.toString());
    params.append('page', page.toString());
    params.append('ordering', '-created_at');
    if (filter === PROPOSAL_FILTER.ACTIVE) {
        params.append('status', 'voting');
    } else if (filter === PROPOSAL_FILTER.CLOSED) {
        params.append('status', 'voted');
    } else if (filter === PROPOSAL_FILTER.DISCUSSION) {
        params.append('status', 'discussion');
    } else if (filter === PROPOSAL_FILTER.MY) {
        params.append('owner_public_key', pubkey);
    } else if (filter === PROPOSAL_FILTER.MY_VOTES) {
        params.append('vote_owner_public_key', pubkey);
        params.append('active', 'true');
    } else if (filter === PROPOSAL_FILTER.HISTORY) {
        params.append('vote_owner_public_key', pubkey);
    }

    const { data } = await axios.get<ListResponse<ProposalSimple>>(`${apiURL}/proposal/`, {
        params,
    });

    return { proposals: data, filter, total: data.count };
};

export const getActiveProposalsCount = (): Promise<{ active: number; discussion: number }> =>
    Promise.all([
        getProposalsRequest({ filter: PROPOSAL_FILTER.ACTIVE, pageSize: 1000, page: 1 }),
        getProposalsRequest({ filter: PROPOSAL_FILTER.DISCUSSION, pageSize: 1000, page: 1 }),
    ]).then(([active, discussion]) => ({
        active: active.proposals.count,
        discussion: discussion.proposals.count,
    }));

export const getProposalRequest = (id: string): Promise<AxiosResponse<Proposal>> =>
    axios.get(`${apiURL}/proposal/${id}/`);

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
): Promise<AxiosResponse<ListResponse<Vote>>> =>
    axios.get(
        `${apiURL}/votes-for-proposal/?proposal_id=${id}&limit=${pageSize}&page=${page}&ordering=${
            isReverse ? '' : '-'
        }${VotesOrdering[ordering]}`,
    );

export const getVoteTxHash = (url: string): Promise<string> =>
    axios
        .get<{ _embedded: { records: TransactionRecord[] } }>(url)
        .then(result => result?.data?._embedded?.records?.[0]?.hash);

export const createProposal = (proposal: ProposalCreateOptions): Promise<Proposal> =>
    axios.post<Proposal>(`${apiURL}/proposal/`, proposal).then(({ data }) => data);

export const editProposal = (
    proposal: {
        new_title: string;
        new_text: string;
        new_transaction_hash: string;
        new_envelope_xdr: string;
    },
    id: number,
): Promise<Proposal> =>
    axios.patch<Proposal>(`${apiURL}/proposal/${id}/`, proposal).then(({ data }) => data);

export const publishProposal = (
    proposal: {
        new_start_at: string;
        new_end_at: string;
        new_transaction_hash: string;
        new_envelope_xdr: string;
    },
    id: number,
): Promise<Proposal> =>
    axios.post<Proposal>(`${apiURL}/proposal/${id}/submit/`, proposal).then(({ data }) => data);

export const checkProposalStatus = (hash: number): Promise<Proposal> =>
    axios.post<Proposal>(`${apiURL}/proposal/${hash}/check_payment/`).then(({ data }) => data);
