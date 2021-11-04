import { logger } from '../../common/store/middlewares';
import authStates from '../../common/store/authStore';
import proposalStore from './proposalsStore';
import { State } from './types';
import { ActionSimpleResult } from '../../common/store/types';

export const initialState: State = {
    authStore: authStates.initialState,
    proposalsStore: proposalStore.initialState,
};

export default function mainReducer(state: State, action: ActionSimpleResult): State {
    const { authStore, proposalsStore } = state;

    const currentState: State = {
        authStore: authStates.reducer(authStore, action),
        proposalsStore: proposalStore.reducer(proposalsStore, action),
    };

    logger(action, state, currentState);

    return currentState;
}
