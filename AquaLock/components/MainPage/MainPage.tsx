import * as React from 'react';
import styled from 'styled-components';
import Purpose from './Purpose/Purpose';
import AccountInput from '../common/AccountInput/AccountInput';
import { commonMaxWidth } from '../../../common/mixins';
import FreezeAQUA from './FreezeAQUA/FreezeAQUA';
import WhyFreezeAQUA from './WhyFreezeAQUA/WhyFreezeAQUA';
import StatisticBlock from './StatisticBlock/StatisticBlock';

const MainBlock = styled.main`
    flex: 1 0 auto;
`;

const MainSection = styled.div`
    ${commonMaxWidth};
`;

const MainPage = (): JSX.Element => {
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

export default MainPage;
