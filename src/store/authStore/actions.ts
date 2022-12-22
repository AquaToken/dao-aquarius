import { AUTH_ACTIONS, LoginTypes } from './types';
import { Dispatch } from 'react';
import { SignClientTypes } from '@walletconnect/types';
import AccountService from '../../common/services/account.service';
import AccountRecord from 'stellar-sdk';
import { StellarService } from '../../common/services/globalServices';
import { ActionAsyncResult, ActionResult, ActionSimpleResult } from '../../common/store/types';

export function login(
    pubKey: string,
    loginType: LoginTypes,
    metadata?: SignClientTypes.Metadata,
): ActionAsyncResult {
    return (dispatch: Dispatch<ActionResult>): void => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START });

        StellarService.loadAccount(pubKey)
            .then((account) => {
                const wrappedAccount = new AccountService(account, loginType);
                dispatch({
                    type: AUTH_ACTIONS.LOGIN_SUCCESS,
                    payload: {
                        account: wrappedAccount,
                        loginType,
                        metadata,
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
