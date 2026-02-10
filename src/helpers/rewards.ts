import { DAY } from 'constants/intervals';

import { PoolIncentives, PoolRewardsInfo } from 'types/amm';

export const calculateBoostValue = (rewardsInfo: PoolRewardsInfo, userBalance: string) => {
    if (!rewardsInfo) return 0;
    const tps = +rewardsInfo.tps;
    const wSupply = +rewardsInfo.working_supply;
    const wBalance = +rewardsInfo.working_balance;

    if (!tps || !wSupply || !wBalance) return 1;

    const tpsWithoutBoost = (+userBalance * tps) / wSupply;
    const expectedTps = (tps * wBalance) / wSupply;

    if (tpsWithoutBoost === 0) return 1;

    return expectedTps / tpsWithoutBoost;
};

export const estimateBoostValue = (rewardsInfo: PoolRewardsInfo, sharesAfterValue: number) => {
    if (!rewardsInfo) return 1;

    const supply = +rewardsInfo.supply;
    const lockedSupply = +rewardsInfo.boost_supply;
    const lockedBalance = +rewardsInfo.boost_balance;

    const newWBalance = Math.min(
        +sharesAfterValue + (1.5 * lockedBalance * supply) / lockedSupply,
        +sharesAfterValue * 2.5,
    );

    return newWBalance / sharesAfterValue;
};

export const calculateDailyRewards = (rewardsInfo: PoolRewardsInfo) => {
    if (!rewardsInfo) return 0;

    if (rewardsInfo.exp_at * 1000 < Date.now()) return 0;
    const tps = +rewardsInfo.tps;
    const wSupply = +rewardsInfo.working_supply;
    const wBalance = +rewardsInfo.working_balance;

    return (((+tps * DAY) / 1000) * +wBalance) / +wSupply;
};

export const calculateDailyIncentives = (
    rewardsInfo: PoolRewardsInfo,
    incentiveInfo: PoolIncentives,
) => {
    if (!rewardsInfo || !incentiveInfo) return 0;

    if (+incentiveInfo.info.expired_at * 1000 < Date.now()) return 0;
    const tps = +incentiveInfo.info.tps;
    const wSupply = +rewardsInfo.working_supply;
    const wBalance = +rewardsInfo.working_balance;

    return (((+tps * DAY) / 1000) * +wBalance) / +wSupply;
};

export const estimateDailyRewards = (
    rewardsInfo: PoolRewardsInfo,
    sharesAfterValue: number,
    accountShare: number,
) => {
    const supply = +rewardsInfo.supply;
    const lockedSupply = +rewardsInfo.boost_supply;
    const lockedBalance = +rewardsInfo.boost_balance;

    const newWBalance = Math.min(
        +sharesAfterValue + (1.5 * lockedBalance * supply) / lockedSupply,
        +sharesAfterValue * 2.5,
    );

    const tps = +rewardsInfo.tps;
    const newWSupply = +rewardsInfo.working_supply - accountShare + sharesAfterValue;

    if (!tps) return 0;

    return (tps * newWBalance * DAY) / 1000 / newWSupply;
};

export const estimateDailyIncentives = (
    rewardsInfo: PoolRewardsInfo,
    incentiveInfo: PoolIncentives,
    sharesAfterValue: number,
    accountShare: number,
) => {
    const supply = +rewardsInfo.supply;
    const lockedSupply = +rewardsInfo.boost_supply;
    const lockedBalance = +rewardsInfo.boost_balance;

    const newWBalance = Math.min(
        +sharesAfterValue + (1.5 * lockedBalance * supply) / lockedSupply,
        +sharesAfterValue * 2.5,
    );

    const tps = +incentiveInfo.info.tps;
    const newWSupply = +rewardsInfo.working_supply - accountShare + sharesAfterValue;

    if (!tps) return 0;

    return (tps * newWBalance * DAY) / 1000 / newWSupply;
};
