import * as React from 'react';
import styled from 'styled-components';

import Error from 'assets/icons/status/fail-red.svg';

import { flexAllCenter } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

const Container = styled.div`
    ${flexAllCenter};
    padding: 2.4rem;
    color: ${COLORS.textDark};
    background-color: ${COLORS.gray50};
`;

const ErrorIcon = styled(Error)`
    height: 1.6rem;
    width: 1.6rem;
    margin-right: 0.8rem;
`;

interface ErrorProps {
    text: string;
}

const ErrorMessage = ({ text }: ErrorProps) => (
    <Container>
        <ErrorIcon />
        {text}
    </Container>
);

export default ErrorMessage;
