import { AUTH_ACTIONS, LoginTypes } from './types';
import { Dispatch } from 'react';
import axios, { AxiosResponse } from 'axios';
import { AppMetadata } from '@walletconnect/types';
import AccountService from '../../services/account.service';
import AccountRecord from 'stellar-sdk';
import { StellarService } from '../../services/globalServices';
import { ActionAsyncResult, ActionResult, ActionSimpleResult } from '../types';

export function login(
    pubKey: string,
    loginType: LoginTypes,
    metadata?: AppMetadata,
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

        StellarService.resolveFederationServer(homeDomain)
            .then((server) => {
                const params = new URLSearchParams();
                params.append('q', accountId);
                params.append('type', 'id');

                return axios.get(server, { params });
            })
            .then((result: AxiosResponse<{ stellar_address: string }>) => {
                dispatch({
                    type: AUTH_ACTIONS.FEDERATION_RESOLVE_SUCCESS,
                    payload: { federation: result.data.stellar_address },
                });
            })
            .catch(() => {
                dispatch({ type: AUTH_ACTIONS.FEDERATION_RESOLVE_FAIL });
            });
    };
}

export function updateAccount(account: typeof AccountRecord): ActionSimpleResult {
    return { type: AUTH_ACTIONS.UPDATE_ACCOUNT, payload: { account: new AccountService(account) } };
}
