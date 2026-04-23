import styled from 'styled-components';

import {
    cardBoxShadow,
    flexAllCenter,
    flexColumn,
    flexRowSpaceBetween,
    respondDown,
} from 'styles/mixins';
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

export const DesktopSummary = styled.div`
    display: grid;
    grid-template-columns: 22rem 1fr;
    column-gap: 1.2rem;
    align-items: center;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

export const MobileSummary = styled.div`
    display: none;

    ${respondDown(Breakpoints.md)`
        ${flexColumn};
        gap: 1.6rem;
        display: flex;
    `}
`;

export const TopRow = styled.div`
    ${flexRowSpaceBetween};
    gap: 1.6rem;
    width: 100%;
`;

export const SummaryLeft = styled.div`
    ${flexAllCenter};
    gap: 1.6rem;
    min-width: 0;
    width: 22rem;
    justify-content: flex-start;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

export const SummaryRight = styled.div`
    display: grid;
    grid-template-columns: 11rem 9rem 12rem 12rem 4rem;
    column-gap: 1.2rem;
    align-items: center;
    justify-content: space-between;
`;

export const Metric = styled.div`
    ${flexColumn};
    gap: 0.4rem;
    min-width: 0;
`;

export const MobileMetrics = styled.div`
    ${flexColumn};
    gap: 1.2rem;
    width: 100%;
`;

export const MobileMetric = styled.div`
    ${flexRowSpaceBetween};
    gap: 1.6rem;
    width: 100%;
    min-width: 0;
`;

export const MetricLabel = styled.div`
    ${FONT_SIZE.xs};
    color: ${COLORS.textGray};
`;

export const InfoLabelWrap = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
`;

export const MetricValue = styled.div`
    ${FONT_SIZE.md};
    color: ${COLORS.textSecondary};
`;

export const InfoIconWrap = styled.span`
    ${flexAllCenter};
    width: 1.6rem;
    height: 1.6rem;
    cursor: pointer;
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
