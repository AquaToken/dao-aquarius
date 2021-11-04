/* eslint-disable prefer-spread */
import {css, FlattenSimpleInterpolation, SimpleInterpolation} from 'styled-components';
import {Breakpoints} from './styles';

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

export const commonMaxWidth = css`
    max-width: 144rem;
    margin: 0 auto;
`;

export const respondUp =
    (breakPoint: Breakpoints) =>
    (...args: SimpleInterpolation[]): FlattenSimpleInterpolation =>
        css`
            @media (min-width: ${breakPoint}) {
                ${css.apply(null, args)};
            }
        `;
export const respondDown =
    (breakPoint: Breakpoints) =>
    (...args: SimpleInterpolation[]): FlattenSimpleInterpolation =>
        css`
            @media (max-width: ${breakPoint}) {
                ${css.apply(null, args)};
            }
        `;
