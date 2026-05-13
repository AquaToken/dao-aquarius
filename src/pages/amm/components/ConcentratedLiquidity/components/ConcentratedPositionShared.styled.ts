import styled from 'styled-components';

import { flexColumn, flexRowSpaceBetween, textEllipsis } from 'styles/mixins';
import { COLORS, FONT_SIZE } from 'styles/style-constants';

export const PositionName = styled.span`
    ${FONT_SIZE.sm};
    color: ${COLORS.textGray};
`;

export const StatusBadge = styled.div<{ $inRange: boolean }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    align-self: flex-start;
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

export const MetricLabel = styled.span`
    ${FONT_SIZE.sm};
    color: ${COLORS.textGray};
`;

export const FeeValue = styled.span<{ $inline?: boolean }>`
    display: ${({ $inline }) => ($inline ? 'inline-flex' : 'flex')};
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
        cursor: help;
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
