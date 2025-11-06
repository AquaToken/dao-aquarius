import styled from 'styled-components';

import { commonMaxWidth, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

export const Container = styled.main`
    ${commonMaxWidth};
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.textTertiary};
    padding: 0 4rem;

    ${respondDown(Breakpoints.md)`
        padding: 0 1.6rem;
    `}

    h1 {
        font-size: 2.5rem;
        line-height: 1.2;
        margin-bottom: 1rem;
    }

    h2 {
        font-size: 2rem;
        line-height: 1.2;
        margin-top: 2rem;
        margin-bottom: 1rem;
    }

    h3 {
        font-size: 1.6rem;
        line-height: 1.2;
        margin-top: 2rem;
        margin-bottom: 1rem;
    }

    i {
        display: block;
        margin-bottom: 1rem;
        color: ${COLORS.textSecondary};
    }

    li {
        margin-bottom: 1rem;
    }

    a {
        color: ${COLORS.purple500};
        text-decoration: none;
    }
`;
