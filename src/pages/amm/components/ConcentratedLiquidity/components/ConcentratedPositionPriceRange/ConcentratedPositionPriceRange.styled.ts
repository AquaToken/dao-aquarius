import styled from 'styled-components';

import { flexColumn, flexRowSpaceBetween, textEllipsis } from 'styles/mixins';
import { COLORS, FONT_SIZE } from 'styles/style-constants';

export const Container = styled.div`
    ${flexColumn};
    gap: 0.2rem;
    min-width: 0;
`;

export const Header = styled.div`
    ${flexRowSpaceBetween};
    gap: 1.2rem;
    width: 100%;
`;

export const Label = styled.span`
    ${FONT_SIZE.sm};
    color: ${COLORS.textGray};
    ${textEllipsis};
`;

export const Track = styled.div`
    position: relative;
    width: 100%;
    height: 2.3rem;
`;

export const TrackLine = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 0.6rem;
    transform: translateY(-50%);
    border-radius: 4.8rem;
    background: ${COLORS.gray100};
`;

export const ActiveRange = styled.div<{ $left: number; $width: number }>`
    position: absolute;
    left: ${({ $left }) => $left}%;
    top: 50%;
    width: ${({ $width }) => $width}%;
    height: 0.6rem;
    transform: translateY(-50%);
    background: #d3b3e2;

    &::before,
    &::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 0.2rem;
        height: 1rem;
        border-radius: 0.1rem;
        background: #d3b3e2;
        transform: translateY(-50%);
    }

    &::before {
        left: 0;
    }

    &::after {
        right: 0;
    }
`;

export const CurrentMarker = styled.div<{ $left: number; $inRange: boolean }>`
    position: absolute;
    left: ${({ $left }) => $left}%;
    top: 0.2rem;
    width: 1rem;
    height: 1.7rem;
    transform: translateX(-50%);
    color: ${({ $inRange }) => ($inRange ? COLORS.purple400 : COLORS.red500)};

    &::before {
        content: '';
        position: absolute;
        left: 50%;
        top: 0.3rem;
        width: 0;
        height: 0;
        border-left: 0.5rem solid transparent;
        border-right: 0.5rem solid transparent;
        border-top: 0.5rem solid currentColor;
        transform: translateX(-50%);
    }

    &::after {
        content: '';
        position: absolute;
        left: 50%;
        bottom: 0;
        width: 0.2rem;
        height: 1.2rem;
        border-radius: 0.1rem;
        background: currentColor;
        transform: translateX(-50%);
    }
`;

export const Values = styled.div`
    ${flexRowSpaceBetween};
    gap: 1.2rem;
    width: 100%;
    color: ${COLORS.textTertiary};
    ${FONT_SIZE.sm};

    span {
        ${textEllipsis};
        min-width: 0;
    }
`;
