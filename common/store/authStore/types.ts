import { AppMetadata } from '@walletconnect/types';
import AccountService from '../../services/account.service';

export interface AuthStore {
    isLogged: boolean;
    loginType: LoginTypes | null;
    account: AccountService | null;
    isLoginPending: boolean;
    isUnfundedAccount: boolean;
    loginErrorText: string;
    federationAddress: string;
    isFederationPending: boolean;
    metadata: AppMetadata | null;
}

export enum LoginTypes {
    secret = 'secret',
    walletConnect = 'wallet-connect',
    public = 'public',
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
}
