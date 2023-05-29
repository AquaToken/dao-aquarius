import * as React from 'react';
import styled from 'styled-components';
import { flexAllCenter } from '../mixins';
import Lottie from 'lottie-react';
import * as preloader from '../assets/animations/preloader.json';

const Container = styled.div`
    flex: 1 0 auto;
    ${flexAllCenter};
`;

const PageLoader = (): JSX.Element => {
    return (
        <Container>
            <Lottie animationData={preloader} />
        </Container>
    );
};

export default PageLoader;
