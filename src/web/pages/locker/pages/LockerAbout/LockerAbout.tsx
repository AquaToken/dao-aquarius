import * as React from 'react';

import FAQ from 'components/FAQ';

import FreezeAQUA from './components/FreezeAQUA/FreezeAQUA';
import Purpose from './components/Purpose/Purpose';
import { LockerQuestions } from './components/Questions/Questions';
import StatisticBlock from './components/StatisticBlock/StatisticBlock';
import WhyFreezeAQUA from './components/WhyFreezeAQUA/WhyFreezeAQUA';
import { MainBlock, MainSection } from './LockerAbout.styled';

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
