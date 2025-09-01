import * as React from 'react';
import styled from 'styled-components';

import { commonMaxWidth } from 'web/mixins';

import FAQ from 'basics/FAQ';

import { LockerQuestions } from 'pages/locker/components/Questions/Questions';

import AccountInput from '../components/AccountInput/AccountInput';
import FreezeAQUA from '../components/LockerMainPage/FreezeAQUA/FreezeAQUA';
import Purpose from '../components/LockerMainPage/Purpose/Purpose';
import StatisticBlock from '../components/LockerMainPage/StatisticBlock/StatisticBlock';
import WhyFreezeAQUA from '../components/LockerMainPage/WhyFreezeAQUA/WhyFreezeAQUA';

const MainBlock = styled.main`
    flex: 1 0 auto;
`;

const MainSection = styled.div`
    ${commonMaxWidth};
    width: 100%;
`;

const LockerMainPage = (): React.ReactNode => (
    <>
        <MainBlock>
            <Purpose />
            <MainSection>
                <AccountInput close={() => {}} confirm={() => {}} />
            </MainSection>
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

export default LockerMainPage;
