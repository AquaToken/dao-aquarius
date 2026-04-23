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

export const Header = styled.div`
    ${flexRowSpaceBetween};
    gap: 1.6rem;
    align-items: center;
`;

export const HeaderAsset = styled.div`
    min-width: 0;
    flex: 1 1 auto;
`;

export const Stats = styled.div`
    ${flexColumn};
    gap: 1.2rem;
`;

export const Meta = styled.div`
    ${flexRowSpaceBetween};
    gap: 1.6rem;
`;

export const MetaLabel = styled.div`
    ${FONT_SIZE.sm};
    color: ${COLORS.textGray};
`;

export const InfoLabelWrap = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
`;

export const InfoIconWrap = styled.span`
    ${flexAllCenter};
    width: 1.6rem;
    height: 1.6rem;
    cursor: pointer;
`;

export const MetaValue = styled.div`
    ${FONT_SIZE.md};
    color: ${COLORS.textSecondary};
`;

export const Divider = styled.div`
    width: 100%;
    height: 0.1rem;
    background: ${COLORS.gray100};
`;

export const Section = styled.div`
    ${flexColumn};
    gap: 1.2rem;
`;

export const ProgressBar = styled.div`
    width: 100%;
    height: 0.6rem;
    overflow: hidden;
    background: ${COLORS.gray100};
    border-radius: 4.8rem;
`;

export const ProgressFill = styled.div`
    height: 100%;
    background: ${COLORS.purple500};
    border-radius: inherit;
`;

export const FooterRow = styled.div`
    ${flexRowSpaceBetween};
    gap: 1.6rem;
`;
