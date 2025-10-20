import * as React from 'react';
import styled from 'styled-components';

import { commonMaxWidth } from 'web/mixins';

import FAQ from 'components/FAQ';

import FreezeAQUA from '../components/FreezeAQUA/FreezeAQUA';
import Purpose from '../components/Purpose/Purpose';
import { LockerQuestions } from '../components/Questions/Questions';
import StatisticBlock from '../components/StatisticBlock/StatisticBlock';
import WhyFreezeAQUA from '../components/WhyFreezeAQUA/WhyFreezeAQUA';

const MainBlock = styled.main`
    flex: 1 0 auto;
`;

const MainSection = styled.div`
    ${commonMaxWidth};
    width: 100%;
`;

const LockerAbout = (): React.ReactNode => (
    <>
        <MainBlock>
            <Purpose />
        </MainBlock>
        <MainSection>
            <StatisticBlock />
        </MainSection>
        <MainSection>
            <FreezeAQUA />
        </MainSection>
        <MainSection>
            <WhyFreezeAQUA />
        </MainSection>
        <FAQ questions={LockerQuestions} />
    </>
);

export default LockerAbout;
