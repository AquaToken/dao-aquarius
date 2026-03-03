import styled from 'styled-components';

import { COLORS } from 'styles/style-constants';

export const EmptyDistribution = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: ${COLORS.textGray};
    font-size: 1.6rem;
`;

export const ZoomControls = styled.div`
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    gap: 0.8rem;
`;

export const ZoomButton = styled.button`
    width: 3.2rem;
    height: 3.2rem;
    border: none;
    border-radius: 0.8rem;
    background: ${COLORS.white};
    color: ${COLORS.textPrimary};
    font-size: 1.8rem;
    cursor: pointer;
`;
