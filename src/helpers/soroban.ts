import { CONTRACTS } from 'constants/soroban';

import { SorobanService, StellarService } from 'services/globalServices';

import { getEnv } from './env';

export const getAquaContract = () => CONTRACTS[getEnv()].aqua;
export const getUsdcContract = () => CONTRACTS[getEnv()].usdc;
export const getXlmContract = () => SorobanService.getAssetContractId(StellarService.createLumen());
