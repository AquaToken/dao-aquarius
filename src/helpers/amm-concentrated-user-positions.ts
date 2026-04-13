import BigNumber from 'bignumber.js';

import { getNativePrices } from 'api/amm';

import { POOL_TYPE } from 'constants/amm';

import { SorobanService, StellarService } from 'services/globalServices';

import { PoolExtended } from 'types/amm';
import { UserDistributionPositionDetail } from 'types/amm-concentrated-liquidity-chart';

import {
    hydratePositionsLiquidity,
    keyOfPosition,
    normalizePositions,
} from './amm-concentrated-positions';

export const loadConcentratedUserPositions = async (
    pool: PoolExtended,
    accountId?: string,
): Promise<{
    positions: UserDistributionPositionDetail[];
    rawLiquidity: string;
}> => {
    if (!accountId || pool.pool_type !== POOL_TYPE.concentrated) {
        return { positions: [], rawLiquidity: '0' };
    }

    const snapshot = await SorobanService.amm.getUserPositionSnapshot(pool.address, accountId);
    const ranges = normalizePositions(snapshot);

    if (!ranges.length) {
        return {
            positions: [],
            rawLiquidity: String(snapshot?.raw_liquidity ?? '0'),
        };
    }

    const hydrated = await hydratePositionsLiquidity(ranges, async range => {
        const position = await SorobanService.amm.getPosition(
            pool.address,
            accountId,
            range.tickLower,
            range.tickUpper,
        );

        return position?.liquidity;
    });

    const nonEmptyPositions = hydrated.filter(item => new BigNumber(item.liquidity || 0).gt(0));

    if (!nonEmptyPositions.length) {
        return {
            positions: [],
            rawLiquidity: String(snapshot?.raw_liquidity ?? '0'),
        };
    }

    const prices = await getNativePrices().catch(() => new Map());
    const tokenPrices = new Map([...prices.entries()].map(([key, value]) => [key, value.price]));

    const positions = await Promise.all(
        nonEmptyPositions.map(async position => {
            try {
                const tokenEstimates = await SorobanService.amm.estimateWithdrawPosition(
                    accountId,
                    pool.address,
                    pool.tokens,
                    position.tickLower,
                    position.tickUpper,
                    String(position.liquidity || '0'),
                );
                const liquidityUsd = tokenEstimates.reduce((acc, amount, index) => {
                    const tokenPriceXlm = new BigNumber(
                        tokenPrices.get(pool.tokens[index].contract) || '0',
                    );
                    const tokenUsdPrice = tokenPriceXlm.multipliedBy(
                        StellarService.price.priceLumenUsd || 0,
                    );

                    return acc.plus(new BigNumber(amount || '0').multipliedBy(tokenUsdPrice));
                }, new BigNumber(0));

                return {
                    key: keyOfPosition(position),
                    tickLower: position.tickLower,
                    tickUpper: position.tickUpper,
                    liquidity: String(position.liquidity || '0'),
                    tokenEstimates,
                    liquidityUsd: liquidityUsd.toNumber(),
                } satisfies UserDistributionPositionDetail;
            } catch {
                return {
                    key: keyOfPosition(position),
                    tickLower: position.tickLower,
                    tickUpper: position.tickUpper,
                    liquidity: String(position.liquidity || '0'),
                    tokenEstimates: pool.tokens.map(() => '0'),
                    liquidityUsd: 0,
                } satisfies UserDistributionPositionDetail;
            }
        }),
    );

    return {
        positions,
        rawLiquidity: String(snapshot?.raw_liquidity ?? '0'),
    };
};
