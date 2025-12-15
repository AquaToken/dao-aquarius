import * as React from 'react';
import styled from 'styled-components';

import { flexAllCenter } from 'styles/mixins';

import AquaLogoLoader from './AquaLogoLoader';

const Container = styled.div`
    flex: 1 0 auto;
    ${flexAllCenter};
`;

const PageLoader = (): React.ReactElement => (
    <Container>
        <AquaLogoLoader />
    </Container>
);

export default PageLoader;
