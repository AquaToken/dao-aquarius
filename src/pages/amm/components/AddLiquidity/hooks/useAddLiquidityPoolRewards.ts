import { useEffect, useMemo, useState } from 'react';

import useAuthStore from 'store/authStore/useAuthStore';

import { SorobanService } from 'services/globalServices';

import { PoolExtended, PoolIncentives, PoolRewardsInfo } from 'types/amm';

export const useAddLiquidityPoolRewards = (pool: PoolExtended) => {
    const { account } = useAuthStore();

    const [poolRewards, setPoolRewards] = useState<PoolRewardsInfo>(null);
    const [incentives, setIncentives] = useState<PoolIncentives[] | null>(null);
    const [isRewardsEnabled, setIsRewardsEnabled] = useState<boolean | null>(null);
    const [isRewardsStatusLoading, setIsRewardsStatusLoading] = useState(false);
    const [isPoolRewardsLoading, setIsPoolRewardsLoading] = useState(false);
    const [isIncentivesLoading, setIsIncentivesLoading] = useState(false);

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

    return {
        account,
        poolRewards,
        incentives,
        isRewardsEnabled,
        hasActiveIncentives,
        isRewardsStatusLoading,
        isPoolRewardsLoading,
        isIncentivesLoading,
    };
};
