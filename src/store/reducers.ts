import { logger } from './middlewares';
import authStates from './authStore';
import { ActionSimpleResult, State } from './types';
import assetStore from './assetsStore';

export const initialState: State = {
    authStore: authStates.initialState,
    assetsStore: assetStore.initialState,
};

export default function mainReducer(state: State, action: ActionSimpleResult): State {
    const { authStore, assetsStore } = state;

    const currentState: State = {
        authStore: authStates.reducer(authStore, action),
        assetsStore: assetStore.reducer(assetsStore, action),
    };

    logger(action, state, currentState);

    return currentState;
}
