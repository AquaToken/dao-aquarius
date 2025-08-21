import styled from 'styled-components';

import { Breakpoints, COLORS, MAX_WIDTHS } from 'web/styles';

import Community from 'components/Community';
import Subscribe from 'components/Subscribe';

import IceBlock from './components/IceBlock/IceBlock';
import HeroBlock from './components/HeroBlock';
import Roadmap from './components/Roadmap/Roadmap';
import SupportedBy from './components/SupportedBy/SupportedBy';

import { PageContainer } from '../commonPageStyles';
import AquaSoroban from './components/AquaSoroban';

const Wrapper = styled.div`
    max-width: ${MAX_WIDTHS.mainPage};
    width: 100%;
`;

const MainPage = () => (
    <PageContainer>
        <HeroBlock />

        <Wrapper>
            <SupportedBy />

            <AquaSoroban />

            <IceBlock />

            <Roadmap />

            <Community />

            <Subscribe />
        </Wrapper>
    </PageContainer>
);

export default MainPage;
