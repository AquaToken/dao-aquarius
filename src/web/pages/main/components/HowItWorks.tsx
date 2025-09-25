import styled from 'styled-components';

import { flexAllCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import HowItWorksIcon from 'assets/main-page/how-it-works.svg';

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
    color: ${COLORS.textPrimary};
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
    color: ${COLORS.gray550};

    ${respondDown(Breakpoints.xs)`
        font-size: 1.4rem;
    `}
`;

const InteractiveItem = styled.div`
    background-color: ${COLORS.gray50};
    border-radius: 48px;
    padding: 3.2rem 4rem;
    display: flex;
    flex-direction: column;

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
    color: ${COLORS.textPrimary};
    text-transform: uppercase;
`;

const HowItWorks = () => (
    <Wrapper id="how-it-works">
        <BlocksWrapper>
            <TitleBlock>
                <Title>How it works</Title>
                <Description>
                    Aquarius incentives are designed to drive deep liquidity and sustainable DeFi
                    growth.
                </Description>
            </TitleBlock>
            <BlockInteractive>
                <InteractiveItem>
                    <InteractiveTitle>Traders</InteractiveTitle>
                    <Description>
                        Swap tokens seamlessly through Aquarius AMMs with low fees and fast on-chain
                        execution.
                    </Description>
                </InteractiveItem>
                <InteractiveItem>
                    <InteractiveTitle>Voters</InteractiveTitle>
                    <Description>
                        Lock AQUA into ICE to vote on pools and direct emissions. Earn AQUA rewards
                        every day for voting!
                    </Description>
                </InteractiveItem>
                <InteractiveItem>
                    <InteractiveTitle>Liquidity Providers</InteractiveTitle>
                    <Description>
                        Provide liquidity to AMM pools and earn AQUA rewards, trading fees, and
                        occasional bonus tokens.
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
