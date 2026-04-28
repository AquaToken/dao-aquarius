import styled from 'styled-components';

import { cardBoxShadow, flexColumn, flexRowSpaceBetween } from 'styles/mixins';
import { COLORS, FONT_SIZE } from 'styles/style-constants';

export const Card = styled.section`
    ${cardBoxShadow};
    ${flexColumn};
    gap: 2.4rem;
    padding: 3.2rem;
    background: ${COLORS.white};
    border-radius: 3.2rem;
`;

export const CardTitle = styled.h3`
    ${FONT_SIZE.lg};
    margin: 0;
    color: ${COLORS.textPrimary};
`;

export const Item = styled.div`
    ${flexColumn};
    gap: 0.8rem;
`;

export const ItemInteractive = styled.div`
    ${flexColumn};
    gap: 0.8rem;
    width: 100%;
    padding: 0.8rem;
    margin: -0.8rem;
    border-radius: 1.6rem;
    cursor: pointer;
    transition:
        background-color 150ms ease,
        transform 150ms ease;

    &:hover {
        background: ${COLORS.gray50};
    }

    &:active {
        transform: scale(0.99);
    }
`;

export const ItemHeader = styled.div`
    ${flexRowSpaceBetween};
    gap: 1.6rem;
`;

export const QueueLabel = styled.div`
    ${FONT_SIZE.xxs};
    color: ${COLORS.textGray};
`;

export const StartsAt = styled.div`
    ${FONT_SIZE.xxs};
    color: ${COLORS.textGray};
    text-align: right;
`;

export const ItemBody = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 1.2rem;
    min-width: 0;
`;

export const ItemAsset = styled.div`
    width: 100%;
    overflow: hidden;
`;

export const Divider = styled.div`
    width: 100%;
    height: 0.1rem;
    background: ${COLORS.gray100};
`;
