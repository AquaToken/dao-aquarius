import * as React from 'react';
import styled from 'styled-components';

import Contacts from 'basics/Contacts';

import Questions from './Questions/Questions';

import { commonMaxWidth, respondDown } from '../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../common/styles';

const Container = styled.div`
    ${commonMaxWidth};
    display: flex;
    width: 100%;
    padding: 5rem 4rem 0;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        padding: 5rem 1.6rem;
        background: ${COLORS.lightGray};
    `}
`;

const FAQ = (): JSX.Element => (
    <Container>
        <Contacts />
        <Questions />
    </Container>
);

export default FAQ;
