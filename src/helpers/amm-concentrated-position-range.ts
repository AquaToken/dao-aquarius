import { PoolProcessed } from 'types/amm';
import { UserDistributionPositionDetail } from 'types/amm-concentrated-liquidity-chart';

import { clamp, formatConcentratedPriceInputValue, tickToPrice } from './amm-concentrated';
import { isFullRangePosition } from './amm-concentrated-positions';

export type ConcentratedRangeMetrics = {
    inRange: boolean;
    activeLeft: number;
    activeWidth: number;
    markerLeft: number;
    minLabel: string;
    maxLabel: string;
    isFullRange: boolean;
};

export const formatConcentratedPrice = (value: number) =>
    formatConcentratedPriceInputValue(value) || '0';

export const isPositionInRange = (
    pool: Pick<PoolProcessed, 'current_tick'>,
    position: Pick<UserDistributionPositionDetail, 'tickLower' | 'tickUpper'>,
) => {
    const currentTick = Number(pool.current_tick);

    return (
        Number.isFinite(currentTick) &&
        currentTick >= position.tickLower &&
        currentTick <= position.tickUpper
    );
};

export const getConcentratedRangeMetrics = (
    pool: PoolProcessed,
    position: UserDistributionPositionDetail,
): ConcentratedRangeMetrics => {
    const decimalsDiff = pool.tokens[0].decimal - pool.tokens[1].decimal;
    const currentTick = Number(pool.current_tick);
    const tickSpacing = Number(pool.tick_spacing);
    const isFullRange = isFullRangePosition(position, tickSpacing);
    const hasCurrentTick = Number.isFinite(currentTick);
    const inRange = isPositionInRange(pool, position);

    if (isFullRange) {
        return {
            inRange,
            activeLeft: 0,
            activeWidth: 100,
            markerLeft: hasCurrentTick ? 50 : 0,
            minLabel: 'Full Range',
            maxLabel: 'Full Range',
            isFullRange,
        };
    }

    const rangeWidth = Math.max(position.tickUpper - position.tickLower, tickSpacing || 1, 1);
    const domainMin =
        Math.min(position.tickLower, hasCurrentTick ? currentTick : position.tickLower) -
        rangeWidth * 0.2;
    const domainMax =
        Math.max(position.tickUpper, hasCurrentTick ? currentTick : position.tickUpper) +
        rangeWidth * 0.2;
    const domainWidth = Math.max(domainMax - domainMin, 1);
    const toPercent = (tick: number) => clamp(((tick - domainMin) / domainWidth) * 100, 0, 100);
    const activeLeft = toPercent(position.tickLower);
    const activeRight = toPercent(position.tickUpper);

    return {
        inRange,
        activeLeft,
        activeWidth: Math.max(activeRight - activeLeft, 0.5),
        markerLeft: hasCurrentTick ? toPercent(currentTick) : activeLeft,
        minLabel: `Min: ${formatConcentratedPrice(tickToPrice(position.tickLower, decimalsDiff))}`,
        maxLabel: `Max: ${formatConcentratedPrice(tickToPrice(position.tickUpper, decimalsDiff))}`,
        isFullRange,
    };
};
