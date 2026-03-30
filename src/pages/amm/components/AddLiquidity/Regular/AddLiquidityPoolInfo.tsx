import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { contractValueToAmount } from 'helpers/amount';
import { formatBalance } from 'helpers/format-number';
import { getPercentValue } from 'helpers/number';
import { calculateBoostValue, calculateDailyRewards } from 'helpers/rewards';

import { useDebounce } from 'hooks/useDebounce';

import useAuthStore from 'store/authStore/useAuthStore';

import { SorobanService } from 'services/globalServices';

import { PoolExtended, PoolIncentives, PoolRewardsInfo } from 'types/amm';

import Arrow from 'assets/icons/arrows/arrow-alt2-16.svg';

import Label from 'basics/Label';
import PageLoader from 'basics/loaders/PageLoader';

import { COLORS } from 'styles/style-constants';

import { DescriptionRow, PoolInfo } from './AddLiquidity.styled';

type AddLiquidityPoolInfoProps = {
    pool: PoolExtended;
    amounts: Map<string, string>;
    withPoolInfoCardSpacing: boolean;
};

type EstimatedPoolInfo = {
    depositShares: number | null;
    newWorkingBalance: number | null;
    newWorkingSupply: number | null;
};

const AddLiquidityPoolInfo = ({
    pool,
    amounts,
    withPoolInfoCardSpacing,
}: AddLiquidityPoolInfoProps): React.ReactNode => {
    const { account } = useAuthStore();

    const [accountShare, setAccountShare] = useState<string | null>(null);
    const [poolRewards, setPoolRewards] = useState<PoolRewardsInfo>(null);
    const [incentives, setIncentives] = useState<PoolIncentives[] | null>(null);
    const [isRewardsEnabled, setIsRewardsEnabled] = useState<boolean | null>(null);
    const [isRewardsStatusLoading, setIsRewardsStatusLoading] = useState(false);
    const [isAccountShareLoading, setIsAccountShareLoading] = useState(false);
    const [isPoolRewardsLoading, setIsPoolRewardsLoading] = useState(false);
    const [isIncentivesLoading, setIsIncentivesLoading] = useState(false);
    const [isEstimateLoading, setIsEstimateLoading] = useState(false);
    const [estimatedPoolInfo, setEstimatedPoolInfo] = useState<EstimatedPoolInfo | null>(null);
    const estimateRequestIdRef = useRef(0);

    useEffect(() => {
        if (!account) {
            setIsRewardsEnabled(null);
            setIsRewardsStatusLoading(false);
            return;
        }

        setIsRewardsStatusLoading(true);
        SorobanService.amm
            .getUserRewardsStatus(pool.address, account.accountId())
            .then(setIsRewardsEnabled)
            .finally(() => setIsRewardsStatusLoading(false));
    }, [account, pool.address]);

    useEffect(() => {
        if (!account) {
            setAccountShare(null);
            setIsAccountShareLoading(false);
            return;
        }

        setIsAccountShareLoading(true);
        SorobanService.token
            .getTokenBalance(pool.share_token_address, account.accountId())
            .then(setAccountShare)
            .finally(() => setIsAccountShareLoading(false));
    }, [account, pool.share_token_address]);

    useEffect(() => {
        if (!account) {
            setPoolRewards(null);
            setIsPoolRewardsLoading(false);
            return;
        }

        setIsPoolRewardsLoading(true);
        SorobanService.amm
            .getPoolRewards(account.accountId(), pool.address)
            .then(setPoolRewards)
            .finally(() => setIsPoolRewardsLoading(false));
    }, [account, pool.address]);

    useEffect(() => {
        if (!account) {
            setIncentives(null);
            setIsIncentivesLoading(false);
            return;
        }

        setIsIncentivesLoading(true);
        SorobanService.amm
            .getPoolIncentives(account.accountId(), pool.address)
            .then(setIncentives)
            .finally(() => setIsIncentivesLoading(false));
    }, [account, pool.address]);

    const hasActiveIncentives = useMemo(() => {
        if (!incentives?.length) {
            return false;
        }

        return incentives.some(
            incentive =>
                !!Number(incentive.info.tps) &&
                Number(incentive.info.expired_at) * 1000 > Date.now(),
        );
    }, [incentives]);

    const debouncedAmounts = useDebounce(amounts, 1000);

    useEffect(() => {
        if (
            !account ||
            [...debouncedAmounts.current.values()].some(value => Number.isNaN(+value))
        ) {
            setEstimatedPoolInfo(null);
            setIsEstimateLoading(false);
            return;
        }

        const requestId = estimateRequestIdRef.current + 1;
        estimateRequestIdRef.current = requestId;
        setIsEstimateLoading(true);

        SorobanService.amm
            .estimateDeposit(
                account.accountId(),
                pool.address,
                pool.tokens,
                debouncedAmounts.current,
            )
            .then(depositShares => {
                if (requestId !== estimateRequestIdRef.current) {
                    return null;
                }

                if (!depositShares) {
                    return { depositShares, newWorkingBalance: null, newWorkingSupply: null };
                }

                return SorobanService.amm
                    .estimateWorkingBalanceAndSupply(
                        pool,
                        account.accountId(),
                        String(Number(accountShare) + depositShares),
                    )
                    .then(({ workingBalance, workingSupply }) => ({
                        depositShares,
                        newWorkingBalance: workingBalance,
                        newWorkingSupply: workingSupply,
                    }));
            })
            .then(nextEstimatedPoolInfo => {
                if (requestId !== estimateRequestIdRef.current || !nextEstimatedPoolInfo) {
                    return;
                }

                setEstimatedPoolInfo(nextEstimatedPoolInfo);
            })
            .finally(() => {
                if (requestId === estimateRequestIdRef.current) {
                    setIsEstimateLoading(false);
                }
            });
    }, [account, pool, debouncedAmounts, accountShare]);

    const depositShares = estimatedPoolInfo?.depositShares ?? null;
    const newWorkingBalance = estimatedPoolInfo?.newWorkingBalance ?? null;
    const newWorkingSupply = estimatedPoolInfo?.newWorkingSupply ?? null;

    const sharesBeforePercent = useMemo(() => {
        if (!Number(pool.total_share)) {
            return 0;
        }

        return +getPercentValue(Number(accountShare), +contractValueToAmount(pool.total_share), 2);
    }, [pool.total_share, accountShare]);

    const sharesAfterPercent = useMemo(() => {
        if (!depositShares) {
            return 0;
        }

        return +getPercentValue(
            Number(accountShare) + depositShares,
            +contractValueToAmount(pool.total_share) + depositShares,
            2,
        );
    }, [pool.total_share, accountShare, depositShares]);

    const dailyRewardsValue = calculateDailyRewards(
        +poolRewards?.tps,
        +poolRewards?.working_balance,
        +poolRewards?.working_supply,
    );

    const currentDailyRewards = (() => {
        if (!poolRewards) {
            return '0 AQUA';
        }

        if (!poolRewards.tps || !poolRewards.working_balance || !poolRewards.working_supply) {
            return '0 AQUA';
        }

        return `${formatBalance(dailyRewardsValue, true)} AQUA`;
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
    const hasNextWorkingState = newWorkingBalance !== null && newWorkingSupply !== null;
    const isInitialDataLoading =
        !!account &&
        (isRewardsStatusLoading ||
            isAccountShareLoading ||
            isPoolRewardsLoading ||
            isIncentivesLoading ||
            (isEstimateLoading && estimatedPoolInfo === null));

    if (!account) {
        return null;
    }

    if (isInitialDataLoading) {
        return (
            <PoolInfo $withCardSpacing={withPoolInfoCardSpacing}>
                <PageLoader />
            </PoolInfo>
        );
    }

    return (
        <PoolInfo $withCardSpacing={withPoolInfoCardSpacing}>
            <DescriptionRow>
                <span>Share of Pool</span>
                <span>
                    {formatBalance(sharesBeforePercent, true)}%
                    {!!sharesAfterPercent && (
                        <>
                            <Arrow />
                            {formatBalance(sharesAfterPercent, true)}%
                        </>
                    )}
                </span>
            </DescriptionRow>

            {isRewardsEnabled &&
                (Boolean(Number(pool.reward_tps)) || hasActiveIncentives) &&
                Boolean(Number(pool.total_share)) &&
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
                                            +accountShare + +depositShares,
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

            {isRewardsEnabled && Boolean(Number(pool.reward_tps)) && (
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
        </PoolInfo>
    );
};

export default AddLiquidityPoolInfo;
