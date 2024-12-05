/* eslint-disable prefer-spread */
import { css, FlattenSimpleInterpolation, Interpolation } from 'styled-components';

import { Breakpoints, COLORS } from './styles';

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
    padding-right: 1rem;
    &::-webkit-scrollbar {
        width: 0.5rem;
    }

    /* Track */
    &::-webkit-scrollbar-track {
        background: ${COLORS.white};
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
    (...args: Interpolation<any>[]): FlattenSimpleInterpolation =>
        css`
            @media (min-width: ${breakPoint}) {
                ${css.apply(null, args)};
            }
        `;
export const respondDown =
    (breakPoint: Breakpoints) =>
    (...args: Interpolation<any>[]): FlattenSimpleInterpolation =>
        css`
            @media (max-width: ${breakPoint}) {
                ${css.apply(null, args)};
            }
        `;
