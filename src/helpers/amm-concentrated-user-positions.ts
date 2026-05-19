import BigNumber from 'bignumber.js';

import { getNativePrices } from 'api/amm';

import { POOL_TYPE } from 'constants/amm';

import { SorobanService, StellarService } from 'services/globalServices';

import { PoolProcessed } from 'types/amm';
import { UserDistributionPositionDetail } from 'types/amm-concentrated-liquidity-chart';

import {
    hydratePositionsLiquidity,
    keyOfPosition,
    normalizePositions,
} from './amm-concentrated-positions';

const mapAmountsByTokenContract = (tokens: PoolProcessed['tokens'], amounts: string[]) =>
    new Map(tokens.map((token, index) => [token.contract, amounts[index] || '0']));

export const loadConcentratedUserPositions = async (
    pool: PoolProcessed,
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
                const withdrawTokens = [...pool.tokens];
                const feeTokens = [...pool.tokens];

                const [withdrawEstimates, feeEstimates] = await Promise.all([
                    SorobanService.amm.estimateWithdrawPosition(
                        accountId,
                        pool.address,
                        withdrawTokens,
                        position.tickLower,
                        position.tickUpper,
                        String(position.liquidity || '0'),
                    ),
                    SorobanService.amm.getPositionFees(
                        pool.address,
                        accountId,
                        feeTokens,
                        position.tickLower,
                        position.tickUpper,
                    ),
                ]);

                const withdrawAmounts = mapAmountsByTokenContract(
                    withdrawTokens,
                    withdrawEstimates,
                );
                const feeAmounts = mapAmountsByTokenContract(feeTokens, feeEstimates);
                const positionFees = pool.tokens.map(
                    token => feeAmounts.get(token.contract) || '0',
                );

                const tokenEstimates = pool.tokens.map((token, index) =>
                    BigNumber.maximum(
                        new BigNumber(withdrawAmounts.get(token.contract) || '0').minus(
                            positionFees[index] || '0',
                        ),
                        0,
                    ).toFixed(),
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
                    feeEstimates: positionFees,
                    liquidityUsd: liquidityUsd.toNumber(),
                } satisfies UserDistributionPositionDetail;
            } catch {
                return {
                    key: keyOfPosition(position),
                    tickLower: position.tickLower,
                    tickUpper: position.tickUpper,
                    liquidity: String(position.liquidity || '0'),
                    tokenEstimates: pool.tokens.map(() => '0'),
                    feeEstimates: pool.tokens.map(() => '0'),
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
