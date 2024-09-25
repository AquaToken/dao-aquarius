import * as React from 'react';
import styled from 'styled-components';

import Contacts from 'basics/Contacts';

import Questions from './Questions/Questions';

import { respondDown } from '../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../common/styles';

const Container = styled.div`
    display: flex;
    width: 100%;
    max-width: 142rem;
    padding: 0 10rem;
    margin: 10rem auto 0;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        padding: 0 1.6rem;
        max-width: 55rem;
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
