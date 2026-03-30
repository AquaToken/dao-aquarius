import styled from 'styled-components';

import { COLORS, hexWithOpacity } from 'styles/style-constants';

export const ChartSurface = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
`;

export const ChartHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
`;

export const ChartTitle = styled.h6<{ $compact?: boolean }>`
    margin: 0;
    font-size: ${({ $compact }) => ($compact ? '1.4rem' : '2rem')};
    line-height: ${({ $compact }) => ($compact ? '2rem' : '2.8rem')};
    color: ${COLORS.textPrimary};
`;

export const ChartBody = styled.div<{ $compact?: boolean }>`
    position: relative;
    height: ${({ $compact }) => ($compact ? '18rem' : '28rem')};
    border-radius: 1rem;
    background: ${COLORS.gray50};
    border: 0.1rem solid ${COLORS.gray100};
    padding: ${({ $compact }) =>
        $compact ? '0.6rem 0.6rem 0.6rem 1.2rem' : '1rem 1rem 1rem 1.8rem'};
`;

export const ChartLoader = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const EmptyDistribution = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${COLORS.textGray};
    font-size: 1.6rem;
    pointer-events: none;
`;

export const ChartControls = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
`;

export const ChartControlButton = styled.button`
    width: 3.2rem;
    height: 3.2rem;
    border: none;
    border-radius: 0.8rem;
    background: ${COLORS.gray50};
    color: ${COLORS.textPrimary};
    font-size: 1.8rem;
    cursor: pointer;
`;

export const ChartTooltip = styled.div`
    position: absolute;
    z-index: 2;
    min-width: 24rem;
    max-width: 30rem;
    padding: 1.2rem;
    border-radius: 1rem;
    border: 0.1rem solid ${COLORS.gray100};
    background: ${COLORS.white};
    box-shadow: 0 0.8rem 3.2rem ${hexWithOpacity(COLORS.textPrimary, 14)};
    pointer-events: none;
`;

export const ChartTooltipStack = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.2rem;

    > * + * {
        padding-top: 1.2rem;
        border-top: 0.1rem solid ${COLORS.gray100};
    }
`;
