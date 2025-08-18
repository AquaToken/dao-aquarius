import { Dispatch } from 'react';

import { getAssetsInfo, getAssetsRequest } from 'api/assets';

import { ALL_ICE_ASSETS, TESTNET_ASSETS } from 'constants/assets';

import {
    getAquaAssetData,
    getAssetFromString,
    getAssetString,
    getUsdcAssetData,
} from 'helpers/assets';
import { getIsTestnetEnv } from 'helpers/env';

import { StellarService } from 'services/globalServices';

import { ClassicToken, Token, TokenType } from 'types/token';

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

export function processNewAssets(assets: Token[] | AssetSimple[]) {
    return (dispatch: Dispatch<ActionResult>): void => {
        const cached = new Map(JSON.parse(localStorage.getItem(ASSET_CACHE) || '[]'));

        const newAssets: ClassicToken[] | AssetSimple[] = assets.filter(
            asset =>
                (asset as Token).type !== TokenType.soroban &&
                !cached.has(`${asset.code}:${(asset as ClassicToken | AssetSimple).issuer}`) &&
                !StellarService.createAsset(
                    asset.code,
                    (asset as ClassicToken | AssetSimple).issuer,
                ).isNative(),
        ) as ClassicToken[] | AssetSimple[];

        if (!cached.has(ALL_ICE_ASSETS[0])) {
            newAssets.push(...ALL_ICE_ASSETS.map(str => getAssetFromString(str) as ClassicToken));
        }

        if (getIsTestnetEnv()) {
            if (!cached.has(TESTNET_ASSETS.keys()[0])) {
                TESTNET_ASSETS.forEach(asset => {
                    cached.set(`${asset.code}:${asset.issuer}`, asset);
                });
            }
            newAssets.forEach(asset => {
                cached.set(`${asset.code}:${asset.issuer}`, { ...asset, ...{ image: null } });
            });
            localStorage.setItem(ASSET_CACHE, JSON.stringify(Array.from(cached.entries())));
            dispatch({
                type: ASSETS_ACTIONS.UPDATE_ASSET_INFO,
                payload: { assetInfo: cached },
            });
            return;
        }

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
