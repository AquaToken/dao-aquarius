import styled from 'styled-components';

import { cardBoxShadow, flexAllCenter, flexColumn, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS, FONT_SIZE } from 'styles/style-constants';

export const ItemCard = styled.article`
    ${cardBoxShadow};
    background: ${COLORS.white};
    border-radius: 3.2rem;
    padding: 2.8rem 3.2rem;

    ${respondDown(Breakpoints.md)`
        padding: 2.4rem;
    `}
`;

export const AssetSummary = styled.div`
    display: grid;
    grid-template-columns: 22rem 11rem 9rem 12rem 12rem 4rem;
    column-gap: 1.2rem;
    align-items: center;
    justify-content: space-between;

    ${respondDown(Breakpoints.md)`
        grid-template-columns: 1fr;
        row-gap: 1.6rem;
        justify-content: unset;
    `}
`;

export const SummaryLeft = styled.div`
    ${flexAllCenter};
    gap: 1.6rem;
    min-width: 0;
    width: 22rem;
    justify-content: flex-start;
`;

export const SummaryRight = styled.div`
    display: grid;
    grid-column: 2 / -1;
    grid-template-columns: 11rem 9rem 12rem 12rem 4rem;
    column-gap: 1.2rem;
    align-items: center;
    justify-content: space-between;

    ${respondDown(Breakpoints.md)`
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        row-gap: 1.6rem;
        column-gap: 1.6rem;
        grid-column: auto;
        justify-content: unset;
    `}
`;

export const Metric = styled.div`
    ${flexColumn};
    gap: 0.4rem;
    min-width: 0;

    ${respondDown(Breakpoints.md)`
        min-width: 0;
    `}
`;

export const MetricLabel = styled.div`
    ${FONT_SIZE.xs};
    color: ${COLORS.textGray};
`;

export const MetricValue = styled.div`
    ${FONT_SIZE.md};
    color: ${COLORS.textSecondary};
`;

export const ChevronButton = styled.button`
    ${flexAllCenter};
    width: 4rem;
    height: 4rem;
    border: none;
    border-radius: 1.2rem;
    background: ${COLORS.gray50};
    cursor: pointer;
    justify-self: end;
`;

export const ChevronPlaceholder = styled.div`
    width: 4rem;
    height: 4rem;
    flex-shrink: 0;
    justify-self: end;
`;

export const ChevronIconWrap = styled.div<{ $isExpanded: boolean }>`
    ${flexAllCenter};
    transform: ${({ $isExpanded }) => ($isExpanded ? 'rotate(180deg)' : 'none')};
    transition: transform 200ms ease;

    svg {
        color: ${COLORS.textPrimary};
    }
`;

export const AssetRow = styled.div`
    margin-top: 2.4rem;
    padding-top: 2.4rem;
    border-top: 0.1rem solid ${COLORS.gray100};
`;
