import styled from 'styled-components';

import HowItWorksIcon from 'assets/main-page/how-it-works.svg';

import { flexAllCenter, respondDown } from 'web/mixins';

import { Breakpoints, COLORS } from 'web/styles';
import { BlankRouterLink } from 'basics/links';
import { MainRoutes } from 'constants/routes';

const Wrapper = styled.section`
    ${flexAllCenter};
    flex-direction: column;
    margin-top: 11rem;

    ${respondDown(Breakpoints.md)`
        margin-top: 10rem;
    `}

    ${respondDown(Breakpoints.sm)`
        margin-top: 6rem;
    `}

    ${respondDown(Breakpoints.xs)`
        margin-top: 4rem;
    `}
`;

const Title = styled.div`
    font-weight: bold;
    font-size: 7rem;
    color: ${COLORS.titleText};
    line-height: 100%;

    ${respondDown(Breakpoints.md)`
        font-size: 5.6rem;
    `}

    ${respondDown(Breakpoints.sm)`
        font-size: 3.2rem;
    `}

    ${respondDown(Breakpoints.xs)`
        font-size: 2.4rem;
    `}
`;

const BlocksWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    gap: 6rem;

    ${respondDown(Breakpoints.md)`
        gap: 4rem;
    `}

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        gap: 4rem;
    `}
`;

const Block = styled.div`
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    width: 50%;

    ${respondDown(Breakpoints.sm)`
        width: 100%;
    `}
`;

const BlockInteractive = styled(Block)`
    gap: 1.6rem;
    justify-content: flex-start;
    order: 3;

    ${respondDown(Breakpoints.xs)`
        gap: 0.8rem;
    `}
`;

const TitleBlock = styled(Block)`
    display: flex;
    flex-direction: column;
    gap: 2.4rem;
    flex-basis: 100%;
    max-width: 50%;
    order: 1;

    ${respondDown(Breakpoints.sm)`
        gap: 1.6rem;
        max-width: 100%;
    `}
`;

const IconBlock = styled(Block)`
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    flex: 1;
    width: 50%;
    order: 3;

    svg {
        width: 100%;
        height: 54.6rem;
    }

    ${respondDown(Breakpoints.md)`
        svg {
            height: 43.5rem;
        }
    `}

    ${respondDown(Breakpoints.sm)`
        width: 100%;
        order: 2;
        
        svg {
            height: 38rem;
        }
    `}

    ${respondDown(Breakpoints.xs)`
        svg {
            height: 30rem;
        }
    `}
`;

const Description = styled.div`
    font-size: 1.6rem;
    font-weight: 500;
    line-height: 180%;
    color: #4d4f68;

    ${respondDown(Breakpoints.xs)`
        font-size: 1.4rem;
    `}
`;

const InteractiveItem = styled.div`
    background-color: ${COLORS.lightGray};
    border-radius: 48px;
    padding: 3.2rem 4rem;
    transition: all 0.2s ease-in-out;
    display: flex;
    flex-direction: column;

    &:hover,
    :active {
        background-color: ${COLORS.purple};

        & div {
            cursor: pointer;
            color: ${COLORS.white};
        }
    }

    ${respondDown(Breakpoints.sm)`
        border-radius: 3.2rem;
        padding: 2.4rem;
    `}

    ${respondDown(Breakpoints.xs)`
        padding: 1.6rem 2.4rem;
    `}
`;

const InteractiveTitle = styled.div`
    font-weight: bold;
    font-size: 1.6rem;
    line-height: 3.6rem;
    color: ${COLORS.titleText};
    text-transform: uppercase;
`;

const HowItWorks = () => (
    <Wrapper id="how-it-works">
        <BlocksWrapper>
            <TitleBlock>
                <Title>How it works</Title>
                <Description>
                    Protocol incentives and mechanics are designed to support deep liquidity and
                    sustainable DeFi growth on Stellar.
                </Description>
            </TitleBlock>
            <BlockInteractive>
                <InteractiveItem>
                    <InteractiveTitle>Traders</InteractiveTitle>
                    <Description>
                        Swap tokens easily using Aquarius AMMs with low fees and fast Stellar-based
                        execution.
                    </Description>
                </InteractiveItem>
                <InteractiveItem>
                    <InteractiveTitle>Voters</InteractiveTitle>
                    <Description>
                        Lock AQUA to vote for pools and direct emissions. Earn weekly incentives and
                        voting rewards.
                    </Description>
                </InteractiveItem>
                <InteractiveItem>
                    <InteractiveTitle>Liquidity Providers</InteractiveTitle>
                    <Description>
                        Provide liquidity to AMM pools to earn AQUA rewards and fees.
                    </Description>
                </InteractiveItem>
            </BlockInteractive>
            <IconBlock>
                <HowItWorksIcon />
            </IconBlock>
        </BlocksWrapper>
    </Wrapper>
);

export default HowItWorks;
