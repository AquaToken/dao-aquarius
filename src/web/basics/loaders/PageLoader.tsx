import styled from 'styled-components';

import AquaLogoLoader from './AquaLogoLoader';

import { flexAllCenter } from '../../mixins';

const Container = styled.div`
    flex: 1 0 auto;
    ${flexAllCenter};
`;

const PageLoader = (): JSX.Element => (
    <Container>
        <AquaLogoLoader />
    </Container>
);

export default PageLoader;
