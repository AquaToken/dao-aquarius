import { SignClientTypes } from '@walletconnect/types';
import AccountService from '../../common/services/account.service';

export interface AuthStore {
    isLogged: boolean;
    loginType: LoginTypes | null;
    account: AccountService | null;
    isLoginPending: boolean;
    isUnfundedAccount: boolean;
    loginErrorText: string;
    federationAddress: string;
    isFederationPending: boolean;
    metadata: SignClientTypes.Metadata | null;
    loginPendingTopic?: string;
    redirectURL?: string;
    callback?: () => void;
}

export enum LoginTypes {
    secret = 'secret',
    walletConnect = 'wallet-connect',
    public = 'public',
    ledger = 'ledger',
}

export enum AUTH_ACTIONS {
    LOGIN_START = 'LOGIN_START',
    LOGIN_SUCCESS = 'LOGIN_SUCCESS',
    LOGIN_FAIL = 'LOGIN_FAIL',
    CLEAR_LOGIN_ERROR = 'CLEAR_LOGIN_ERROR',
    LOGOUT = 'LOGOUT',
    FEDERATION_RESOLVE_START = 'FEDERATION_RESOLVE_START',
    FEDERATION_RESOLVE_SUCCESS = 'FEDERATION_RESOLVE_SUCCESS',
    FEDERATION_RESOLVE_FAIL = 'FEDERATION_RESOLVE_FAIL',
    UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
    ENABLE_REDIRECT = 'ENABLE_REDIRECT',
    DISABLE_REDIRECT = 'DISABLE_REDIRECT',
    ADD_AUTH_CALLBACK = 'ADD_AUTH_CALLBACK',
    REMOVE_AUTH_CALLBACK = 'REMOVE_AUTH_CALLBACK',
}
