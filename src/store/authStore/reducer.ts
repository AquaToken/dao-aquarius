import { AUTH_ACTIONS, AuthStore, LoginTypes } from './types';
import { SignClientTypes } from '@walletconnect/types';
import AccountService from '../../common/services/account.service';
import { ActionSimpleResult } from '../../common/store/types';

export const initialState: AuthStore = {
    isLogged: false,
    isLoginPending: false,
    isUnfundedAccount: false,
    loginErrorText: '',
    loginType: null,
    account: null,
    federationAddress: '',
    isFederationPending: false,
    metadata: null,
};

export default function authStore(state = initialState, action: ActionSimpleResult): AuthStore {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN_START: {
            return { ...state, isLoginPending: true, loginErrorText: '' };
        }
        case AUTH_ACTIONS.LOGIN_SUCCESS: {
            const { account, loginType, metadata } = action.payload as {
                account: AccountService;
                loginType: LoginTypes;
                metadata?: SignClientTypes.Metadata;
            };
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
        default: {
            return state;
        }
    }
}
