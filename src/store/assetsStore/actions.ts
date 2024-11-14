import { Dispatch } from 'react';

import { getAssetsInfo, getAssetsRequest } from 'api/assets';

import { getAquaAssetData, getAssetString, getUsdcAssetData } from 'helpers/assets';

import { StellarService } from 'services/globalServices';

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

        const { aquaStellarAsset, aquaCode, aquaIssuer } = getAquaAssetData();
        const { usdcStellarAsset, usdcCode, usdcIssuer } = getUsdcAssetData();

        getAssetsRequest()
            .then(assets => {
                dispatch({
                    type: ASSETS_ACTIONS.GET_ASSETS_SUCCESS,
                    payload: {
                        assets: [
                            aquaStellarAsset,
                            StellarService.createLumen(),
                            usdcStellarAsset,
                            ...assets
                                .filter(
                                    asset =>
                                        !(
                                            (asset.code === aquaCode &&
                                                asset.issuer === aquaIssuer) ||
                                            (asset.code === usdcCode && asset.issuer === usdcIssuer)
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
