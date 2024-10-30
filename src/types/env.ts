import { ENV_PRODUCTION, ENV_TESTNET } from 'constants/env';

export type Environment = typeof ENV_TESTNET | typeof ENV_PRODUCTION;

type AquaAssetData = {
    aquaCode: string;
    aquaIssuer: string;
    aquaAssetString: string;
};

export type AssetsEnvData = {
    [key in Environment]: {
        aqua: AquaAssetData;
    };
};
