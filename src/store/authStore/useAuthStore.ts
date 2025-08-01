import AccountRecord from '@stellar/stellar-sdk';

import * as actions from './actions';
import { AuthStore, LoginArgs, LoginTypes } from './types';

import bindActions from '../bindActions';
import { useGlobalStore } from '../index';
import { ActionAsyncResult, ActionSimpleResult } from '../types';

type AuthActions = {
    login: (args: LoginArgs) => ActionAsyncResult;
    logout: () => ActionSimpleResult;
    resolveFederation: (homeDomain: string, accountId: string) => ActionAsyncResult;
    updateAccount: (account: typeof AccountRecord, authType: LoginTypes) => ActionSimpleResult;
    clearLoginError: () => ActionSimpleResult;
    enableRedirect: (redirectURL: string) => ActionSimpleResult;
    disableRedirect: () => ActionSimpleResult;
    addAuthCallback: (cb: () => void) => ActionSimpleResult;
    removeAuthCallback: () => ActionSimpleResult;
};

// TODO: move to hooks
const useAuthStore = (): AuthStore & AuthActions => {
    const { state, dispatch } = useGlobalStore();

    // List props
    const { authStore } = state;

    // List Actions
    const {
        login,
        logout,
        resolveFederation,
        updateAccount,
        clearLoginError,
        enableRedirect,
        disableRedirect,
        addAuthCallback,
        removeAuthCallback,
    } = actions;

    const authActions = bindActions(
        {
            login,
            logout,
            resolveFederation,
            updateAccount,
            clearLoginError,
            enableRedirect,
            disableRedirect,
            addAuthCallback,
            removeAuthCallback,
        },
        dispatch,
    ) as unknown as AuthActions;

    return { ...authStore, ...authActions };
};

export default useAuthStore;
