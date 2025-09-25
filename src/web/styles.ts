import { css } from 'styled-components';

export const COLORS = {
    // Text colors
    textPrimary: '#23024D',
    textSecondary: '#000427',
    textTertiary: '#000636',
    textGray: '#6B6C83',
    textDark: '#4B4E67',

    // Transparent and basic
    transparent: 'transparent',
    white: '#ffffff',
    black: '#000000',

    // Gray scale
    gray10: '#F0F0F0',
    gray50: '#FAFAFB',
    gray100: '#E8E8ED',
    gray200: '#B3B4C3',
    gray300: '#9A9BAA',
    gray400: '#6B6C83',
    gray500: '#4B4E67',
    gray550: '#4D4F68',
    gray600: '#E9E6ED',

    // Purple scale
    purple50: '#F3EAF7',
    purple100: '#dab0ed',
    purple200: '#BF63FF',
    purple300: '#4F345B',
    purple400: '#8620B9',
    purple500: '#872AB0',
    purple600: '#6D29B5',
    purple700: '#5C1283',
    purple800: '#461685',
    purple900: '#24034F',
    purple950: '#23024D',
    purple990: '#270158',

    // Blue scale
    blue300: '#2AA3B0',
    blue500: '#2E30F0',
    blue550: '#3918AC',
    blue600: '#5865F2',
    blue700: '#1127E9',

    // Cyan scale
    cyan500: '#24b1c7',

    // Green scale
    green500: '#00B796',

    // Yellow scale
    yellow500: '#F8D26C',

    // Orange scale
    orange300: '#B0632A',
    orange500: '#FF8F00',

    // Pink scale
    pink500: '#FF3461',
};

/**
 * Returns an 8-character HEX (#RRGGBBAA) from a HEX color and opacity percentage.
 * Supports: "#RGB", "RGB", "#RRGGBB", "RRGGBB", "#RRGGBBAA".
 */
export const hexWithOpacity = (hex: string, opacityPercent: number): string => {
    if (!hex) {
        throw new Error('hex is required');
    }

    const raw = hex.trim().replace(/^#/, '');
    let rgb: string;

    if (raw.length === 3) {
        // expand shorthand #RGB to #RRGGBB
        rgb = raw
            .split('')
            .map(ch => ch + ch)
            .join('');
    } else if (raw.length === 6) {
        rgb = raw;
    } else if (raw.length === 8) {
        // drop existing alpha, replace with new one
        rgb = raw.slice(0, 6);
    } else {
        throw new Error('Unsupported HEX format. Use #RGB, #RRGGBB or #RRGGBBAA.');
    }

    let pct = Number(opacityPercent);
    if (Number.isNaN(pct)) {
        throw new Error('opacityPercent must be a number');
    }

    // clamp between 0 and 100
    pct = Math.max(0, Math.min(100, pct));

    // convert percentage to 0..255 alpha
    const alpha = Math.round((pct * 255) / 100);

    // convert to 2-digit HEX
    const aa = alpha.toString(16).padStart(2, '0').toUpperCase();

    return `#${rgb.toUpperCase()}${aa}`;
};

export const FONT_FAMILY = {
    roboto: 'Roboto, sans-serif',
};

export const FONT_SIZE = {
    xs: css`
        font-size: 1rem;
        line-height: 2rem;
    `,
    sm: css`
        font-size: 1.4rem;
        line-height: 2rem;
    `,
    md: css`
        font-size: 1.6rem;
        line-height: 2.8rem;
    `,
    lg: css`
        font-size: 2rem;
        line-height: 2.2rem;
    `,
    xl: css`
        font-size: 3rem;
        line-height: 3.6rem;
    `,
    xxl: css`
        font-size: 5.6rem;
        line-height: 6.4rem;
    `,
};

export const Z_INDEX = {
    header: 30,
    accountMenu: 450,
    tooltip: 400,
    modal: 500,
    toast: 600,
};

export enum Breakpoints {
    xs = '480px',
    sm = '768px',
    md = '992px',
    lg = '1200px',
    xl = '1400px',
    xxl = '1600px',
    xxxl = '1800px',
}

export const MAX_WIDTHS = {
    common: '122rem',
    wide: '136rem',
};

// in rem
export const PAGE_PADDINGS = 2.4;
export const HEADER_HEIGHT = '11.2rem';
