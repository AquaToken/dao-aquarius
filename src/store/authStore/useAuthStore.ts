import * as actions from './actions';
import bindActions from '../bindActions';
import { AuthStore, LoginTypes } from './types';
import { SignClientTypes } from '@walletconnect/types';
import AccountRecord from 'stellar-sdk';
import { ActionAsyncResult, ActionSimpleResult } from '../types';
import { useGlobalStore } from '../index';

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
        },
        dispatch,
    ) as unknown as AuthActions;

    return { ...authStore, ...authActions };
};

export default useAuthStore;
