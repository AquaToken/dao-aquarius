import { ProposalSimple } from '../../api/types';

export type ProposalStore = {
    isLoading: boolean;
    errorLoading: boolean;
    proposals: ProposalSimple[];
};

export type ListResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

export enum PROPOSAL_ACTIONS {
    GET_PROPOSAL_START = 'GET_PROPOSAL_START',
    GET_PROPOSAL_SUCCESS = 'GET_PROPOSAL_SUCCESS',
    GET_PROPOSAL_FAIL = 'GET_PROPOSAL_FAIL',
}
