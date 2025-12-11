import styled from 'styled-components';

import Arrow from 'assets/icons/arrows/arrow-alt2-16.svg';

import { BlankRouterLink } from 'basics/links';

import { flexAllCenter, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

export const Wrapper = styled.div`
    padding-top: 5%;

    ${respondDown(Breakpoints.sm)`
        padding-top: 1.6rem;
    `}
`;

export const LearnMoreLink = styled(BlankRouterLink)`
    ${flexAllCenter};
    background-color: ${COLORS.white};
    padding: 1rem 1.6rem;
    border-radius: 3rem;
    gap: 0.9rem;
    margin: 0 auto 1.6rem;
`;

export const PurpleArrow = styled(Arrow)`
    path {
        fill: ${COLORS.purple500};
    }
`;
