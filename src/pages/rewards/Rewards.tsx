import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getTotalRewards } from 'api/rewards';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Community from 'components/Community';
import Subscribe from 'components/Subscribe';

import DividedRewards from './components/DividedRewards/DividedRewards';
import FAQ from './components/FAQ/FAQ';
import RewardsList from './components/RewardsList/RewardsList';
import TotalRewards from './components/TotalRewards/TotalRewards';

const Container = styled.div`
    height: 100%;
    position: relative;
    display: flex;
    flex: 1 0 auto;
    flex-direction: column;
    scroll-behavior: smooth;
    overflow: auto;

    ${respondDown(Breakpoints.md)`
        height: auto;
        background-color: ${COLORS.lightGray};
    `}
`;

const Rewards = () => {
    const [totalRewards, setTotalRewards] = useState(null);

    useEffect(() => {
        getTotalRewards().then(res => {
            setTotalRewards(res);
        });
    }, []);
    return (
        <Container>
            <TotalRewards totalRewards={totalRewards} />

            <DividedRewards totalRewards={totalRewards} />

            <RewardsList />

            <FAQ />

            <Community />

            <Subscribe />
        </Container>
    );
};

export default Rewards;
