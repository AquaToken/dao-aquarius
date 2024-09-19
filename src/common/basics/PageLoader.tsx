import Lottie from 'lottie-react';
import styled from 'styled-components';

import { flexAllCenter } from 'web/mixins';

import * as preloader from 'assets/preloader.json';

const Container = styled.div`
    flex: 1 0 auto;
    ${flexAllCenter};
`;

const PageLoader = (): JSX.Element => (
    <Container>
        <Lottie animationData={preloader} style={{ height: '6rem', width: '6rem' }} />
    </Container>
);

export default PageLoader;
