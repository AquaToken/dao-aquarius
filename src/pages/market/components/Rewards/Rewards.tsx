import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { formatBalance } from 'helpers/format-number';

import { Asset } from 'types/stellar';

import PageLoader from 'basics/loaders/PageLoader';

import { respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import { getRewards } from 'pages/vote/api/api';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.white};
    padding: 4.2rem 3.2rem 2rem;
    border-radius: 0.5rem;

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 1.6rem;
    `}
`;

const Title = styled.span`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    margin-bottom: 4rem;
    color: ${COLORS.textPrimary};
`;

const Description = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textSecondary};
    opacity: 0.7;
    margin-bottom: 3.2rem;
`;

const Loader = styled.div`
    display: flex;
    padding: 5rem 0;
`;

const Details = styled.div`
    display: flex;
    margin-bottom: 3.2rem;

    ${respondDown(Breakpoints.md)`
         flex-direction: column;
    `}
`;

const DetailsColumn = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;

    ${respondDown(Breakpoints.md)`
         margin-bottom: 3.2rem;
    `}
`;

const DetailTitle = styled.span`
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.textGray};
    margin-bottom: 0.8rem;
`;

const DetailValue = styled.span`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.purple950};
    width: min-content;
    white-space: nowrap;
`;

interface RewardsProps {
    base: Asset;
    counter: Asset;
}

const Rewards = ({ base, counter }: RewardsProps): React.ReactNode => {
    const [rewards, setRewards] = useState(null);

    useEffect(() => {
        getRewards().then(res => {
            setRewards(res);
        });
    }, []);

    const pairRewards = useMemo(() => {
        if (!rewards) {
            return null;
        }
        return rewards.find(
            reward =>
                (reward.market_key.asset1_code === base.code &&
                    reward.market_key.asset1_issuer === (base.issuer || '') &&
                    reward.market_key.asset2_code === counter.code &&
                    reward.market_key.asset2_issuer === (counter.issuer || '')) ||
                (reward.market_key.asset1_code === counter.code &&
                    reward.market_key.asset1_issuer === (counter.issuer || '') &&
                    reward.market_key.asset2_code === base.code &&
                    reward.market_key.asset2_issuer === (base.issuer || '')),
        );
    }, [rewards]);

    if (!rewards) {
        return (
            <Container>
                <Title>Rewards</Title>
                <Loader>
                    <PageLoader />
                </Loader>
            </Container>
        );
    }

    if (!pairRewards) {
        return (
            <Container>
                <Title>Rewards</Title>
                <Description>No rewards for this pair</Description>
            </Container>
        );
    }

    return (
        <Container>
            <Title>Rewards</Title>
            <Details>
                <DetailsColumn>
                    <DetailTitle>SDEX daily reward</DetailTitle>
                    <DetailValue>
                        {formatBalance(pairRewards.daily_sdex_reward, true)} AQUA
                    </DetailValue>
                </DetailsColumn>
                <DetailsColumn>
                    <DetailTitle>Aquarius AMM daily reward</DetailTitle>
                    <DetailValue>
                        {formatBalance(pairRewards.daily_amm_reward, true)} AQUA
                    </DetailValue>
                </DetailsColumn>
                <DetailsColumn>
                    <DetailTitle>Total daily rewards:</DetailTitle>
                    <DetailValue>
                        {formatBalance(pairRewards.daily_total_reward, true)} AQUA
                    </DetailValue>
                </DetailsColumn>
            </Details>
        </Container>
    );
};

export default Rewards;
