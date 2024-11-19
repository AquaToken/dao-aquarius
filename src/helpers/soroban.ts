import { ASSETS_ENV_DATA } from 'constants/assets';

import { SorobanService, StellarService } from 'services/globalServices';

import { getEnv } from './env';

export const getAquaContract = () => {
    const env = getEnv();
    const { aquaCode, aquaIssuer } = ASSETS_ENV_DATA[env].aqua;
    return SorobanService.getAssetContractId(StellarService.createAsset(aquaCode, aquaIssuer));
};

export const getUsdcContract = () => {
    const env = getEnv();
    const { usdcCode, usdcIssuer } = ASSETS_ENV_DATA[env].usdc;
    return SorobanService.getAssetContractId(StellarService.createAsset(usdcCode, usdcIssuer));
};
export const getXlmContract = () => SorobanService.getAssetContractId(StellarService.createLumen());
