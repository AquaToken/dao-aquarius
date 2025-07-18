import * as WalletConnectTypes from '@walletconnect/types';

import AccountService from 'services/account.service';

export interface AuthStore {
    isLogged: boolean;
    loginType: LoginTypes | null;
    account: AccountService | null;
    isLoginPending: boolean;
    isUnfundedAccount: boolean;
    loginErrorText: string;
    federationAddress: string;
    isFederationPending: boolean;
    metadata: WalletConnectTypes.SignClientTypes.Metadata | null;
    loginPendingTopic?: string;
    redirectURL?: string;
    callback?: () => void;
}

export interface LoginArgs {
    pubKey: string;
    loginType: LoginTypes;
    metadata?: WalletConnectTypes.SignClientTypes.Metadata;
    topic?: string;
    walletKitId?: string;
}

export interface SavedAuthData {
    pubKey: string;
    loginType: LoginTypes;
    walletKitId: string;
}

export enum LoginTypes {
    secret = 'secret',
    walletConnect = 'wallet-connect',
    public = 'public',
    ledger = 'ledger',
    lobstr = 'lobstr',
    walletKit = 'wallet-kit',
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
