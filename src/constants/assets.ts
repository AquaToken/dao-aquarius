import { AssetsEnvData } from 'types/env';

import { ENV_PRODUCTION, ENV_TESTNET } from './env';

const AQUA_CODE = 'AQUA';
const AQUA_CODE_TESTNET = 'AQUA';
const AQUA_ISSUER = 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA';
const AQUA_ISSUER_TESTNET = 'GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER';
const AQUA_ASSET_STRING = `${AQUA_CODE}:${AQUA_ISSUER}`;
const AQUA_ASSET_STRING_TESTNET = `${AQUA_CODE_TESTNET}:${AQUA_ISSUER_TESTNET}`;

const USDC_CODE = 'USDC';
const USDC_CODE_TESTNET = 'USDC';
const USDC_ISSUER = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';
const USDC_ISSUER_TESTNET = 'GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER';
const USDC_ASSET_STRING = `${USDC_CODE}:${USDC_ISSUER}`;
const USDC_ASSET_STRING_TESTNET = `${USDC_CODE_TESTNET}:${USDC_ISSUER_TESTNET}`;

export const ICE_CODE = 'ICE';
export const ICE_ISSUER = 'GAXSGZ2JM3LNWOO4WRGADISNMWO4HQLG4QBGUZRKH5ZHL3EQBGX73ICE';

export const GOV_ICE_CODE = 'governICE';
export const UP_ICE_CODE = 'upvoteICE';
export const DOWN_ICE_CODE = 'downvoteICE';
export const D_ICE_CODE = 'dICE';
export const GD_ICE_CODE = 'gdICE';

export const DEFAULT_ICE_ASSETS = [
    `${ICE_CODE}:${ICE_ISSUER}`,
    `${GOV_ICE_CODE}:${ICE_ISSUER}`,
    `${UP_ICE_CODE}:${ICE_ISSUER}`,
    `${DOWN_ICE_CODE}:${ICE_ISSUER}`,
];

export const ICE_TO_DELEGATE = [`${UP_ICE_CODE}:${ICE_ISSUER}`, `${GOV_ICE_CODE}:${ICE_ISSUER}`];

export const ICE_DELEGATION_MAP = new Map([
    [`${UP_ICE_CODE}:${ICE_ISSUER}`, `${D_ICE_CODE}:${ICE_ISSUER}`],
    [`${GOV_ICE_CODE}:${ICE_ISSUER}`, `${GD_ICE_CODE}:${ICE_ISSUER}`],
]);

export const ALL_ICE_ASSETS = [
    ...DEFAULT_ICE_ASSETS,
    `${D_ICE_CODE}:${ICE_ISSUER}`,
    `${GD_ICE_CODE}:${ICE_ISSUER}`,
];

export const ASSETS_ENV_DATA: AssetsEnvData = {
    [ENV_PRODUCTION]: {
        aqua: {
            aquaCode: AQUA_CODE,
            aquaIssuer: AQUA_ISSUER,
            aquaAssetString: AQUA_ASSET_STRING,
        },
        usdc: {
            usdcCode: USDC_CODE,
            usdcIssuer: USDC_ISSUER,
            usdcAssetString: USDC_ASSET_STRING,
        },
    },
    [ENV_TESTNET]: {
        aqua: {
            aquaCode: AQUA_CODE_TESTNET,
            aquaIssuer: AQUA_ISSUER_TESTNET,
            aquaAssetString: AQUA_ASSET_STRING_TESTNET,
        },

        usdc: {
            usdcCode: USDC_CODE_TESTNET,
            usdcIssuer: USDC_ISSUER_TESTNET,
            usdcAssetString: USDC_ASSET_STRING_TESTNET,
        },
    },
};

export const TESTNET_ASSETS = new Map([
    [
        USDC_ASSET_STRING_TESTNET,
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
        AQUA_ASSET_STRING_TESTNET,
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

export const USDx_CODE = 'USDx';
export const USDx_ISSUER = 'GAVH5ZWACAY2PHPUG4FL3LHHJIYIHOFPSIUGM2KHK25CJWXHAV6QKDMN';
