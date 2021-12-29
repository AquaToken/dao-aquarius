import * as React from 'react';
import styled from 'styled-components';
import { commonMaxWidth } from '../../../common/mixins';
import Contacts from './Contacts/Contacts';
import Questions from './Questions/Questions';

const Container = styled.div`
    ${commonMaxWidth};
    display: flex;
    width: 100%;
    margin-top: 5rem;
    padding: 0 4rem;
`;

const FAQ = (): JSX.Element => {
    return (
        <Container>
            <Contacts />
            <Questions />
        </Container>
    );
};

export default FAQ;
