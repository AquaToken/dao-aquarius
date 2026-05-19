import styled from 'styled-components';

import { flexColumn, flexRowSpaceBetween, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS, FONT_SIZE } from 'styles/style-constants';

import ConcentratedPositionPriceRange from 'pages/amm/components/ConcentratedLiquidity/components/ConcentratedPositionPriceRange/ConcentratedPositionPriceRange';

export {
    FeeTooltipAmount,
    FeeTooltipContent,
    FeeTooltipRow,
    FeeTooltipToken,
    FeeTotal,
    FeeValue,
    MetricLabel,
    PositionName,
    StatusBadge,
    StatusDot,
    TokenAmount,
    TokenCode,
    TokenSeparator,
} from 'pages/amm/components/ConcentratedLiquidity/components/ConcentratedPositionShared.styled';

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

export const DividerVertical = styled.div`
    align-self: stretch;
    width: 0.1rem;
    min-height: 6.7rem;
    background: ${COLORS.gray100};

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

export const Range = styled(ConcentratedPositionPriceRange)`
    flex: 1;
    min-width: 0;
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

        path {
            stroke: currentColor;
        }
    }

    &:hover {
        background: ${({ $primary }) => ($primary ? COLORS.purple500 : COLORS.gray50)};
    }
`;

export const EmptyState = styled.div`
    ${FONT_SIZE.sm};
    color: ${COLORS.textGray};
`;
