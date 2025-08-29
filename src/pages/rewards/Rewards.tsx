import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getTotalRewards } from 'api/rewards';

import { PageContainer, SectionWrapper } from 'web/pages/commonPageStyles';

import Community from 'components/Community';
import Subscribe from 'components/Subscribe';

import DividedRewards from './components/DividedRewards/DividedRewards';
import FAQ from './components/FAQ/FAQ';
import RewardsList from './components/RewardsList/RewardsList';
import TotalRewards from './components/TotalRewards/TotalRewards';

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

            <SectionWrapper>
                <Community />

                <Subscribe />
            </SectionWrapper>
        </PageContainer>
    );
};

export default Rewards;
