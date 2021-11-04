import { PROPOSAL_ACTIONS, ProposalStore } from './types';
import { ActionSimpleResult } from '../../../common/store/types';
import { ProposalSimple } from '../../api/types';

export const initialState: ProposalStore = {
    isLoading: false,
    errorLoading: false,
    proposals: [],
};

export default function proposalStore(
    state = initialState,
    action: ActionSimpleResult,
): ProposalStore {
    switch (action.type) {
        case PROPOSAL_ACTIONS.GET_PROPOSAL_START: {
            return {
                ...state,
                isLoading: true,
            };
        }
        case PROPOSAL_ACTIONS.GET_PROPOSAL_SUCCESS: {
            const { proposals } = action.payload as { proposals: ProposalSimple[] };
            return {
                ...state,
                isLoading: false,
                proposals: proposals,
            };
        }
        case PROPOSAL_ACTIONS.GET_PROPOSAL_FAIL: {
            return {
                ...state,
                isLoading: false,
                errorLoading: true,
            };
        }
        default: {
            return state;
        }
    }
}
