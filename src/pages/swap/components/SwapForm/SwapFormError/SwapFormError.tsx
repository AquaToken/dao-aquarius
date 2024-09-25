import * as React from 'react';
import styled from 'styled-components';

import { IconFail } from '../../../../../common/basics/Icons';

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
