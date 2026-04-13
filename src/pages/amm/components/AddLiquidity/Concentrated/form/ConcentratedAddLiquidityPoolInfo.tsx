import BigNumber from 'bignumber.js';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { getUserPools } from 'api/amm';

import { contractValueToAmount } from 'helpers/amount';

import { useDebounce } from 'hooks/useDebounce';

import { SorobanService } from 'services/globalServices';

import { PoolExtended } from 'types/amm';

import PageLoader from 'basics/loaders/PageLoader';

import AddLiquidityRewardsInfo from '../../AddLiquidityRewardsInfo';
import { useAddLiquidityPoolRewards } from '../../hooks/useAddLiquidityPoolRewards';
import { PoolInfo } from '../../Regular/AddLiquidity.styled';

type Props = {
    pool: PoolExtended;
    amounts: Map<string, string>;
    withPoolInfoCardSpacing: boolean;
    tickLower: number | null;
    tickUpper: number | null;
};

type EstimatedPoolInfo = {
    depositShares: number | null;
    newWorkingBalance: number | null;
    newWorkingSupply: number | null;
};

const ConcentratedAddLiquidityPoolInfo = ({
    pool,
    amounts,
    withPoolInfoCardSpacing,
    tickLower,
    tickUpper,
}: Props): React.ReactNode => {
    const {
        account,
        poolRewards,
        incentives,
        isRewardsEnabled,
        hasActiveIncentives,
        isRewardsStatusLoading,
        isPoolRewardsLoading,
        isIncentivesLoading,
    } = useAddLiquidityPoolRewards(pool);
    const [accountShare, setAccountShare] = useState<string | null>(null);
    const [isAccountShareLoading, setIsAccountShareLoading] = useState(false);
    const [isEstimateLoading, setIsEstimateLoading] = useState(false);
    const [estimatedPoolInfo, setEstimatedPoolInfo] = useState<EstimatedPoolInfo | null>(null);
    const estimateRequestIdRef = useRef(0);

    useEffect(() => {
        if (!account) {
            setAccountShare(null);
            setIsAccountShareLoading(false);
            return;
        }

        setIsAccountShareLoading(true);
        getUserPools(account.accountId())
            .then(userPools => {
                const userPool = userPools.find(({ address }) => address === pool.address);

                return contractValueToAmount(String(userPool?.balance ?? '0'));
            })
            .then(setAccountShare)
            .finally(() => setIsAccountShareLoading(false));
    }, [account, pool.address]);

    const debouncedAmounts = useDebounce(amounts, 1000);
    const hasAnyPositiveAmount = useMemo(
        () => [...debouncedAmounts.current.values()].some(value => Number(value) > 0),
        [debouncedAmounts],
    );

    useEffect(() => {
        if (
            !account ||
            [...debouncedAmounts.current.values()].some(value => Number.isNaN(+value)) ||
            tickLower === null ||
            tickUpper === null ||
            !hasAnyPositiveAmount
        ) {
            setEstimatedPoolInfo(null);
            setIsEstimateLoading(false);
            return;
        }

        const requestId = estimateRequestIdRef.current + 1;
        estimateRequestIdRef.current = requestId;
        setIsEstimateLoading(true);

        Promise.all([
            SorobanService.amm.estimateDepositPosition(
                account.accountId(),
                pool.address,
                pool.tokens,
                tickLower,
                tickUpper,
                debouncedAmounts.current,
            ),
            SorobanService.amm.getPosition(pool.address, account.accountId(), tickLower, tickUpper),
        ])
            .then(([estimateResult, position]) => {
                const depositShares = Number(
                    contractValueToAmount(estimateResult?.liquidity || '0'),
                );

                if (!depositShares) {
                    return { depositShares, newWorkingBalance: null, newWorkingSupply: null };
                }

                const nextLiquidity = new BigNumber(position?.liquidity || '0')
                    .plus(estimateResult?.liquidity || '0')
                    .toFixed(0);

                return SorobanService.amm
                    .estimateConcentratedWorkingBalanceAndSupply(
                        account.accountId(),
                        pool.address,
                        tickLower,
                        tickUpper,
                        nextLiquidity,
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
            .catch(() => {
                if (requestId !== estimateRequestIdRef.current) {
                    return;
                }

                setEstimatedPoolInfo(null);
            })
            .finally(() => {
                if (requestId === estimateRequestIdRef.current) {
                    setIsEstimateLoading(false);
                }
            });
    }, [
        account,
        pool.address,
        pool.tokens,
        debouncedAmounts,
        hasAnyPositiveAmount,
        tickLower,
        tickUpper,
    ]);

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
            <AddLiquidityRewardsInfo
                poolRewardTps={pool.reward_tps}
                poolTotalShare={pool.total_share}
                poolRewards={poolRewards}
                incentives={incentives}
                isRewardsEnabled={isRewardsEnabled}
                hasActiveIncentives={hasActiveIncentives}
                accountShare={accountShare}
                depositShares={estimatedPoolInfo?.depositShares ?? null}
                newWorkingBalance={estimatedPoolInfo?.newWorkingBalance ?? null}
                newWorkingSupply={estimatedPoolInfo?.newWorkingSupply ?? null}
            />
        </PoolInfo>
    );
};

export default ConcentratedAddLiquidityPoolInfo;
