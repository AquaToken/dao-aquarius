import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getTotalRewards } from 'api/rewards';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS, MAX_WIDTHS } from 'web/styles';

import Community from 'components/Community';
import Subscribe from 'components/Subscribe';

import DividedRewards from './components/DividedRewards/DividedRewards';
import FAQ from './components/FAQ/FAQ';
import RewardsList from './components/RewardsList/RewardsList';
import TotalRewards from './components/TotalRewards/TotalRewards';
import { PageContainer } from 'web/pages/commonPageStyles';

const Wrapper = styled.div`
    max-width: 122rem;
    width: 100%;
`;

const Rewards = () => {
    const [totalRewards, setTotalRewards] = useState(null);

    useEffect(() => {
        getTotalRewards().then(res => {
            setTotalRewards(res);
        });
    }, []);

    return (
        <PageContainer>
            <TotalRewards totalRewards={totalRewards} />

            <DividedRewards totalRewards={totalRewards} />

            <RewardsList />

            <FAQ />

            <Wrapper>
                <Community />

                <Subscribe />
            </Wrapper>
        </PageContainer>
    );
};

export default Rewards;
