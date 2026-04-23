import styled from 'styled-components';

import { cardBoxShadow, flexAllCenter, flexColumn, flexRowSpaceBetween } from 'styles/mixins';
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
    ${flexAllCenter};
    gap: 1.2rem;
`;

export const TokenAvatar = styled.div`
    ${FONT_SIZE.sm};
    ${flexAllCenter};
    width: 4rem;
    height: 4rem;
    border-radius: 1.2rem;
    background: ${COLORS.gray100};
    color: ${COLORS.textPrimary};
    font-weight: 700;
    text-transform: uppercase;
`;

export const TokenCode = styled.div`
    ${FONT_SIZE.md};
    color: ${COLORS.textSecondary};
`;

export const Divider = styled.div`
    width: 100%;
    height: 0.1rem;
    background: ${COLORS.gray100};
`;
