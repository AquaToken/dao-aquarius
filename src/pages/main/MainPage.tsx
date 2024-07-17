import * as React from 'react';
import MainBlock from './components/MainBlock/MainBlock';
import styled from 'styled-components';
import { respondDown } from '../../common/mixins';
import { Breakpoints, COLORS } from '../../common/styles';
import SupportedBy from './components/SupportedBy/SupportedBy';
import About from './components/About/About';
import IceBlock from './components/IceBlock/IceBlock';
import Roadmap from './components/Roadmap/Roadmap';
import Community from '../../common/components/Community/Community';
import Subscribe from '../../common/components/Subscribe/Subscribe';

const Container = styled.div`
    height: 100%;
    position: relative;
    display: flex;
    flex: 1 0 auto;
    flex-direction: column;
    scroll-behavior: smooth;
    overflow: auto;

    ${respondDown(Breakpoints.md)`
        height: auto;
        background-color: ${COLORS.lightGray};
    `}
`;

const MainPage = () => {
    return (
        <Container>
            <MainBlock />

            <SupportedBy />

            <About />

            <IceBlock />

            <Roadmap />

            <Community />

            <Subscribe />
        </Container>
    );
};

export default MainPage;
