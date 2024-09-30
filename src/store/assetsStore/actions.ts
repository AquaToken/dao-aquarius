import * as StellarSdk from '@stellar/stellar-sdk';
import { Dispatch } from 'react';

import { getAssetString } from 'helpers/assets';

import { StellarService } from 'services/globalServices';

import { getAssetsInfo, getAssetsRequest } from './api/api';
import { ASSET_CACHE } from './reducer';
import { ASSETS_ACTIONS, AssetSimple } from './types';

import { ActionResult } from '../types';

export function clearAssets() {
    localStorage.setItem(ASSET_CACHE, '[]');
    return { type: ASSETS_ACTIONS.CLEAR_ASSETS };
}

export function getAssets() {
    return (dispatch: Dispatch<ActionResult>): void => {
        dispatch({ type: ASSETS_ACTIONS.GET_ASSETS_START });

        getAssetsRequest()
            .then(assets => {
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

export function processNewAssets(assets: AssetSimple[]) {
    return (dispatch: Dispatch<ActionResult>): void => {
        const cached = new Map(JSON.parse(localStorage.getItem(ASSET_CACHE) || '[]'));

        const newAssets = assets.filter(
            asset =>
                !cached.has(getAssetString(StellarService.createAsset(asset.code, asset.issuer))) &&
                !new StellarSdk.Asset(asset.code, asset.issuer).isNative(),
        );

        if (!newAssets.length) {
            return;
        }

        getAssetsInfo(newAssets).then(res => {
            res.forEach(info => {
                cached.set(
                    getAssetString(StellarService.createAsset(info.code, info.issuer)),
                    info,
                );
            });

            localStorage.setItem(ASSET_CACHE, JSON.stringify(Array.from(cached.entries())));

            dispatch({ type: ASSETS_ACTIONS.UPDATE_ASSET_INFO, payload: { assetInfo: cached } });
        });
    };
}
