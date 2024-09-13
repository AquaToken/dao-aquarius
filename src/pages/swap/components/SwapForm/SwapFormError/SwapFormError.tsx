import * as React from 'react';
import { IconFail } from '../../../../../common/basics/Icons';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
`;

const SwapFormError = ({ error }) => {
    if (!error) {
        return null;
    }
    return (
        <Container>
            <IconFail />
            There are no exchange paths for the selected market.
        </Container>
    );
};

export default SwapFormError;
