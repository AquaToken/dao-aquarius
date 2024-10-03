import AccountRecord from '@stellar/stellar-sdk';
import { SignClientTypes } from '@walletconnect/types';

import * as actions from './actions';
import { addAuthCallback, removeAuthCallback } from './actions';
import { AuthStore, LoginTypes } from './types';

import bindActions from '../bindActions';
import { useGlobalStore } from '../index';
import { ActionAsyncResult, ActionSimpleResult } from '../types';

type AuthActions = {
    login: (
        pubKey: string,
        loginType: LoginTypes,
        metadata?: SignClientTypes.Metadata,
        topic?: string,
    ) => ActionAsyncResult;
    logout: () => ActionSimpleResult;
    resolveFederation: (homeDomain: string, accountId: string) => ActionAsyncResult;
    updateAccount: (account: typeof AccountRecord, authType: LoginTypes) => ActionSimpleResult;
    clearLoginError: () => ActionSimpleResult;
    enableRedirect: (redirectURL: string) => ActionSimpleResult;
    disableRedirect: () => ActionSimpleResult;
    addAuthCallback: (cb: () => void) => ActionSimpleResult;
    removeAuthCallback: () => ActionSimpleResult;
};

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
