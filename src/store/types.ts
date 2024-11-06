import * as React from 'react';

import { AssetsStore } from './assetsStore/types';
import { AuthStore } from './authStore/types';

export type ActionSimpleResult = {
    type: string;
    payload?: unknown;
};

export type ActionAsyncResult = (dispatch: React.Dispatch<ActionResult>, state?: any) => void;

export type ActionResult = ActionSimpleResult | ActionAsyncResult;

export type Action = (unknown) => ActionResult;

export interface State {
    authStore: AuthStore;
    assetsStore: AssetsStore;
}

export interface ContextProps {
    state: State;
    dispatch: React.Dispatch<Action>;
}
