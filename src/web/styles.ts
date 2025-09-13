import { css } from 'styled-components';

export const COLORS = {
    transparent: 'transparent',
    white: '#ffffff',
    titleText: '#23024D',
    descriptionText: '#000427',
    paragraphText: '#000636',
    grayText: '#6B6C83',
    darkGrayText: '#4B4E67',
    lavenderGray: '#9A9BAA',
    buttonBackground: '#23024D',
    purple: '#872AB0',
    tooltip: '#8620B9',
    background: '#5C1283',
    deepPurple: '#6D29B5',
    royalPurple: '#461685',
    extralightPurple: '#F3EAF7',
    gray: '#E8E8ED',
    lightGray: '#FAFAFB',
    placeholder: '#B3B4C3',
    darkPurple: '#24034F',
    lightPurple: '#dab0ed',
    pinkRed: '#FF3461',
    yellow: '#F8D26C',
    green: '#00B796',
    orange: '#FF8F00',
    border: '#E9E6ED',
    blue: '#2E30F0',
    darkBlue: '#1127E9',
    discordBlurple: '#5865F2',
    classicPool: '#4F345B',
    constantPool: '#B0632A',
    stablePool: '#2AA3B0',
    // Focus color should be different of any project colors for visability
    focusColor: '#24b1c7',
    black: '#000000',
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
