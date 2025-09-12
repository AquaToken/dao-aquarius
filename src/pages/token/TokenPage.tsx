import { useEffect } from 'react';
import styled from 'styled-components';

import { respondDown } from 'web/mixins';
import { PageContainer, SectionWrapper } from 'web/pages/commonPageStyles';
import { Breakpoints } from 'web/styles';

import Community from 'components/Community';
import DelegateBlock from 'components/DelegateBlock';
import Subscribe from 'components/Subscribe';

import AboutIce from 'pages/token/components/AboutIce/AboutIce';
import AboutToken from 'pages/token/components/AboutToken/AboutToken';
import AquaLinks from 'pages/token/components/AquaLinks/AquaLinks';
import AquaPerformance from 'pages/token/components/AquaPerformance/AquaPerformance';
import AquaStatistics from 'pages/token/components/AquaStatistics/AquaStatistics';
import MainBlock from 'pages/token/components/MainBlock/MainBlock';

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

            <SectionWrapper>
                <Community />

                <Subscribe />
            </SectionWrapper>
        </PageContainer>
    );
};

export default TokenPage;
