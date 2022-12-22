import * as React from 'react';
import { createContext, useContext, useReducer, useCallback } from 'react';
import mainReducer, { initialState } from './reducers';
import { actionHandler } from './middlewares';
import { ContextProps } from './types';

export const GlobalStore = createContext({} as ContextProps);

export const useGlobalStore = (): ContextProps => useContext(GlobalStore);

export default function Provider({ children }: { children: React.ReactNode }): JSX.Element {
    const [state, dispatchBase] = useReducer(mainReducer, initialState);
    const dispatch = useCallback(actionHandler(dispatchBase, state), []);

    return <GlobalStore.Provider value={{ state, dispatch }}>{children}</GlobalStore.Provider>;
}
