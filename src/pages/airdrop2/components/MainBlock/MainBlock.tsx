import * as React from 'react';
import styled from 'styled-components';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Image from 'assets/airdrop2-image.svg';
import Airdrop from 'assets/airdrop2.svg';

const Container = styled.section`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 50vw;
    background-color: ${COLORS.lightGray};
    overflow: hidden;

    ${respondDown(Breakpoints.sm)`
        height: 50rem;
        justify-content: center;
        padding-bottom: 10rem;
    `}

    ${respondDown(Breakpoints.xs)`
        justify-content: flex-start;
    `}
`;

const BackgroundImage = styled(Image)`
    height: 100%;
    margin-top: -4rem;

    ${respondDown(Breakpoints.md)`
         margin-top: 11.2rem;
    `}

    ${respondDown(Breakpoints.sm)`
        height: 120%;
        margin-top: 14rem;
    `}
`;

const BackgroundImageRight = styled(BackgroundImage)`
    transform: scale(-1, 1);

    ${respondDown(Breakpoints.sm)`
        display: none;
    `}
`;

const AirdropMain = styled(Airdrop)`
    height: 35%;
    margin-top: -4rem;

    ${respondDown(Breakpoints.md)`
         margin-top: 0;
    `}

    ${respondDown(Breakpoints.sm)`
        height: 27%;
        margin-top: -20rem;
        margin-left: -20rem;
    `}
`;

const MainBlock = () => (
    <Container>
        <BackgroundImage />
        <AirdropMain />
        <BackgroundImageRight />
    </Container>
);

export default MainBlock;
