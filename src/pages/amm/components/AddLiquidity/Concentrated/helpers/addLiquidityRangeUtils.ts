import BigNumber from 'bignumber.js';

import { clamp, priceToTick, snapDown, snapUp, tickToPrice } from 'helpers/amm-concentrated';

type ResolvePresetTicksParams = {
    tickSpacing: number | null;
    referencePriceValue: number;
    decimalsDiff: number;
    minTickBound: number;
    maxTickBound: number;
    lowerFactor: number;
    upperFactor: number;
};

export const resolvePresetTicks = ({
    tickSpacing,
    referencePriceValue,
    decimalsDiff,
    minTickBound,
    maxTickBound,
    lowerFactor,
    upperFactor,
}: ResolvePresetTicksParams) => {
    if (
        tickSpacing === null ||
        !Number.isFinite(referencePriceValue) ||
        referencePriceValue <= 0 ||
        !Number.isFinite(lowerFactor) ||
        !Number.isFinite(upperFactor) ||
        lowerFactor <= 0 ||
        upperFactor <= 0
    ) {
        return null;
    }

    const lowerPrice = referencePriceValue * lowerFactor;
    const upperPrice = referencePriceValue * upperFactor;
    const nextLower = clamp(
        snapDown(priceToTick(lowerPrice, decimalsDiff), tickSpacing),
        minTickBound,
        maxTickBound - tickSpacing,
    );
    const nextUpper = clamp(
        snapUp(priceToTick(upperPrice, decimalsDiff), tickSpacing),
        nextLower + tickSpacing,
        maxTickBound,
    );

    return [nextLower, nextUpper] as const;
};

type GetInRangeAmount1PerAmount0Params = {
    rangeLower: number | null;
    rangeUpper: number | null;
    referencePriceValue: number;
    decimalsDiff: number;
};

export const getInRangeAmount1PerAmount0 = ({
    rangeLower,
    rangeUpper,
    referencePriceValue,
    decimalsDiff,
}: GetInRangeAmount1PerAmount0Params) => {
    if (rangeLower === null || rangeUpper === null) {
        return null;
    }
    if (!Number.isFinite(referencePriceValue) || referencePriceValue <= 0) {
        return null;
    }

    const lowerPrice = tickToPrice(rangeLower, decimalsDiff);
    const upperPrice = tickToPrice(rangeUpper, decimalsDiff);
    if (!Number.isFinite(lowerPrice) || !Number.isFinite(upperPrice)) {
        return null;
    }
    if (lowerPrice <= 0 || upperPrice <= 0) {
        return null;
    }

    const sqrtPl = new BigNumber(lowerPrice).sqrt();
    const sqrtPu = new BigNumber(upperPrice).sqrt();
    const sqrtP = new BigNumber(referencePriceValue).sqrt();
    const denominator = sqrtPu.minus(sqrtP);

    if (!denominator.isFinite() || denominator.isZero()) {
        return null;
    }

    const ratio = sqrtP
        .minus(sqrtPl)
        .multipliedBy(sqrtP)
        .multipliedBy(sqrtPu)
        .dividedBy(denominator);

    return ratio.isFinite() && ratio.gt(0) ? ratio : null;
};

type NormalizeForRangeParams = {
    rawAmount0: string;
    rawAmount1: string;
    nextTickLower: number | null;
    nextTickUpper: number | null;
    isEmptyPool: boolean;
    currentTick: number;
    decimalsToken0: number;
    decimalsToken1: number;
    getRatio: (lower: number | null, upper: number | null) => BigNumber | null;
    formatAmount: (value: BigNumber.Value, decimals: number) => string;
    recalculateInRange?: boolean;
    anchor?: 'token0' | 'token1';
};

export const normalizeForRange = ({
    rawAmount0,
    rawAmount1,
    nextTickLower,
    nextTickUpper,
    isEmptyPool,
    currentTick,
    decimalsToken0,
    decimalsToken1,
    getRatio,
    formatAmount,
    recalculateInRange,
    anchor = 'token0',
}: NormalizeForRangeParams) => {
    const normalizedAmount0 = rawAmount0.replaceAll(',', '').trim();
    const normalizedAmount1 = rawAmount1.replaceAll(',', '').trim();
    if (nextTickLower === null || nextTickUpper === null) {
        return { amount0: normalizedAmount0, amount1: normalizedAmount1 };
    }
    if (isEmptyPool) {
        return { amount0: normalizedAmount0, amount1: normalizedAmount1 };
    }

    const isBelow = Number.isFinite(currentTick) && currentTick > nextTickUpper;
    const isAbove = Number.isFinite(currentTick) && currentTick < nextTickLower;

    if (isBelow) {
        return { amount0: '0', amount1: normalizedAmount1 };
    }
    if (isAbove) {
        return { amount0: normalizedAmount0, amount1: '0' };
    }

    const ratio = getRatio(nextTickLower, nextTickUpper);
    if (ratio === null) {
        return { amount0: normalizedAmount0, amount1: normalizedAmount1 };
    }

    const amount0Value = new BigNumber(normalizedAmount0 || 0);
    const amount1Value = new BigNumber(normalizedAmount1 || 0);
    const hasAmount0 = amount0Value.gt(0);
    const hasAmount1 = amount1Value.gt(0);

    if (recalculateInRange) {
        if (anchor === 'token0' && hasAmount0) {
            return {
                amount0: normalizedAmount0,
                amount1: formatAmount(amount0Value.multipliedBy(ratio), decimalsToken1),
            };
        }
        if (anchor === 'token1' && hasAmount1) {
            return {
                amount0: formatAmount(amount1Value.dividedBy(ratio), decimalsToken0),
                amount1: normalizedAmount1,
            };
        }
    }

    if (hasAmount0 && !hasAmount1) {
        return {
            amount0: normalizedAmount0,
            amount1: formatAmount(amount0Value.multipliedBy(ratio), decimalsToken1),
        };
    }
    if (hasAmount1 && !hasAmount0) {
        return {
            amount0: formatAmount(amount1Value.dividedBy(ratio), decimalsToken0),
            amount1: normalizedAmount1,
        };
    }

    return { amount0: normalizedAmount0, amount1: normalizedAmount1 };
};
