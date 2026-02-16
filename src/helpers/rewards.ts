import { DAY } from 'constants/intervals';

export const calculateBoostValue = (
    workingBalance: string | number,
    userBalance: string | number,
) => {
    const wBal = +workingBalance;
    const userBal = +userBalance;

    if (!wBal || !userBal) return 1;

    return wBal / userBal;
};

export const calculateDailyRewards = (
    tps: number,
    workingBalance: number,
    workingSupply: number,
) => {
    if (!workingSupply || !workingBalance) return 0;

    const seconds = DAY / 1000;

    return (tps * seconds * workingBalance) / workingSupply;
};
