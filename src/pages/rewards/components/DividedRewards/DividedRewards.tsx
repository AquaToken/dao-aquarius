import * as React from 'react';
import styled from 'styled-components';

import { formatBalance } from 'helpers/format-number';

import { respondDown } from 'web/mixins';
import { Breakpoints } from 'web/styles';

import Aqua from 'assets/aqua-logo-small.svg';

import DotsLoader from 'basics/loaders/DotsLoader';

import { TotalRewards } from 'pages/vote/api/types';

const Container = styled.section`
    position: relative;
    height: 20rem;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    width: 100%;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        align-items: center;
        margin: 0 auto;
        padding: 0 1.6rem;
        max-width: 55rem;
        height: initial;
    `}
`;

const Card = styled.div`
    position: relative;
    display: flex;
    width: 58rem;
    align-items: flex-start;
    padding: 6rem 5.8rem;
    margin-top: -7rem;
    background: #ffffff;
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 0.5rem;

    &:first-child {
        margin-right: 6rem;
    }

    ${respondDown(Breakpoints.lg)`
        width: 40rem;
        padding: 4rem 3.8rem;
    `}

    ${respondDown(Breakpoints.md)`
        width: 100%;
        max-width: 43rem;
        margin-bottom: 0.8rem;
        margin-top: 0;
        margin-right: 0 !important;
        
        & > div {
            width: 100%;
            display: flex;
            align-items: center;
            flex-direction: column;
            justify-content: center;
        }
    `}
`;

const AquaLogo = styled(Aqua)`
    width: 3.3rem;
    height: 3.3rem;
    margin: 0.4rem 1.6rem 0 0;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const Amount = styled.div`
    font-size: 3.6rem;
    font-weight: 400;
    line-height: 4.2rem;
    letter-spacing: 0;
    margin-bottom: 0.6rem;

    ${respondDown(Breakpoints.md)`
        font-size: 1.8rem;
        font-weight: 700;
        line-height: 3rem;
    `}
`;

const Description = styled.div`
    font-size: 1.8rem;
    font-weight: 400;
    line-height: 3.2rem;
    letter-spacing: 0;

    ${respondDown(Breakpoints.md)`
        font-size: 1.4rem;
        line-height: 2.5rem;
    `}
`;

interface DividedRewardsProps {
    totalRewards: TotalRewards;
}

const DividedRewards = ({ totalRewards }: DividedRewardsProps): React.ReactNode => (
    <Container>
        <Card>
            <AquaLogo />
            <div>
                <Amount>
                    {totalRewards ? (
                        `${formatBalance(totalRewards.total_daily_sdex_reward)} AQUA`
                    ) : (
                        <DotsLoader />
                    )}
                </Amount>
                <Description>
                    <b>SDEX</b> daily reward
                </Description>
            </div>
        </Card>

        <Card>
            <AquaLogo />
            <div>
                <Amount>
                    {totalRewards ? (
                        `${formatBalance(totalRewards.total_daily_amm_reward)} AQUA`
                    ) : (
                        <DotsLoader />
                    )}
                </Amount>
                <Description>
                    <b>AMM</b> daily reward
                </Description>
            </div>
        </Card>
    </Container>
);

export default DividedRewards;
