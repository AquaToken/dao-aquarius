import { SignClientTypes } from '@walletconnect/types';

import { AUTH_ACTIONS, AuthStore, LoginTypes } from './types';

import AccountService from '../../common/services/account.service';
import { ActionSimpleResult } from '../types';

export const initialState: AuthStore = {
    isLogged: false,
    isLoginPending: false,
    loginPendingTopic: undefined,
    isUnfundedAccount: false,
    loginErrorText: '',
    loginType: null,
    account: null,
    federationAddress: '',
    isFederationPending: false,
    metadata: null,
    redirectURL: undefined,
    callback: undefined,
};

export default function authStore(state = initialState, action: ActionSimpleResult): AuthStore {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN_START: {
            const { topic } = action.payload as {
                topic?: string;
            };
            return { ...state, isLoginPending: true, loginErrorText: '', loginPendingTopic: topic };
        }
        case AUTH_ACTIONS.LOGIN_SUCCESS: {
            const { account, loginType, metadata, topic } = action.payload as {
                account: AccountService;
                loginType: LoginTypes;
                metadata?: SignClientTypes.Metadata;
                topic?: string;
            };
            if (topic && state.loginPendingTopic !== topic) {
                return {
                    ...state,
                };
            }
            return {
                ...state,
                isLoginPending: false,
                isLogged: true,
                account,
                loginType,
                metadata: metadata ?? null,
            };
        }
        case AUTH_ACTIONS.LOGIN_FAIL: {
            const { errorText } = action.payload as {
                errorText: string;
            };
            return {
                ...state,
                isLoginPending: false,
                loginErrorText: errorText,
            };
        }
        case AUTH_ACTIONS.CLEAR_LOGIN_ERROR: {
            return { ...state, loginErrorText: '' };
        }
        case AUTH_ACTIONS.FEDERATION_RESOLVE_START: {
            return {
                ...state,
                isFederationPending: true,
            };
        }
        case AUTH_ACTIONS.FEDERATION_RESOLVE_SUCCESS: {
            const { federation } = action.payload as {
                federation: string;
            };
            return {
                ...state,
                isFederationPending: false,
                federationAddress: federation,
            };
        }
        case AUTH_ACTIONS.FEDERATION_RESOLVE_FAIL: {
            return {
                ...state,
                isFederationPending: false,
            };
        }
        case AUTH_ACTIONS.UPDATE_ACCOUNT: {
            const { account } = action.payload as {
                account: AccountService;
            };
            return {
                ...state,
                account,
            };
        }
        case AUTH_ACTIONS.LOGOUT: {
            return {
                ...initialState,
            };
        }
        case AUTH_ACTIONS.ENABLE_REDIRECT: {
            const { redirectURL } = action.payload as {
                redirectURL: string;
            };
            return {
                ...state,
                redirectURL,
            };
        }
        case AUTH_ACTIONS.DISABLE_REDIRECT: {
            return {
                ...state,
                redirectURL: undefined,
            };
        }
        case AUTH_ACTIONS.ADD_AUTH_CALLBACK: {
            const { callback } = action.payload as {
                callback: void;
            };
            return {
                ...state,
                callback,
            };
        }
        case AUTH_ACTIONS.REMOVE_AUTH_CALLBACK: {
            return {
                ...state,
                callback: undefined,
            };
        }
        default: {
            return state;
        }
    }
}
