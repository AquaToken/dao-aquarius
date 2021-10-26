import { logger } from '../../common/store/middlewares';
import authStates from '../../common/store/authStore';
import { State } from './types';
import { ActionSimpleResult } from '../../common/store/types';

export const initialState: State = {
    authStore: authStates.initialState,
};

export default function mainReducer(state: State, action: ActionSimpleResult): State {
    const { authStore } = state;

    const currentState: State = {
        authStore: authStates.reducer(authStore, action),
    };

    logger(action, state, currentState);

    return currentState;
}
