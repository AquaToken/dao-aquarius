import Lottie from 'lottie-react';
import * as React from 'react';
import styled from 'styled-components';

import * as preloader from 'assets/preloader.json';

import { flexAllCenter } from '../../mixins';

const Container = styled.div`
    flex: 1 0 auto;
    ${flexAllCenter};
`;

const PageLoader = (): React.ReactNode => (
    <Container>
        <Lottie animationData={preloader} style={{ height: '6rem', width: '6rem' }} />
    </Container>
);

export default PageLoader;
