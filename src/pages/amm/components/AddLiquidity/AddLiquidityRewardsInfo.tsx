import * as React from 'react';

import { formatBalance } from 'helpers/format-number';
import { calculateBoostValue, calculateDailyRewards } from 'helpers/rewards';

import { PoolIncentives, PoolRewardsInfo } from 'types/amm';

import Arrow from 'assets/icons/arrows/arrow-alt2-16.svg';

import Label from 'basics/Label';

import { COLORS } from 'styles/style-constants';

import { DescriptionRow } from './Regular/AddLiquidity.styled';

type Props = {
    poolRewardTps: string | number | undefined;
    poolTotalShare: string | number | undefined;
    poolRewards: PoolRewardsInfo;
    incentives: PoolIncentives[] | null;
    isRewardsEnabled: boolean | null;
    hasActiveIncentives: boolean;
    accountShare: string | null;
    depositShares: number | null;
    newWorkingBalance: number | null;
    newWorkingSupply: number | null;
};

const AddLiquidityRewardsInfo = ({
    poolRewardTps,
    poolTotalShare,
    poolRewards,
    incentives,
    isRewardsEnabled,
    hasActiveIncentives,
    accountShare,
    depositShares,
    newWorkingBalance,
    newWorkingSupply,
}: Props): React.ReactNode => {
    const hasNextWorkingState = newWorkingBalance !== null && newWorkingSupply !== null;
    const currentDailyRewards = (() => {
        if (!poolRewards) {
            return '0 AQUA';
        }

        if (!poolRewards.tps || !poolRewards.working_balance || !poolRewards.working_supply) {
            return '0 AQUA';
        }

        return `${formatBalance(
            calculateDailyRewards(
                +poolRewards.tps,
                +poolRewards.working_balance,
                +poolRewards.working_supply,
            ),
            true,
        )} AQUA`;
    })();

    const nextDailyRewards = (() => {
        if (
            !poolRewards ||
            depositShares === null ||
            newWorkingBalance === null ||
            newWorkingSupply === null
        ) {
            return '0 AQUA';
        }

        if (!poolRewards.tps) {
            return '0 AQUA';
        }

        return `${formatBalance(
            calculateDailyRewards(+poolRewards.tps, newWorkingBalance, newWorkingSupply),
            true,
        )} AQUA`;
    })();

    return (
        <>
            {isRewardsEnabled &&
                (Boolean(Number(poolRewardTps)) || hasActiveIncentives) &&
                Boolean(Number(poolTotalShare)) &&
                poolRewards && (
                    <DescriptionRow>
                        <span>ICE Reward Boost</span>
                        <span>
                            <Label
                                labelText={`x${(+calculateBoostValue(poolRewards.working_balance, accountShare)).toFixed(2)}`}
                                labelSize="medium"
                                background={COLORS.blue700}
                                withoutUppercase
                            />
                            {hasNextWorkingState && (
                                <>
                                    <Arrow />
                                    <Label
                                        labelText={`x${calculateBoostValue(
                                            newWorkingBalance,
                                            +accountShare + +(depositShares || 0),
                                        ).toFixed(2)}`}
                                        labelSize="medium"
                                        background={COLORS.blue700}
                                        withoutUppercase
                                    />
                                </>
                            )}
                        </span>
                    </DescriptionRow>
                )}

            {isRewardsEnabled && Boolean(Number(poolRewardTps)) && (
                <DescriptionRow>
                    <span>Daily rewards</span>
                    <span>
                        {currentDailyRewards}
                        {hasNextWorkingState && (
                            <>
                                <Arrow />
                                {nextDailyRewards}
                            </>
                        )}
                    </span>
                </DescriptionRow>
            )}

            {hasActiveIncentives && isRewardsEnabled
                ? incentives
                      ?.filter(incentive => !!Number(incentive.info.tps))
                      .map(incentive => (
                          <DescriptionRow key={incentive.token.contract}>
                              <span>Daily incentives {incentive.token.code}</span>
                              <span>
                                  {formatBalance(
                                      calculateDailyRewards(
                                          +incentive.info.tps,
                                          +poolRewards?.working_balance,
                                          +poolRewards?.working_supply,
                                      ),
                                      true,
                                  )}{' '}
                                  {incentive.token.code}
                                  {hasNextWorkingState && (
                                      <>
                                          <Arrow />
                                          {formatBalance(
                                              calculateDailyRewards(
                                                  +incentive.info.tps,
                                                  newWorkingBalance,
                                                  newWorkingSupply,
                                              ),
                                              true,
                                          )}{' '}
                                          {incentive.token.code}
                                      </>
                                  )}
                              </span>
                          </DescriptionRow>
                      ))
                : null}
        </>
    );
};

export default AddLiquidityRewardsInfo;
