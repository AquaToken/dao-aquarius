import styled from 'styled-components';

import { ExternalLink } from 'basics/links';

import { cardBoxShadow, flexAllCenter, flexRowSpaceBetween, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS, FONT_SIZE } from 'styles/style-constants';

export const Card = styled.section`
    ${cardBoxShadow};
    background: ${COLORS.white};
    border-radius: 3.2rem;
    padding: 3.2rem;
    margin-top: 3.2rem;
    width: 100%;

    ${respondDown(Breakpoints.md)`
        padding: 2.4rem;
    `}
`;

export const Header = styled.div`
    ${flexRowSpaceBetween};
    align-items: flex-start;
    gap: 1.6rem;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        align-items: stretch;
    `}
`;

export const Title = styled.h2`
    ${FONT_SIZE.xl};
    margin: 0;
    color: ${COLORS.textPrimary};
`;

export const StatusBadge = styled.div<{ $isComplete: boolean }>`
    ${flexAllCenter};
    gap: 0.4rem;
    min-height: 3.2rem;
    width: fit-content;
    padding: 0.4rem 1.2rem;
    border-radius: 3.2rem;
    background: ${({ $isComplete }) => ($isComplete ? COLORS.green500 : COLORS.purple500)};
    color: ${COLORS.white};
    ${FONT_SIZE.xs};
    font-weight: 700;
    text-transform: uppercase;
`;

export const Description = styled.p`
    ${FONT_SIZE.md};
    margin: 2rem 0 0;
    color: ${COLORS.textSecondary};
    max-width: 74rem;
`;

export const ProgressWrap = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 2.8rem;
    row-gap: 2rem;
    margin-top: 3.2rem;
    padding: 2.4rem;
    border-radius: 2.4rem;
    background: ${COLORS.gray50};

    ${respondDown(Breakpoints.md)`
        grid-template-columns: 1fr;
        gap: 2rem;
    `}
`;

export const ReadMoreLink = styled(ExternalLink)`
    width: fit-content;
    margin-top: 2.4rem;
`;
