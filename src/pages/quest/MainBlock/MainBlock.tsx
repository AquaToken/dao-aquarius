import * as React from 'react';
import styled from 'styled-components';

import { commonMaxWidth, flexAllCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Pending from 'assets/icon-pending-purple.svg';
import Present from 'assets/icon-present.svg';
import Bg from 'assets/quests-page-bg.svg';

import AnimatedBorderedText from 'pages/quest/AnimatedBorderedText/AnimatedBorderedText';

const Container = styled.section`
    display: flex;
    flex-direction: column;
    position: relative;

    ${respondDown(Breakpoints.md)`
        height: unset;
    `}
`;

const Content = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 15rem 0 16rem;
    z-index: 20;
    ${commonMaxWidth};

    ${respondDown(Breakpoints.md)`
        padding-top: 10rem;
    `}

    ${respondDown(Breakpoints.sm)`
        padding: 25rem 0 5rem;
    `}
`;

const Background = styled(Bg)`
    position: absolute;
    height: 90rem;
    right: -20rem;
    top: -11.2rem;

    ${respondDown(Breakpoints.lg)`
        right: -25rem;
    `}

    ${respondDown(Breakpoints.md)`
        width: 60rem;
        right: -20rem;
        top: -10rem;
    `}

    ${respondDown(Breakpoints.sm)`
        left: 50%;
        transform: translate(-50%, 0);
        height: 45rem;
        right: unset;
        width: unset;
    `}
`;

const Title = styled.div`
    display: flex;
    flex-direction: column;
    font-weight: 700;
    font-size: 10rem;
    line-height: 10rem;

    ${respondDown(Breakpoints.lg)`
        font-size: 7rem;
        line-height: 7rem;
    `}

    ${respondDown(Breakpoints.md)`
        font-size: 5rem;
        line-height: 5rem;
    `}
`;

const Description = styled.p`
    font-size: 1.6rem;
    line-height: 180%;
    color: ${COLORS.grayText};
    margin: 2.4rem 0;
    width: 50%;

    ${respondDown(Breakpoints.sm)`
        font-size: 1.4rem;
        width: 100%;
    `}
`;

const TotalPrizeWrapper = styled.div`
    position: relative;
    width: fit-content;
    border-radius: 2.4rem;
    padding: 0.3rem;
    background: linear-gradient(90deg, #bf61e8 0%, #6423af 96.83%);
`;

const TotalPrize = styled.div`
    display: flex;
    padding: 1.8rem 2.4rem;
    border-radius: 2.1rem;
    background: white;
    gap: 1.6rem;
    align-items: center;
`;

const IconWrapper = styled.div`
    background-color: ${COLORS.lightGray};
    padding: 0.8rem;
    border-radius: 0.8rem;
    ${flexAllCenter};
`;

const TotalText = styled.div`
    display: flex;
    flex-direction: column;

    span:first-child {
        font-size: 1.6rem;
        color: ${COLORS.grayText};
        line-height: 180%;
    }

    span:last-child {
        font-weight: 700;
        font-size: 1.9rem;
        line-height: 100%;
        letter-spacing: 0.2em;
        color: ${COLORS.deepPurple};
    }
`;

const Summary = styled.div`
    display: flex;
    gap: 1.6rem;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
    `}
`;

const MainBlock = () => (
    <Container>
        <Content>
            <Background />
            <Title>
                <AnimatedBorderedText /> to Aquarius
            </Title>
            <Description>
                Earn tokens by exploring DeFi on Stellar and completing simple on-chain actions.
            </Description>

            <Summary>
                <TotalPrizeWrapper>
                    <TotalPrize>
                        <IconWrapper>
                            <Present />
                        </IconWrapper>
                        <TotalText>
                            <span>Prize fund:</span>
                            <span>$15,000</span>
                        </TotalText>
                    </TotalPrize>
                </TotalPrizeWrapper>

                <TotalPrizeWrapper>
                    <TotalPrize>
                        <IconWrapper>
                            <Pending />
                        </IconWrapper>
                        <TotalText>
                            <span>Quest ends:</span>
                            <span>07.07.2025</span>
                        </TotalText>
                    </TotalPrize>
                </TotalPrizeWrapper>
            </Summary>
        </Content>
    </Container>
);

export default MainBlock;
