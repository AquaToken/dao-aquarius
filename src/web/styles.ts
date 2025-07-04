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

export const FONT_FAMILY = {
    roboto: 'Roboto, sans-serif',
};

export const FONT_SIZE = {
    sm: css`
        font-size: 1.4rem;
        line-height: 2rem;
    `,
    md: css`
        font-size: 1.6rem;
        line-height: 2.8rem;
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
