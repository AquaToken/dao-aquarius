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
import { PageContainer } from 'web/pages/commonPageStyles';

const Wrapper = styled.div`
    width: 100%;
    max-width: 122rem;
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
        <PageContainer>
            <MainBlock />

            <AquaStatistics />

            <AquaLinksStyled />

            <AboutToken />

            <AboutIce />

            <DelegateBlock />

            <AquaPerformance />

            <Wrapper>
                <Community />

                <Subscribe />
            </Wrapper>
        </PageContainer>
    );
};

export default TokenPage;
