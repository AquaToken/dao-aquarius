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

const HARDCODE = new Map([
    [
        'USDC:GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER',
        {
            code: 'USDC',
            issuer: 'GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER',
            image: 'https://static.ultrastellar.com/media/assets/img/ba187c6f-f0e6-45bd-b66b-89ed45640c7d.png',
            home_domain: 'circle.io',
        },
    ],
    [
        'USDT:GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER',
        {
            code: 'USDT',
            issuer: 'GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER',
            image: 'https://static.ultrastellar.com/media/assets/img/de88cd49-1b8e-439d-8dc0-48fb53bde644.png',
            home_domain: 'tether.io',
        },
    ],
    [
        'BTC:GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER',
        {
            code: 'BTC',
            issuer: 'GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER',
            image: 'https://static.ultrastellar.com/media/assets/img/c3380651-52e5-4054-9121-a438c60a1ec4.png',
            home_domain: 'ultrastellar.com',
        },
    ],
    [
        'AQUA:GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER',
        {
            code: 'AQUA',
            issuer: 'GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER',
            image: 'https://static.ultrastellar.com/media/assets/img/1878ee2d-2fd1-4e31-89a7-5a430f1596f8.png',
            home_domain: 'aqua.network',
        },
    ],
    [
        'ETH:GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER',
        {
            code: 'ETH',
            issuer: 'GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER',
            image: 'https://static.ultrastellar.com/media/assets/img/f50535aa-8fcb-487f-912f-96d338b8e610.png',
            home_domain: 'ultrastellar.com',
        },
    ],
    [
        'DAI:GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER',
        {
            code: 'DAI',
            issuer: 'GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER',
            image: 'https://spark.fi/images/deposit---icon.png',
            home_domain: 'makerdao.com',
        },
    ],
]);

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

            assets
                .filter(asset => !cached.has(getAssetString(asset)))
                .forEach(asset => {
                    if (HARDCODE.has(getAssetString(asset))) {
                        cached.set(getAssetString(asset), HARDCODE.get(getAssetString(asset)));
                    } else {
                        cached.set(getAssetString(asset), { image: null });
                    }
                });

            if (!cached.has(getAssetString(HARDCODE.values().next().value))) {
                // @ts-ignore
                [...HARDCODE.values()].forEach(asset => {
                    cached.set(getAssetString(asset), HARDCODE.get(getAssetString(asset)));
                });
            }

            localStorage.setItem(ASSET_CACHE, JSON.stringify(Array.from(cached.entries())));

            dispatch({ type: ASSETS_ACTIONS.UPDATE_ASSET_INFO, payload: { assetInfo: cached } });
        });
    };
}
