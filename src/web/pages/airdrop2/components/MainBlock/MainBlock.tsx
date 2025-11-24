import * as React from 'react';

import { Container, BackgroundImage, BackgroundImageRight, AirdropMain } from './MainBlock.styled';

const MainBlock: React.FC = () => (
    <Container>
        <BackgroundImage />
        <AirdropMain />
        <BackgroundImageRight />
    </Container>
);

export default MainBlock;
