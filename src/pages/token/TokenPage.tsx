import * as React from 'react';
import { useEffect } from 'react';
import styled from 'styled-components';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Community from 'components/Community';
import DelegateBlock from 'components/DelegateBlock';
import Subscribe from 'components/Subscribe';

import AboutIce from 'pages/token/components/AboutIce/AboutIce';
import AboutToken from 'pages/token/components/AboutToken/AboutToken';
import AquaLinks from 'pages/token/components/AquaLinks/AquaLinks';
import AquaPerformance from 'pages/token/components/AquaPerformance/AquaPerformance';
import AquaStatistics from 'pages/token/components/AquaStatistics/AquaStatistics';
import MainBlock from 'pages/token/components/MainBlock/MainBlock';
import Questions from 'pages/token/components/Questions/Questions';

const Container = styled.main`
    flex: 1 0 auto;
    background-color: ${COLORS.white};
    overflow: hidden;
`;

const AquaLinksStyled = styled(AquaLinks)`
    ${respondDown(Breakpoints.sm)`
        display: none;
    `}
`;

const TokenPage = () => {
    useEffect(() => {
        document.body.scrollTo(0, 0);
    }, []);

    return (
        <Container>
            <MainBlock />

            <AquaStatistics />

            <AquaLinksStyled />

            <AboutToken />

            <AboutIce />

            <DelegateBlock />

            <AquaPerformance />

            <Questions />

            <Community />

            <Subscribe />
        </Container>
    );
};

export default TokenPage;
