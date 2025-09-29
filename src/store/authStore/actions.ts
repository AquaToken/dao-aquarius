import AccountRecord from '@stellar/stellar-sdk';
import { Dispatch } from 'react';

import { clearSavedAuthData, saveToLS } from 'store/authStore/auth-helpers';

import AccountService from 'services/account.service';
import { StellarService } from 'services/globalServices';
import { getFederation } from 'services/stellar/utils/resolvers';

import { AUTH_ACTIONS, LoginArgs, LoginTypes } from './types';

import { ActionAsyncResult, ActionResult, ActionSimpleResult } from '../types';

export function login({
    pubKey,
    loginType,
    metadata,
    topic,
    walletKitId,
    bipPath,
}: LoginArgs): ActionAsyncResult {
    return (dispatch: Dispatch<ActionResult>): void => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START, payload: { topic } });

        StellarService.account
            .loadAccount(pubKey)
            .then(account => {
                const wrappedAccount = new AccountService(account, loginType);
                saveToLS(pubKey, loginType, walletKitId, bipPath);
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
            .catch(e => {
                dispatch({ type: AUTH_ACTIONS.LOGIN_FAIL, payload: { errorText: e.message } });
            });
    };
}

export function clearLoginError(): ActionSimpleResult {
    return { type: AUTH_ACTIONS.CLEAR_LOGIN_ERROR };
}

export function logout(): ActionSimpleResult {
    clearSavedAuthData();
    return { type: AUTH_ACTIONS.LOGOUT };
}

export function resolveFederation(homeDomain: string, accountId: string): ActionAsyncResult {
    return (dispatch: Dispatch<ActionResult>): void => {
        dispatch({ type: AUTH_ACTIONS.FEDERATION_RESOLVE_START });

        getFederation(homeDomain, accountId)
            .then(federation => {
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
