import { Dispatch } from 'react';

import { getAssetsInfo, getAssetsRequest } from 'api/assets';

import { getAssetString } from 'helpers/assets';

import { StellarService } from 'services/globalServices';
import { AQUA_CODE, AQUA_ISSUER, USDC_CODE, USDC_ISSUER } from 'services/stellar.service';

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
                    payload: {
                        assets: [
                            StellarService.createAsset(AQUA_CODE, AQUA_ISSUER),
                            StellarService.createLumen(),
                            StellarService.createAsset(USDC_CODE, USDC_ISSUER),
                            ...assets
                                .filter(
                                    asset =>
                                        !(
                                            (asset.code === AQUA_CODE &&
                                                asset.issuer === AQUA_ISSUER) ||
                                            (asset.code === USDC_CODE &&
                                                asset.issuer === USDC_ISSUER)
                                        ),
                                )
                                .sort((a, b) => a.code.localeCompare(b.code)),
                        ],
                    },
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
                !StellarService.createAsset(asset.code, asset.issuer).isNative(),
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
