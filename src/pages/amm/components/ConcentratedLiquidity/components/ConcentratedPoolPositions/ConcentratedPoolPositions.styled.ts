import styled from 'styled-components';

import { flexColumn, flexRowSpaceBetween, respondDown, textEllipsis } from 'styles/mixins';
import { Breakpoints, COLORS, FONT_SIZE } from 'styles/style-constants';

export const Card = styled.div`
    ${flexColumn};
    gap: 3.2rem;
    width: 100%;
    padding: 3.2rem;
    background: ${COLORS.white};
    border-radius: 0.6rem;

    ${respondDown(Breakpoints.md)`
        padding: 2.4rem 1.6rem;
        gap: 2.4rem;
    `}
`;

export const Header = styled.div`
    ${flexRowSpaceBetween};
    gap: 1.6rem;
    width: 100%;

    ${respondDown(Breakpoints.sm)`
        align-items: flex-start;
        flex-direction: column;
    `}
`;

export const Title = styled.h5`
    ${FONT_SIZE.lg};
    line-height: 2.8rem;
    color: ${COLORS.textTertiary};
`;

export const CurrentPrice = styled.div`
    ${FONT_SIZE.sm};
    color: ${COLORS.textGray};
    white-space: nowrap;

    span {
        color: ${COLORS.textPrimary};
    }
`;

export const Positions = styled.div`
    ${flexColumn};
    width: 100%;
`;

export const Position = styled.div`
    ${flexColumn};
    gap: 1.6rem;
    width: 100%;

    &:not(:last-child) {
        padding-bottom: 3.2rem;
        margin-bottom: 3.2rem;
        border-bottom: 0.1rem solid ${COLORS.gray100};
    }
`;

export const PositionHeader = styled.div`
    ${flexRowSpaceBetween};
    align-items: flex-start;
    gap: 2rem;
    width: 100%;
`;

export const PositionMain = styled.div`
    ${flexColumn};
    gap: 0.8rem;
    min-width: 0;
`;

export const PositionName = styled.span`
    ${FONT_SIZE.sm};
    color: ${COLORS.textGray};
`;

export const LiquidityValue = styled.span`
    color: ${COLORS.textTertiary};
    font-size: 3.6rem;
    line-height: 4.2rem;
    white-space: nowrap;

    ${respondDown(Breakpoints.sm)`
        font-size: 3rem;
        line-height: 3.6rem;
    `}
`;

export const TokensValue = styled.span`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;
    ${FONT_SIZE.sm};
    color: ${COLORS.textTertiary};
    max-width: 100%;
    overflow-wrap: anywhere;
`;

export const TokenAmount = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-width: 0;
    color: ${COLORS.textTertiary};

    svg,
    img {
        flex: 0 0 auto;
    }
`;

export const TokenCode = styled.span`
    color: ${COLORS.textGray};
`;

export const TokenSeparator = styled.span`
    color: ${COLORS.textGray};
`;

export const StatusBadge = styled.div<{ $inRange: boolean }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    min-width: ${({ $inRange }) => ($inRange ? '8.2rem' : '11.6rem')};
    padding: 0.2rem 0.8rem;
    border-radius: 3.7rem;
    background: ${({ $inRange }) => ($inRange ? COLORS.green50 : COLORS.red50)};
    color: ${({ $inRange }) => ($inRange ? COLORS.green900 : COLORS.red700)};
    font-size: 1.2rem;
    line-height: 2rem;
    font-weight: 700;
    white-space: nowrap;
`;

export const StatusDot = styled.span<{ $inRange: boolean }>`
    width: 0.8rem;
    height: 0.8rem;
    border: 0.3rem solid ${({ $inRange }) => ($inRange ? '#9FEFC5' : '#FFB6C4')};
    border-radius: 50%;
    background: ${({ $inRange }) => ($inRange ? COLORS.green500 : COLORS.red500)};
    box-sizing: content-box;
`;

export const Details = styled.div`
    display: flex;
    align-items: center;
    gap: 3.2rem;
    min-height: 6.7rem;

    ${respondDown(Breakpoints.md)`
        align-items: stretch;
        flex-direction: column;
        gap: 1.6rem;
    `}
`;

export const Metrics = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 3.2rem;
    flex: 1;
    min-width: 0;
`;

export const Metric = styled.div`
    ${flexColumn};
    gap: 0.2rem;
    min-width: 0;
`;

export const MetricLabel = styled.span`
    ${FONT_SIZE.sm};
    color: ${COLORS.textGray};
`;

export const FeeValue = styled.span`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    min-width: 0;
    max-width: 100%;
    color: ${COLORS.textTertiary};
    font-size: 1.8rem;
    line-height: 3.2rem;

    svg {
        flex: 0 0 auto;
        margin-left: 0.2rem;
    }
`;

export const FeeTotal = styled.span`
    min-width: 0;
    ${textEllipsis};
`;

export const FeeTooltipContent = styled.div`
    ${flexColumn};
    gap: 0.4rem;
    min-width: 16rem;
    white-space: nowrap;
`;

export const FeeTooltipRow = styled.div`
    ${flexRowSpaceBetween};
    gap: 1.6rem;
    color: ${COLORS.textTertiary};
    ${FONT_SIZE.sm};
    white-space: nowrap;
`;

export const FeeTooltipToken = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: ${COLORS.textGray};
    white-space: nowrap;

    svg,
    img {
        flex: 0 0 auto;
    }
`;

export const FeeTooltipAmount = styled.span`
    white-space: nowrap;
    text-align: right;
`;

export const DividerVertical = styled.div`
    align-self: stretch;
    width: 0.1rem;
    min-height: 6.7rem;
    background: ${COLORS.gray100};

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

export const Range = styled.div`
    ${flexColumn};
    gap: 0.2rem;
    flex: 1;
    min-width: 0;
`;

export const RangeHeader = styled.div`
    ${flexRowSpaceBetween};
    gap: 1.2rem;
    width: 100%;
`;

export const RangeLabel = styled.span`
    ${FONT_SIZE.sm};
    color: ${COLORS.textGray};
    ${textEllipsis};
`;

export const RangeTrack = styled.div`
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

export const RangeValues = styled.div`
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

export const Actions = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;

    ${respondDown(Breakpoints.sm)`
        width: 100%;
        flex-direction: column;
        align-items: stretch;
    `}
`;

export const ActionButton = styled.button<{ $primary?: boolean }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    min-height: 3.2rem;
    padding: 0.8rem;
    border: none;
    border-radius: 0.6rem;
    background: ${({ $primary }) => ($primary ? COLORS.purple950 : COLORS.gray100)};
    color: ${({ $primary }) => ($primary ? COLORS.white : COLORS.textPrimary)};
    font-size: 1.4rem;
    line-height: 1.6rem;
    font-weight: 700;
    letter-spacing: 0.14rem;
    text-transform: uppercase;
    white-space: nowrap;
    cursor: pointer;
    transition: background 0.2s ease;

    svg {
        width: 1.6rem;
        height: 1.6rem;
        color: currentColor;
    }

    &:hover {
        background: ${({ $primary }) => ($primary ? COLORS.purple500 : COLORS.gray50)};
    }
`;

export const EmptyState = styled.div`
    ${FONT_SIZE.sm};
    color: ${COLORS.textGray};
`;
