import * as React from 'react';
import styled from 'styled-components';

import Aqua from 'assets/aqua-logo-small.svg';

import DotsLoader from '../../../../common/basics/DotsLoader';
import { formatBalance } from '../../../../common/helpers/helpers';
import { respondDown } from '../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../common/styles';

const Container = styled.section`
    position: relative;
    width: 100%;
    height: 54rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background: ${COLORS.lightGray};

    ${respondDown(Breakpoints.md)`
        height: initial;
        padding: 18rem 0 3.3rem;
    `}
`;

const PreTitle = styled.div`
    font-size: 1.8rem;
    font-weight: 400;
    line-height: 3.2rem;
    margin-bottom: 2rem;

    ${respondDown(Breakpoints.lg)`
        font-size: 1.6rem;
    `}

    ${respondDown(Breakpoints.md)`
        font-size: 1.4rem;
        line-height: 2.5rem;
        margin-bottom: 0.6rem;
    `}
`;

const Title = styled.div`
    display: flex;
    align-items: center;
    font-size: 8rem;
    font-weight: 700;
    line-height: 9.4rem;

    ${respondDown(Breakpoints.lg)`
        font-size: 6rem;
    `}

    ${respondDown(Breakpoints.md)`
        display: flex;
        flex-direction: column;
        font-size: 2.4rem;
        line-height: 2.8rem;
    `}
`;

const AquaLogo = styled(Aqua)`
    width: 5.4rem;
    height: 5.4rem;
    margin-right: 1.6rem;

    ${respondDown(Breakpoints.md)`
        margin-bottom: 4.7rem;
        margin-right: 0;
        margin-top: -9.8rem;
    `}
`;

const Description = styled.div`
    font-size: 1.8rem;
    font-style: normal;
    font-weight: 400;
    line-height: 3.2rem;
    text-align: center;
    max-width: 80rem;
    margin-top: 3.2rem;
    color: ${COLORS.darkGrayText};

    ${respondDown(Breakpoints.lg)`
        max-width: 58rem;
        margin-top: 2rem;
        font-size: 1.4rem;
        line-height: 2.7rem;
    `}

    ${respondDown(Breakpoints.md)`
        margin: 2rem 0;
        padding: 0 1.5rem;
        line-height: 2.5rem;
    `}
`;

const TotalRewards = ({ totalRewards }) => {
    return (
        <Container>
            <PreTitle>Total daily reward:</PreTitle>

            <Title>
                <AquaLogo />
                {totalRewards ? (
                    `${formatBalance(
                        totalRewards.total_daily_sdex_reward + totalRewards.total_daily_amm_reward,
                    )} AQUA`
                ) : (
                    <DotsLoader />
                )}
            </Title>
            <Description>
                The core use case of Aquarius is to increase liquidity on Stellar. We plan to
                achieve this by incentivizing SDEX market makers & AMM liquidity providers. This
                page tracks AQUA rewards on different markets and how they are distributed between
                SDEX markets and AMM pools.
            </Description>
        </Container>
    );
};

export default TotalRewards;
