import { MOONPAY_ENV_KEYS } from 'constants/moonpay';

import { getEnv } from './env';

export const getMoonpayKeyByEnv = () => MOONPAY_ENV_KEYS[getEnv()];
