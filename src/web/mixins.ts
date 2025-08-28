// eslint-disable-next-line import/named
import { css, CSSObject, Interpolation } from 'styled-components';

import { Breakpoints, COLORS, PAGE_PADDINGS } from './styles';

export const textEllipsis = css`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`;

export const flexAllCenter = css`
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const flexRowSpaceBetween = css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
`;

export const flexColumn = css`
    display: flex;
    flex-direction: column;
`;

export const flexColumnCenter = css`
    display: flex;
    align-items: center;
    flex-direction: column;
`;

export const customScroll = css`
    &::-webkit-scrollbar {
        width: 0.5rem;
    }

    /* Track */
    &::-webkit-scrollbar-track {
        background: ${COLORS.white};
        border-radius: 0.25rem;
    }

    /* Handle */
    &::-webkit-scrollbar-thumb {
        background: ${COLORS.purple};
        border-radius: 0.25rem;
    }
`;

export const cardBoxShadow = css`
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
`;

export const commonMaxWidth = css`
    max-width: 144rem;
    margin: 0 auto;
`;

export const respondUp =
    (breakPoint: Breakpoints) =>
    (...args: [TemplateStringsArray, ...Interpolation<CSSObject>[]]) =>
        css`
            @media (min-width: ${breakPoint}) {
                ${css(...args)};
            }
        `;

export const respondDown =
    (breakPoint: Breakpoints) =>
    (...args: [TemplateStringsArray, ...Interpolation<CSSObject>[]]) =>
        css`
            @media (max-width: ${breakPoint}) {
                ${css(...args)};
            }
        `;

export const contentWithSidebar = css`
    ${commonMaxWidth};
    padding-right: calc(10vw + 20rem);

    &:last-child {
        margin-bottom: 6.6rem;
    }

    ${respondDown(Breakpoints.xxxl)`
        padding-right: calc(10vw + 30rem);
    `}

    ${respondDown(Breakpoints.xxl)`
        padding-right: calc(10vw + 40rem);
    `}

    ${respondDown(Breakpoints.lg)`
        padding: 3.2rem 1.6rem 0;
    `}
`;

export const fullWidthSectionStyles = css`
    width: calc(100% - ${PAGE_PADDINGS.DEFAULT * 2}rem);

    ${respondDown(Breakpoints.sm)`
        width: calc(100% - ${PAGE_PADDINGS.BELOW_SM * 2}rem);
        padding-left: ${PAGE_PADDINGS.BELOW_SM}rem;
        padding-right: ${PAGE_PADDINGS.BELOW_SM}rem;
    `}

    ${respondDown(Breakpoints.xs)`
        width: 100%;
    `}
`;

export const commonSectionPaddings = css`
    ${respondDown(Breakpoints.xl)`
        padding: 0 ${PAGE_PADDINGS.DEFAULT}rem;
    `}

    ${respondDown(Breakpoints.sm)`
        padding: 0 ${PAGE_PADDINGS.BELOW_SM};
    `}
`;
