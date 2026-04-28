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

export const Summary = styled.div`
    display: grid;
    grid-template-columns: 22rem 1fr;
    column-gap: 1.2rem;
    align-items: center;

    ${respondDown(Breakpoints.md)`
        grid-template-columns: minmax(0, 1fr) 4rem;
        row-gap: 1.6rem;
        grid-template-areas:
            'mobile-badge chevron'
            'asset asset'
            'holders holders'
            'tvl tvl'
            'volume volume';
    `}
`;

export const SummaryLeft = styled.div`
    ${flexAllCenter};
    gap: 1.6rem;
    min-width: 0;
    width: 22rem;
    justify-content: flex-start;

    ${respondDown(Breakpoints.md)`
        grid-area: asset;
        width: 100%;
    `}
`;

export const SummaryRight = styled.div`
    display: grid;
    grid-template-columns: 11rem 9rem 12rem 12rem 4rem;
    column-gap: 1.2rem;
    align-items: center;
    justify-content: space-between;

    ${respondDown(Breakpoints.md)`
        display: contents;
    `}
`;

export const Metric = styled.div`
    ${flexColumn};
    gap: 0.4rem;
    min-width: 0;
`;

export const DesktopBadgeWrap = styled.div`
    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

export const MobileBadgeWrap = styled.div`
    display: none;

    ${respondDown(Breakpoints.md)`
        display: block;
        grid-area: mobile-badge;
        min-width: 0;
    `}
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

export const HoldersMetric = styled(Metric)`
    ${respondDown(Breakpoints.md)`
        grid-area: holders;
        ${flexRowSpaceBetween};
        gap: 1.6rem;
        width: 100%;
    `}
`;

export const TvlMetric = styled(Metric)`
    ${respondDown(Breakpoints.md)`
        grid-area: tvl;
        ${flexRowSpaceBetween};
        gap: 1.6rem;
        width: 100%;
    `}
`;

export const VolumeMetric = styled(Metric)`
    ${respondDown(Breakpoints.md)`
        grid-area: volume;
        ${flexRowSpaceBetween};
        gap: 1.6rem;
        width: 100%;
    `}
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

    ${respondDown(Breakpoints.md)`
        grid-area: chevron;
    `}
`;

export const ChevronPlaceholder = styled.div`
    width: 4rem;
    height: 4rem;
    flex-shrink: 0;
    justify-self: end;

    ${respondDown(Breakpoints.md)`
        grid-area: chevron;
    `}
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
