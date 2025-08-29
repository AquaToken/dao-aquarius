import BigNumber from 'bignumber.js';

import { DAY } from 'constants/intervals';

import { formatBalance } from 'helpers/format-number';

export const amountToContractValue = (amount: string, decimals: number = 7) =>
    new BigNumber(amount).times(Math.pow(10, decimals)).toFixed();

export const contractValueToAmount = (value: string, decimals: number = 7) =>
    new BigNumber(value).div(Math.pow(10, decimals)).toFixed(decimals);

export const apyValueToDisplay = (apy: string) =>
    apy ? `${formatBalance(+(+apy * 100).toFixed(2))}%` : '0%';

export const tpsToDailyAmount = (tps: string, decimals = 7, withLetters?: boolean) => {
    const value = contractValueToAmount(tps, decimals);
    const seconds = DAY / 1000;

    return formatBalance(+value * seconds, true, withLetters);
};
