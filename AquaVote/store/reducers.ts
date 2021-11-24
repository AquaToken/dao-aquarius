import { logger } from '../../common/store/middlewares';
import authStates from '../../common/store/authStore';
import { State } from './types';
import { ActionSimpleResult } from '../../common/store/types';
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
