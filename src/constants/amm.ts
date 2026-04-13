export enum POOL_TYPE {
    stable = 'stable',
    constant = 'constant_product',
    concentrated = 'concentrated',
    classic = 'classic',
}

export const CLAIM_ALL_COUNT = 5;

export const CONCENTRATED_TICK_BASE = 1.0001;
export const CONCENTRATED_TICK_LOG_BASE = Math.log(CONCENTRATED_TICK_BASE);
export const CONCENTRATED_MIN_TICK = -887272;
export const CONCENTRATED_MAX_TICK = 887272;

export const CONCENTRATED_LIQUIDITY_CHART_WIDTH = 1000;
export const CONCENTRATED_LIQUIDITY_CHART_HEIGHT = 260;
export const CONCENTRATED_LIQUIDITY_CHART_MARGIN = {
    top: 22,
    right: 16,
    bottom: 28,
    left: 84,
};
export const CONCENTRATED_LIQUIDITY_CHART_ZOOM_MIN = 1;
export const CONCENTRATED_LIQUIDITY_CHART_ZOOM_MAX = 256;

export const CONCENTRATED_DEPOSIT_DEFAULT_PRESET_KEY = 'wide';
export const CONCENTRATED_DEPOSIT_ESTIMATE_DEBOUNCE_MS = 700;
export const CONCENTRATED_DEPOSIT_PRICE_INPUT_DEBOUNCE_MS = 2000;
export const CONCENTRATED_AMOUNT_INPUT_MAX_DECIMALS = 10;
export const CONCENTRATED_WITHDRAW_ESTIMATE_DEBOUNCE_MS = 400;
export const CONCENTRATED_DEPOSIT_PRESETS = [
    {
        key: 'tight',
        label: 'Tight',
        rangeLabel: '-0.3% — +0.3%',
        lowerFactor: 0.997,
        upperFactor: 1.003,
        description:
            'Works for stable and low-volatility pairs. Your liquidity will be concentrated from 0.3% below the current price to 0.3% above it.',
    },
    {
        key: 'medium',
        label: 'Medium',
        rangeLabel: '-20% — +20%',
        lowerFactor: 0.8,
        upperFactor: 1.2,
        description:
            'Works for moderately volatile pairs. Your liquidity will be concentrated from 20% below the current price to 20% above it.',
    },
    {
        key: 'wide',
        label: 'Wide',
        rangeLabel: '-50% — +100%',
        lowerFactor: 0.5,
        upperFactor: 2,
        description:
            'Works for volatile pairs. Your liquidity will be concentrated from 50% of the current price to double the current price.',
    },

    {
        key: 'up',
        label: 'One-sided up',
        rangeLabel: '0% — +50%',
        lowerFactor: 1,
        upperFactor: 1.5,
        description:
            'Works if you believe the price will go up. Your liquidity will be concentrated from the current price to 50% above it.',
    },
    {
        key: 'down',
        label: 'One-sided lower',
        rangeLabel: '-50% — 0%',
        lowerFactor: 0.5,
        upperFactor: 1,
        description:
            'Works if you believe the price will go down. Your liquidity will be concentrated from 50% below the current price to the current price.',
    },
    {
        key: 'full',
        label: 'Full Range',
        rangeLabel: 'All ticks',
        lowerFactor: null,
        upperFactor: null,
        description:
            'Works like a regular volatile pool. Your liquidity will be spread across the entire available price range.',
    },
] as const;

export const CONCENTRATED_TICK_SPACING_BY_FEE: Record<number, number> = {
    10: 20,
    30: 60,
    100: 200,
};

export const CONCENTRATED_DISTRIBUTION_REFRESH_MS = 5000;
