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
