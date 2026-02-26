import BigNumber from 'bignumber.js';

import { CONCENTRATED_TICK_BASE, CONCENTRATED_TICK_LOG_BASE } from 'constants/amm';

import { contractValueToAmount } from 'helpers/amount';
import { formatBalance } from 'helpers/format-number';

export const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

export const snapDown = (value: number, spacing: number) => Math.floor(value / spacing) * spacing;

export const snapUp = (value: number, spacing: number) => Math.ceil(value / spacing) * spacing;

export const tickToPrice = (tick: number, decimalsDiff: number) =>
    Math.pow(CONCENTRATED_TICK_BASE, tick) * Math.pow(10, decimalsDiff);

export const priceToTick = (price: number, decimalsDiff: number) =>
    Math.log(price * Math.pow(10, -decimalsDiff)) / CONCENTRATED_TICK_LOG_BASE;

export const formatConcentratedPrice = (value: number) => {
    if (!Number.isFinite(value) || value <= 0) {
        return '-';
    }

    if (value >= 1_000_000_000 || value < 0.000001) {
        return value.toExponential(4);
    }

    return value >= 1
        ? value.toLocaleString(undefined, { maximumFractionDigits: 6 })
        : value.toLocaleString(undefined, { maximumFractionDigits: 10 });
};

export const formatConcentratedChartPrice = (value: number) => {
    if (!Number.isFinite(value) || value <= 0) {
        return '-';
    }

    if (value >= 1_000_000_000 || value < 0.000001) {
        return value.toExponential(2);
    }

    return formatBalance(value, true);
};

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

    const decimals = value >= 1 ? 6 : 10;
    return value.toFixed(decimals).replace(/\.?0+$/, '');
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

export const formatConcentratedLiquidityValue = (value: string | number, decimals: number) =>
    formatBalance(Number(contractValueToAmount(String(value || 0), decimals)), true);

export const parseConcentratedPercent = (value: string) => {
    const normalized = value.trim();
    if (normalized === '') {
        return null;
    }

    const percent = new BigNumber(normalized);
    return percent.isFinite() ? percent : null;
};
