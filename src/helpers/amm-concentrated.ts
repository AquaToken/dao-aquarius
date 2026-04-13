import BigNumber from 'bignumber.js';

import {
    CONCENTRATED_AMOUNT_INPUT_MAX_DECIMALS,
    CONCENTRATED_TICK_BASE,
    CONCENTRATED_TICK_LOG_BASE,
} from 'constants/amm';

import { formatBalance } from 'helpers/format-number';

export const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

export const snapDown = (value: number, spacing: number) => Math.floor(value / spacing) * spacing;

export const snapUp = (value: number, spacing: number) => Math.ceil(value / spacing) * spacing;

export const tickToPrice = (tick: number, decimalsDiff: number) =>
    Math.pow(CONCENTRATED_TICK_BASE, tick) * Math.pow(10, decimalsDiff);

export const priceToTick = (price: number, decimalsDiff: number) =>
    Math.log(price * Math.pow(10, -decimalsDiff)) / CONCENTRATED_TICK_LOG_BASE;

export const parseConcentratedPriceInput = (value: string) => {
    const normalized = value.replaceAll(',', '').trim();
    if (normalized === '') {
        return null;
    }

    const parsed = new BigNumber(normalized);
    if (!parsed.isFinite() || parsed.lte(0)) {
        return null;
    }

    return parsed.toNumber();
};

export const formatConcentratedPriceInputValue = (value: number) => {
    if (!Number.isFinite(value) || value <= 0) {
        return '';
    }

    if (value >= 1_000_000_000 || value < 0.000001) {
        return value.toExponential(6);
    }

    return formatBalance(value, false, false, value >= 1 ? 6 : 10);
};

export const parseConcentratedAmount = (value: string) => {
    const normalized = value.replaceAll(',', '').trim();
    if (normalized === '') {
        return null;
    }

    const parsed = new BigNumber(normalized);
    return parsed.isFinite() ? parsed : null;
};

export const isValidNonNegativeConcentratedAmount = (value: string) => {
    const parsed = parseConcentratedAmount(value);
    return parsed !== null && parsed.gte(0);
};

export const formatConcentratedAmountInputValue = (
    value: BigNumber.Value,
    decimals: number,
    precision: number = decimals,
) => {
    const bnValue = new BigNumber(value);
    if (!bnValue.isFinite() || bnValue.lt(0)) {
        return '';
    }
    if (bnValue.isZero()) {
        return '0';
    }

    const fixed = bnValue.toFixed(Math.min(precision, decimals));
    const normalized = fixed.replace(/\.?0+$/, '');
    return normalized === '' ? '0' : normalized;
};

export const formatConcentratedDerivedAmount = (value: BigNumber.Value, decimals: number) =>
    formatConcentratedAmountInputValue(value, decimals, CONCENTRATED_AMOUNT_INPUT_MAX_DECIMALS);

export const parseConcentratedPercent = (value: string) => {
    const normalized = value.trim();
    if (normalized === '') {
        return null;
    }

    const percent = new BigNumber(normalized);
    return percent.isFinite() ? percent : null;
};
