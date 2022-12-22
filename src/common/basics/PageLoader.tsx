import * as React from 'react';
import styled from 'styled-components';
import Loader from '../assets/img/loader.svg';
import { flexAllCenter } from '../mixins';
import { COLORS } from '../styles';

const Container = styled.div`
    flex: 1 0 auto;
    ${flexAllCenter};
`;

const StyledLoader = styled(Loader)`
    height: 4rem;
    width: 4rem;
    color: ${COLORS.purple};
`;

const PageLoader = (): JSX.Element => {
    return (
        <Container>
            <StyledLoader />
        </Container>
    );
};

export default PageLoader;
