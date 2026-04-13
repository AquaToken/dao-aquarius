import BigNumber from 'bignumber.js';

import { DAY } from 'constants/intervals';

import { formatBalance } from 'helpers/format-number';

export const amountToContractValue = (amount: string, decimals: number = 7) =>
    new BigNumber(amount).times(Math.pow(10, decimals)).toFixed();

export const contractValueToAmount = (value: string, decimals: number = 7) =>
    new BigNumber(value).div(Math.pow(10, decimals)).toFixed(decimals);

export const contractValueToFormattedAmount = (
    value: string | number | bigint,
    decimals = 7,
    withRounding = false,
    withLetters?: boolean,
    decimal = 7,
    absolute = false,
) =>
    formatBalance(
        absolute
            ? Math.abs(Number(contractValueToAmount(String(value ?? 0), decimals)))
            : Number(contractValueToAmount(String(value ?? 0), decimals)),
        withRounding,
        withLetters,
        decimal,
    );

export const apyValueToDisplay = (apy: string) =>
    apy ? `${formatBalance((+apy * 100).toFixed(2))}%` : '0%';

export const tpsToDailyAmount = (tps: string, decimals = 7, withLetters?: boolean) => {
    const seconds = DAY / 1000;
    const value = contractValueToAmount((+tps * seconds).toString(), decimals);

    return formatBalance(value, true, withLetters);
};
