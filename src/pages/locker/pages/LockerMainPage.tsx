import * as React from 'react';
import styled from 'styled-components';
import Purpose from '../components/LockerMainPage/Purpose/Purpose';
import AccountInput from '../components/AccountInput/AccountInput';
import { commonMaxWidth } from '../../../common/mixins';
import StatisticBlock from '../components/LockerMainPage/StatisticBlock/StatisticBlock';
import FreezeAQUA from '../components/LockerMainPage/FreezeAQUA/FreezeAQUA';
import WhyFreezeAQUA from '../components/LockerMainPage/WhyFreezeAQUA/WhyFreezeAQUA';
import FAQ from '../components/FAQ/FAQ';

const MainBlock = styled.main`
    flex: 1 0 auto;
`;

const MainSection = styled.div`
    ${commonMaxWidth};
    width: 100%;
`;

const LockerMainPage = (): JSX.Element => {
    return (
        <>
            <MainBlock>
                <Purpose />
                <MainSection>
                    <AccountInput />
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
            <FAQ />
        </>
    );
};

export default LockerMainPage;
