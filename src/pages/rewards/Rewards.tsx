import * as React from 'react';
import styled from 'styled-components';
import { respondDown } from '../../common/mixins';
import { Breakpoints, COLORS } from '../../common/styles';
import TotalRewards from './components/TotalRewards/TotalRewards';
import { useEffect, useState } from 'react';
import { getTotalRewards } from './api/api';
import DividedRewards from './components/DividedRewards/DividedRewards';
import RewardsList from './components/RewardsList/RewardsList';
import FAQ from './components/FAQ/FAQ';
import Community from '../../common/components/Community/Community';
import Subscribe from '../../common/components/Subscribe/Subscribe';

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
        getTotalRewards().then((res) => {
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
