import styled from 'styled-components';

import { COLORS } from 'styles/style-constants';

export const ChartSurface = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
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
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    gap: 0.8rem;
`;

export const ChartControlButton = styled.button`
    width: 3.2rem;
    height: 3.2rem;
    border: none;
    border-radius: 0.8rem;
    background: ${COLORS.white};
    color: ${COLORS.textPrimary};
    font-size: 1.8rem;
    cursor: pointer;
`;
