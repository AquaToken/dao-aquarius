import { roundToPrecision } from 'helpers/format-number';

export const getPercentValue = (value: number, total: number, numDecimals = 1): string =>
    roundToPrecision((value / total) * 100, numDecimals);
