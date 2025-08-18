import BigNumber from 'bignumber.js';

export const amountToContractValue = (amount: string, decimals: number = 7) =>
    new BigNumber(amount).times(Math.pow(10, decimals)).toFixed();

export const contractValueToAmount = (value: string, decimals: number = 7) =>
    new BigNumber(value).div(Math.pow(10, decimals)).toFixed(decimals);
