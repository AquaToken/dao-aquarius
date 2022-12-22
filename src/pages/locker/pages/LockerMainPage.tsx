import * as React from 'react';
import styled from 'styled-components';
import Purpose from '../components/LockerMainPage/Purpose/Purpose';
import AccountInput from '../components/AccountInput/AccountInput';
import { commonMaxWidth } from '../../../common/mixins';
import FreezeAQUA from '../components/LockerMainPage/FreezeAQUA/FreezeAQUA';
import WhyFreezeAQUA from '../components/LockerMainPage/WhyFreezeAQUA/WhyFreezeAQUA';
import StatisticBlock from '../components/LockerMainPage/StatisticBlock/StatisticBlock';

const MainBlock = styled.main`
    flex: 1 0 auto;
`;

const MainSection = styled.div`
    ${commonMaxWidth};
`;

const LockerMainPage = (): JSX.Element => {
    return (
        <MainBlock>
            <Purpose />
            <MainSection>
                <AccountInput />
            </MainSection>
            <MainSection>
                <StatisticBlock />
            </MainSection>
            <MainSection>
                <FreezeAQUA />
            </MainSection>
            <MainSection>
                <WhyFreezeAQUA />
            </MainSection>
        </MainBlock>
    );
};

export default LockerMainPage;
