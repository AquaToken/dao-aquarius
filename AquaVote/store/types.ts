import { AuthStore } from '../../common/store/authStore/types';
import { Action } from '../../common/store/types';
import { AssetsStore } from './assetsStore/types';
import * as React from 'react';

export interface State {
    authStore: AuthStore;
    assetsStore: AssetsStore;
}

export interface ContextProps {
    state: State;
    dispatch: React.Dispatch<Action>;
}
