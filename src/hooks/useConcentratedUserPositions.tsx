import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';

import { getNativePrices } from 'api/amm';

import { loadConcentratedUserPositions } from 'helpers/amm-concentrated-user-positions';

import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService } from 'services/globalServices';

import { PoolProcessed } from 'types/amm';
import { UserDistributionPositionDetail } from 'types/amm-concentrated-liquidity-chart';

export type ConcentratedPositionWithFees = UserDistributionPositionDetail & {
    feesUsd: number;
};

const calculateAmountsUsd = (
    pool: PoolProcessed,
    amounts: string[],
    tokenPrices: Map<string, string>,
) =>
    amounts.reduce((acc, amount, index) => {
        const tokenPriceXlm = new BigNumber(tokenPrices.get(pool.tokens[index].contract) || '0');
        const tokenUsdPrice = tokenPriceXlm.multipliedBy(StellarService.price.priceLumenUsd || 0);

        return acc.plus(new BigNumber(amount || '0').multipliedBy(tokenUsdPrice));
    }, new BigNumber(0));

export const getConcentratedPositionFeesUsd = (
    pool: PoolProcessed,
    position: UserDistributionPositionDetail,
    tokenPrices: Map<string, string>,
) =>
    calculateAmountsUsd(
        pool,
        position.feeEstimates ?? pool.tokens.map(() => '0'),
        tokenPrices,
    ).toNumber();

/**
 * Loads the connected user's concentrated positions for a given pool and enriches
 * each position with the USD value of its uncollected fees.
 *
 * `updateIndex` allows callers to invalidate the cache (e.g. by passing the value
 * returned by `useUpdateIndex`).
 */
const useConcentratedUserPositions = (
    pool: PoolProcessed,
    updateIndex?: number,
): { positions: ConcentratedPositionWithFees[]; loading: boolean } => {
    const { account } = useAuthStore();
    const [positions, setPositions] = useState<ConcentratedPositionWithFees[]>([]);
    const [loading, setLoading] = useState(false);

    const tokenContractsKey = pool.tokens.map(token => token.contract).join(':');

    useEffect(() => {
        if (!account) {
            setPositions([]);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);

        getNativePrices()
            .catch(() => new Map())
            .then(prices => {
                const tokenPrices = new Map(
                    [...prices.entries()].map(([key, value]) => [key, value.price]),
                );

                return loadConcentratedUserPositions(pool, account.accountId()).then(
                    ({ positions: loadedPositions }) =>
                        loadedPositions
                            .slice()
                            .sort((a, b) => new BigNumber(b.liquidity).comparedTo(a.liquidity))
                            .map(position => ({
                                ...position,
                                feesUsd: getConcentratedPositionFeesUsd(
                                    pool,
                                    position,
                                    tokenPrices,
                                ),
                            })),
                );
            })
            .then(loadedPositions => {
                if (!cancelled) {
                    setPositions(loadedPositions);
                }
            })
            .catch(() => undefined)
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [account, pool.address, tokenContractsKey, updateIndex]);

    return { positions, loading };
};

export default useConcentratedUserPositions;
