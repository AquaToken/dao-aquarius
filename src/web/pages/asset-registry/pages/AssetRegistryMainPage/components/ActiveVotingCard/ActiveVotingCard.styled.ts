import styled from 'styled-components';

import Button from 'basics/buttons/Button';
import { BlankRouterLink } from 'basics/links';

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

export const DetailsLink = styled(BlankRouterLink)`
    width: 100%;
`;

export const Section = styled.div`
    ${flexColumn};
    gap: 1.2rem;
`;

export const FooterRow = styled.div`
    ${flexRowSpaceBetween};
    gap: 1.6rem;
`;

export const VotingButtonsRow = styled.div`
    display: flex;
    gap: 0.4rem;
`;

export const VotingButton = styled(Button)`
    ${flexAllCenter};
    flex: 1 1 0;
    min-height: 4.8rem;
    padding: 0;
    border-radius: 1.2rem;
    text-transform: none;

    &:hover {
        opacity: 0.6;
    }

    &:active {
        transform: scale(0.98);
    }

    svg {
        width: 2.4rem;
        height: 2.4rem;
    }
`;

export const ForButton = styled(VotingButton)`
    background: ${COLORS.purple500};

    &:hover {
        background: ${COLORS.purple500};
    }
`;

export const AbstainButton = styled(VotingButton)`
    background: ${COLORS.gray100};

    span {
        color: ${COLORS.textGray};
    }

    &:hover {
        background: ${COLORS.gray100};
    }
`;

export const AgainstButton = styled(VotingButton)`
    background: ${COLORS.red500};

    &:hover {
        background: ${COLORS.red500};
    }
`;
