import { AUTH_ACTIONS, LoginTypes } from './types';
import { Dispatch } from 'react';
import { SignClientTypes } from '@walletconnect/types';
import AccountService from '../../common/services/account.service';
import AccountRecord from '@stellar/stellar-sdk';
import { StellarService } from '../../common/services/globalServices';
import { ActionAsyncResult, ActionResult, ActionSimpleResult } from '../types';

export function login(
    pubKey: string,
    loginType: LoginTypes,
    metadata?: SignClientTypes.Metadata,
    topic?: string,
): ActionAsyncResult {
    return (dispatch: Dispatch<ActionResult>): void => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START, payload: { topic } });

        StellarService.loadAccount(pubKey)
            .then((account) => {
                const wrappedAccount = new AccountService(account, loginType);
                dispatch({
                    type: AUTH_ACTIONS.LOGIN_SUCCESS,
                    payload: {
                        account: wrappedAccount,
                        loginType,
                        metadata,
                        topic,
                    },
                });
            })
            .catch((e) => {
                dispatch({ type: AUTH_ACTIONS.LOGIN_FAIL, payload: { errorText: e.message } });
            });
    };
}

export function clearLoginError(): ActionSimpleResult {
    return { type: AUTH_ACTIONS.CLEAR_LOGIN_ERROR };
}

export function logout(): ActionSimpleResult {
    return { type: AUTH_ACTIONS.LOGOUT };
}

export function resolveFederation(homeDomain: string, accountId: string): ActionAsyncResult {
    return (dispatch: Dispatch<ActionResult>): void => {
        dispatch({ type: AUTH_ACTIONS.FEDERATION_RESOLVE_START });

        StellarService.resolveFederation(homeDomain, accountId)
            .then((federation) => {
                dispatch({
                    type: AUTH_ACTIONS.FEDERATION_RESOLVE_SUCCESS,
                    payload: { federation },
                });
            })
            .catch(() => {
                dispatch({ type: AUTH_ACTIONS.FEDERATION_RESOLVE_FAIL });
            });
    };
}

export function updateAccount(
    account: typeof AccountRecord,
    authType: LoginTypes,
): ActionSimpleResult {
    const wrappedAccount = new AccountService(account, authType);
    return { type: AUTH_ACTIONS.UPDATE_ACCOUNT, payload: { account: wrappedAccount } };
}

export function enableRedirect(redirectURL: string): ActionSimpleResult {
    return { type: AUTH_ACTIONS.ENABLE_REDIRECT, payload: { redirectURL } };
}

export function disableRedirect(): ActionSimpleResult {
    return { type: AUTH_ACTIONS.DISABLE_REDIRECT };
}

export function addAuthCallback(callback: void): ActionSimpleResult {
    return { type: AUTH_ACTIONS.ADD_AUTH_CALLBACK, payload: { callback } };
}

export function removeAuthCallback(): ActionSimpleResult {
    return { type: AUTH_ACTIONS.REMOVE_AUTH_CALLBACK };
}
