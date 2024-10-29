import { MOONPAY_ENV_KEYS } from 'constants/moonpay';
import { CONTRACTS } from 'constants/soroban';

import { SorobanService, StellarService } from 'services/globalServices';

import { getEnv, getIsTestnetEnv } from './env';

export const getMoonpayKeyByEnv = () => MOONPAY_ENV_KEYS[getEnv()];
export const getMoonpayBaseContract = () => CONTRACTS[getEnv()].aqua;

export const getMoonpayCounterContract = () =>
    getIsTestnetEnv()
        ? SorobanService.getAssetContractId(StellarService.createLumen())
        : SorobanService.getAssetContractId(StellarService.createLumen());
