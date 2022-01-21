import { Dispatch } from 'react';
import { ActionResult } from '../../../common/store/types';
import { ASSETS_ACTIONS } from './types';
import { getAssetsInfo, getAssetsRequest } from '../../api/api';
import { AssetSimple } from '../../api/types';
import { ASSET_CACHE } from './reducer';
import * as StellarSdk from 'stellar-sdk';

export function clearAssets() {
    localStorage.setItem(ASSET_CACHE, '[]');
    return { type: ASSETS_ACTIONS.CLEAR_ASSETS };
}

export function getAssets() {
    return (dispatch: Dispatch<ActionResult>): void => {
        dispatch({ type: ASSETS_ACTIONS.GET_ASSETS_START });

        getAssetsRequest()
            .then((assets) => {
                dispatch({
                    type: ASSETS_ACTIONS.GET_ASSETS_SUCCESS,
                    payload: { assets: [StellarSdk.Asset.native(), ...assets] },
                });
            })
            .catch(() => {
                dispatch({ type: ASSETS_ACTIONS.GET_ASSETS_FAIL });
            });
    };
}

export const getAssetString = (asset) => `${asset.code}:${asset.issuer}`;

export function processNewAssets(assets: AssetSimple[]) {
    return (dispatch: Dispatch<ActionResult>): void => {
        const cached = new Map(JSON.parse(localStorage.getItem(ASSET_CACHE) || '[]'));

        const newAssets = assets.filter(
            (asset) =>
                !cached.has(getAssetString(asset)) &&
                !new StellarSdk.Asset(asset.code, asset.issuer).isNative(),
        );

        if (!newAssets.length) {
            return;
        }

        getAssetsInfo(newAssets).then((res) => {
            res.forEach((info) => {
                cached.set(getAssetString(info), info);
            });

            localStorage.setItem(ASSET_CACHE, JSON.stringify(Array.from(cached.entries())));

            dispatch({ type: ASSETS_ACTIONS.UPDATE_ASSET_INFO, payload: { assetInfo: cached } });
        });
    };
}
