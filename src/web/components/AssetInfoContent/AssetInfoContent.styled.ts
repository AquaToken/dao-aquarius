import styled from 'styled-components';

import CopyButton from 'basics/buttons/CopyButton';

import { flexAllCenter, flexRowSpaceBetween, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

export const TopRow = styled.div`
    ${flexRowSpaceBetween};
    gap: 1.6rem;
    align-items: flex-start;
`;

export const AssetWrap = styled.div`
    min-width: 0;
    flex: 1 1 auto;
`;

export const Description = styled.p`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textSecondary};
    opacity: 0.7;
    margin: 2.4rem 0 1.6rem;
`;

export const Links = styled.div`
    display: flex;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        gap: 1rem;
    `}
`;

export const ContactLink = styled.a`
    display: flex;
    align-items: center;
    color: ${COLORS.purple500};
    text-decoration: none;
    margin-right: 2.4rem;
    font-size: 1.6rem;
    line-height: 2.8rem;

    svg {
        margin-right: 0.4rem;
    }
`;

export const Details = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin-top: 4rem;
    gap: 3.2rem;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        gap: 1.6rem;
    `}
`;

export const Detail = styled.div`
    flex: 1;
    min-width: 30%;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    color: ${COLORS.textTertiary};

    span:first-child {
        color: ${COLORS.textGray};
    }

    span:last-child {
        line-height: 2.8rem;
    }
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

export const CopyButtonStyled = styled(CopyButton)`
    font-size: 1.4rem;
`;
