import { AQUA_CODE, AQUA_ISSUER, TESTNET_AQUA_CONTRACT } from 'constants/assets';
import { MOONPAY_ENV_KEYS } from 'constants/moonpay';

import { SorobanService, StellarService } from 'services/globalServices';

import { getEnv, getIsTestnetEnv } from './env';

export const getMoonpayKeyByEnv = () => MOONPAY_ENV_KEYS[getEnv()];
export const getMoonpayBaseContract = () =>
    getIsTestnetEnv()
        ? TESTNET_AQUA_CONTRACT
        : SorobanService.getAssetContractId(StellarService.createAsset(AQUA_CODE, AQUA_ISSUER));

export const getMoonpayCounterContract = () =>
    getIsTestnetEnv()
        ? SorobanService.getAssetContractId(StellarService.createLumen())
        : SorobanService.getAssetContractId(StellarService.createLumen());
