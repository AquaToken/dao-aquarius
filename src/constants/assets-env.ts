import { AssetsEnvData, Environment } from 'types/env';
import { ClassicToken } from 'types/token';

import { ENV_PRODUCTION, ENV_TESTNET } from './env';

const AQUA_CODE = 'AQUA';
const AQUA_ISSUER = 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA';

const USDC_CODE = 'USDC';
const USDC_ISSUER = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';

export const TESTNET_SHARED_ISSUER = 'GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER';

export const ICE_CODE = 'ICE';
export const ICE_ISSUER = 'GAXSGZ2JM3LNWOO4WRGADISNMWO4HQLG4QBGUZRKH5ZHL3EQBGX73ICE';

export const GOV_ICE_CODE = 'governICE';
export const UP_ICE_CODE = 'upvoteICE';
export const DOWN_ICE_CODE = 'downvoteICE';
export const D_ICE_CODE = 'dICE';
export const GD_ICE_CODE = 'gdICE';

type ClassicAssetConfig = { code: string; issuer: string };

export type EnvClassicAssetConfig = Record<Environment, ClassicAssetConfig>;

export type EnvClassicAssetName = 'aqua' | 'usdc' | 'governIce' | 'gdIce';

export type BaseClassicAssetData = {
    code: string;
    issuer: string;
    assetString: string;
    asset: ClassicToken;
    contract: string;
};

const createClassicAssetConfig = (code: string, issuer: string): ClassicAssetConfig => ({
    code,
    issuer,
});

const createEnvClassicAssetConfig = (
    production: ClassicAssetConfig,
    testnet: ClassicAssetConfig,
): EnvClassicAssetConfig => ({
    [ENV_PRODUCTION]: production,
    [ENV_TESTNET]: testnet,
});

const createAssetsEnvDataItem = <
    TCode extends string,
    TIssuer extends string,
    TAssetString extends string,
>(
    codeKey: TCode,
    issuerKey: TIssuer,
    assetStringKey: TAssetString,
    { code, issuer }: ClassicAssetConfig,
) =>
    ({
        [codeKey]: code,
        [issuerKey]: issuer,
        [assetStringKey]: `${code}:${issuer}`,
    }) as Record<TCode | TIssuer | TAssetString, string>;

const createTestnetAssetKey = ({
    code,
    issuer = TESTNET_SHARED_ISSUER,
}: {
    code: string;
    issuer?: string;
}) => `${code}:${issuer}`;

const createTestnetAssetInfo = ({
    code,
    image,
    home_domain,
    issuer = TESTNET_SHARED_ISSUER,
}: {
    code: string;
    image: string;
    home_domain: string;
    issuer?: string;
}) =>
    [
        createTestnetAssetKey({ code, issuer }),
        {
            code,
            issuer,
            image,
            home_domain,
        },
    ] as const;

const createTestnetDistribution = ({
    code,
    amount,
    issuer = TESTNET_SHARED_ISSUER,
}: {
    code: string;
    amount: string;
    issuer?: string;
}): [string, string] => [createTestnetAssetKey({ code, issuer }), amount];

const AQUA_CLASSIC_ASSET_CONFIG = createEnvClassicAssetConfig(
    createClassicAssetConfig(AQUA_CODE, AQUA_ISSUER),
    createClassicAssetConfig(AQUA_CODE, TESTNET_SHARED_ISSUER),
);

const USDC_CLASSIC_ASSET_CONFIG = createEnvClassicAssetConfig(
    createClassicAssetConfig(USDC_CODE, USDC_ISSUER),
    createClassicAssetConfig(USDC_CODE, TESTNET_SHARED_ISSUER),
);

const GOVERN_ICE_CLASSIC_ASSET_CONFIG = createEnvClassicAssetConfig(
    createClassicAssetConfig(GOV_ICE_CODE, ICE_ISSUER),
    createClassicAssetConfig(GOV_ICE_CODE, TESTNET_SHARED_ISSUER),
);

const GD_ICE_CLASSIC_ASSET_CONFIG = createEnvClassicAssetConfig(
    createClassicAssetConfig(GD_ICE_CODE, ICE_ISSUER),
    createClassicAssetConfig(GD_ICE_CODE, TESTNET_SHARED_ISSUER),
);

export const ENV_CLASSIC_ASSETS_CONFIG: Record<EnvClassicAssetName, EnvClassicAssetConfig> = {
    aqua: AQUA_CLASSIC_ASSET_CONFIG,
    usdc: USDC_CLASSIC_ASSET_CONFIG,
    governIce: GOVERN_ICE_CLASSIC_ASSET_CONFIG,
    gdIce: GD_ICE_CLASSIC_ASSET_CONFIG,
};

export const ASSETS_ENV_DATA: AssetsEnvData = {
    [ENV_PRODUCTION]: {
        aqua: createAssetsEnvDataItem(
            'aquaCode',
            'aquaIssuer',
            'aquaAssetString',
            AQUA_CLASSIC_ASSET_CONFIG[ENV_PRODUCTION],
        ),
        usdc: createAssetsEnvDataItem(
            'usdcCode',
            'usdcIssuer',
            'usdcAssetString',
            USDC_CLASSIC_ASSET_CONFIG[ENV_PRODUCTION],
        ),
    },
    [ENV_TESTNET]: {
        aqua: createAssetsEnvDataItem(
            'aquaCode',
            'aquaIssuer',
            'aquaAssetString',
            AQUA_CLASSIC_ASSET_CONFIG[ENV_TESTNET],
        ),
        usdc: createAssetsEnvDataItem(
            'usdcCode',
            'usdcIssuer',
            'usdcAssetString',
            USDC_CLASSIC_ASSET_CONFIG[ENV_TESTNET],
        ),
    },
};

export const TESTNET_ASSETS = new Map([
    createTestnetAssetInfo({
        code: ASSETS_ENV_DATA[ENV_TESTNET].usdc.usdcCode,
        image: 'https://static.ultrastellar.com/media/assets/img/ba187c6f-f0e6-45bd-b66b-89ed45640c7d.png',
        home_domain: 'circle.io',
        issuer: ASSETS_ENV_DATA[ENV_TESTNET].usdc.usdcIssuer,
    }),
    createTestnetAssetInfo({
        code: 'USDT',
        image: 'https://static.ultrastellar.com/media/assets/img/de88cd49-1b8e-439d-8dc0-48fb53bde644.png',
        home_domain: 'tether.io',
    }),
    createTestnetAssetInfo({
        code: 'BTC',
        image: 'https://static.ultrastellar.com/media/assets/img/c3380651-52e5-4054-9121-a438c60a1ec4.png',
        home_domain: 'ultrastellar.com',
    }),
    createTestnetAssetInfo({
        code: ASSETS_ENV_DATA[ENV_TESTNET].aqua.aquaCode,
        image: 'https://static.ultrastellar.com/media/assets/img/1878ee2d-2fd1-4e31-89a7-5a430f1596f8.png',
        home_domain: 'aqua.network',
        issuer: ASSETS_ENV_DATA[ENV_TESTNET].aqua.aquaIssuer,
    }),
    createTestnetAssetInfo({
        code: GOV_ICE_CODE,
        image: 'https://static.ultrastellar.com/media/assets/img/c2cdac64-386b-4815-9e16-044ae494ceac.png',
        home_domain: 'aqua.network',
    }),
    createTestnetAssetInfo({
        code: GD_ICE_CODE,
        image: 'https://static.ultrastellar.com/media/assets/img/9694b5ba-3483-451e-85b1-bbadd480da6a.png',
        home_domain: 'aqua.network',
    }),
    createTestnetAssetInfo({
        code: 'ETH',
        image: 'https://static.ultrastellar.com/media/assets/img/f50535aa-8fcb-487f-912f-96d338b8e610.png',
        home_domain: 'ultrastellar.com',
    }),
    createTestnetAssetInfo({
        code: 'DAI',
        image: 'https://spark.fi/images/deposit---icon.png',
        home_domain: 'makerdao.com',
    }),
]);

export const TESTNET_DISTRIBUTION_AMOUNTS: Array<[string, string]> = [
    createTestnetDistribution({
        code: ASSETS_ENV_DATA[ENV_TESTNET].aqua.aquaCode,
        amount: '10000000',
        issuer: ASSETS_ENV_DATA[ENV_TESTNET].aqua.aquaIssuer,
    }),
    createTestnetDistribution({
        code: GOV_ICE_CODE,
        amount: '10000000',
    }),
    createTestnetDistribution({
        code: GD_ICE_CODE,
        amount: '10000000',
    }),
    createTestnetDistribution({
        code: ASSETS_ENV_DATA[ENV_TESTNET].usdc.usdcCode,
        amount: '10000',
        issuer: ASSETS_ENV_DATA[ENV_TESTNET].usdc.usdcIssuer,
    }),
    createTestnetDistribution({
        code: 'BTC',
        amount: '0.5',
    }),
    createTestnetDistribution({
        code: 'ETH',
        amount: '5',
    }),
    createTestnetDistribution({
        code: 'USDT',
        amount: '10000',
    }),
    createTestnetDistribution({
        code: 'DAI',
        amount: '500',
    }),
];
