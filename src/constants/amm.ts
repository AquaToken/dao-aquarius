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

export const CONCENTRATED_DEPOSIT_DEFAULT_PRESET_MULTIPLIER = 1.2;
export const CONCENTRATED_DEPOSIT_ESTIMATE_DEBOUNCE_MS = 700;
export const CONCENTRATED_DEPOSIT_PRICE_INPUT_DEBOUNCE_MS = 2000;
export const CONCENTRATED_DEPOSIT_PRESETS = [
    { key: '2', multiplier: 2, label: 'x÷2' },
    { key: '1.2', multiplier: 1.2, label: 'x÷1.2' },
    { key: '1.01', multiplier: 1.01, label: 'x÷1.01' },
] as const;

export const CONCENTRATED_DISTRIBUTION_REFRESH_MS = 5000;
