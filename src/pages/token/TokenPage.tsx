import * as React from 'react';
import styled from 'styled-components';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Community from 'components/Community';
import SocialLinks from 'components/SocialLinks';
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
`;

const AquaLinksStyled = styled(AquaLinks)`
    ${respondDown(Breakpoints.sm)`
        display: none;
    `}
`;

const TokenPage = () => (
    <Container>
        <SocialLinks />

        <MainBlock />

        <AquaStatistics />

        <AquaLinksStyled />

        <AboutToken />

        <AboutIce />

        <AquaPerformance />

        <Questions />

        <Community />

        <Subscribe />
    </Container>
);

export default TokenPage;
