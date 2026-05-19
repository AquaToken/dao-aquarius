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

export const Container = styled.div`
    ${flexColumn};
    gap: 0.8rem;
    width: 100%;
    padding: 1.6rem;
    margin-top: 0.8rem;
    background: ${COLORS.gray50};
    border-radius: 1rem;
    overflow: hidden;
`;

export const Header = styled.div`
    ${flexRowSpaceBetween};
    gap: 1.6rem;
    width: 100%;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        align-items: flex-start;
    `}
`;

export const Title = styled.span`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.textTertiary};
`;

export const CurrentPrice = styled.span`
    ${FONT_SIZE.sm};
    color: ${COLORS.textGray};
    white-space: nowrap;

    span {
        color: ${COLORS.textPrimary};
    }
`;

export const EmptyState = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    ${FONT_SIZE.sm};
    color: ${COLORS.textGray};
    padding: 1.6rem;
`;

export const Position = styled.div`
    display: grid;
    grid-template-columns:
        11.6rem minmax(16rem, 1fr) 12rem minmax(21.6rem, 1.2fr)
        7.2rem;
    align-items: center;
    column-gap: 7rem;
    width: 100%;
    padding: 1.2rem 2.4rem;
    background: ${COLORS.white};
    border-radius: 0.8rem;

    ${respondDown(Breakpoints.lg)`
        grid-template-columns:
            11.6rem minmax(16rem, 1fr) 12rem minmax(20rem, 1fr)
            7.2rem;
        column-gap: 1.6rem;
    `}

    ${respondDown(Breakpoints.md)`
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 1.6rem;
        padding: 1.6rem;
    `}
`;

export const PositionInfo = styled.div`
    ${flexColumn};
    justify-content: space-between;
    gap: 0.8rem;
    width: 11.6rem;
    min-height: 5.4rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        min-height: 0;
    `}
`;

export const ValueBlock = styled.div`
    ${flexColumn};
    gap: 0.8rem;
    width: 100%;
    min-width: 0;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

export const LiquidityValue = styled.span`
    color: ${COLORS.textTertiary};
    font-size: 2.2rem;
    line-height: 2.8rem;
    white-space: nowrap;
`;

export const TokensValue = styled.span`
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;
    ${FONT_SIZE.sm};
    color: ${COLORS.textTertiary};
`;

export const Metric = styled.div<{ $wide?: boolean }>`
    ${flexColumn};
    gap: 0.2rem;
    width: ${({ $wide }) => ($wide ? '12rem' : '7rem')};

    ${respondDown(Breakpoints.md)`
        flex-direction: row;
        width: 100%;
        align-items: center;
        justify-content: space-between;
    `}
`;

export const RangeBlock = styled(ConcentratedPositionPriceRange)`
    width: 100%;
    min-width: 0;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

export const Actions = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.8rem;
    flex-shrink: 0;

    ${respondDown(Breakpoints.md)`
        width: 100%;
        justify-content: stretch;

        & > button {
            flex: 1;
        }
    `}
`;

export const ActionButton = styled.button<{ $primary?: boolean }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    min-width: 3.2rem;
    min-height: 3.2rem;
    padding: 0.8rem;
    border: none;
    border-radius: 0.6rem;
    background: ${({ $primary }) => ($primary ? COLORS.purple950 : COLORS.gray100)};
    color: ${({ $primary }) => ($primary ? COLORS.white : COLORS.textPrimary)};
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
