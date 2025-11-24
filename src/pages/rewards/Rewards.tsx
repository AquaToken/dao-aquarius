import * as React from 'react';
import { useEffect, useState } from 'react';

import { getTotalRewards } from 'api/rewards';

import Community from 'components/Community';
import FAQ from 'components/FAQ';
import Subscribe from 'components/Subscribe';

import { PageContainer, SectionWrapper } from 'styles/commonPageStyles';

import { rewardsQuestions } from 'pages/rewards/components/Questions/Questions';

import DividedRewards from './components/DividedRewards/DividedRewards';
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

            <FAQ questions={rewardsQuestions} />

            <SectionWrapper>
                <Community />

                <Subscribe />
            </SectionWrapper>
        </PageContainer>
    );
};

export default Rewards;
