import styled from 'styled-components';

import { cardBoxShadow, commonMaxWidth, commonSectionPaddings, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS, FONT_SIZE, PAGE_PADDINGS } from 'styles/style-constants';

export const Inner = styled.section`
    ${commonMaxWidth};
    ${commonSectionPaddings};
    width: 100%;
    padding-top: 6.4rem;
    padding-bottom: 9.6rem;

    ${respondDown(Breakpoints.sm)`
        padding-top: 4rem;
        padding-bottom: 6.4rem;
        padding-left: ${PAGE_PADDINGS}rem;
        padding-right: ${PAGE_PADDINGS}rem;
    `}
`;

export const Card = styled.div`
    ${cardBoxShadow};
    background: ${COLORS.white};
    border: 0.1rem solid ${COLORS.gray100};
    border-radius: 2.4rem;
    padding: 4rem;

    ${respondDown(Breakpoints.sm)`
        padding: 2.4rem;
        border-radius: 1.6rem;
    `}
`;

export const Eyebrow = styled.span`
    ${FONT_SIZE.xs};
    display: inline-flex;
    margin-bottom: 1.2rem;
    padding: 0.6rem 1.2rem;
    border-radius: 999rem;
    background: ${COLORS.purple50};
    color: ${COLORS.purple500};
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
`;

export const Title = styled.h1`
    ${FONT_SIZE.xxl};
    margin: 0 0 1.2rem;
    color: ${COLORS.textPrimary};

    ${respondDown(Breakpoints.sm)`
        ${FONT_SIZE.xl};
    `}
`;

export const Description = styled.p`
    ${FONT_SIZE.md};
    max-width: 72rem;
    margin: 0;
    color: ${COLORS.textGray};
`;
