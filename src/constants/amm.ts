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
export const CONCENTRATED_DEPOSIT_PRESETS = [
    {
        key: 'tight',
        label: 'Tight',
        rangeLabel: '-0.3% — +0.3%',
        lowerFactor: 0.997,
        upperFactor: 1.003,
        description: 'Works for stable and low-volatile pairs',
    },
    {
        key: 'medium',
        label: 'Medium',
        rangeLabel: '-20% — +20%',
        lowerFactor: 0.8,
        upperFactor: 1.2,
        description: 'Balanced range for moderately volatile pairs.',
    },
    {
        key: 'wide',
        label: 'Wide',
        rangeLabel: '-50% — +100%',
        lowerFactor: 0.5,
        upperFactor: 2,
        description: 'Works for volatile pairs.',
    },

    {
        key: 'up',
        label: 'One-sided up',
        rangeLabel: '0 — +50%',
        lowerFactor: 1,
        upperFactor: 1.5,
        description: 'Works if you believe that the price will go up.',
    },
    {
        key: 'down',
        label: 'One-sided lower',
        rangeLabel: '-50% — 0',
        lowerFactor: 0.5,
        upperFactor: 1,
        description: 'Works if you believe that the price will go down.',
    },
    {
        key: 'full',
        label: 'Full Range',
        rangeLabel: '',
        lowerFactor: null,
        upperFactor: null,
        description: 'Works like a regular volatile pool across the entire price range.',
    },
] as const;

export const CONCENTRATED_TICK_SPACING_BY_FEE: Record<number, number> = {
    10: 20,
    30: 60,
    100: 200,
};

export const CONCENTRATED_DISTRIBUTION_REFRESH_MS = 5000;
