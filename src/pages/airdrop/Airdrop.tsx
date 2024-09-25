import * as React from 'react';
import styled from 'styled-components';
import { respondDown } from '../../common/mixins';
import { Breakpoints, COLORS } from '../../common/styles';
import SocialLinks from '../../common/components/SocialLinks/SocialLinks';
import ExternalLink from '../../common/basics/ExternalLink';
import Success from 'assets/icon-success-green.svg';
import { Link } from 'react-router-dom';
import { MainRoutes } from '../../routes';

const Container = styled.div`
    height: 100%;
    position: relative;
    overflow: auto;
    scroll-behavior: smooth;
    flex: 1 0 auto;

    ${respondDown(Breakpoints.md)`
        background-color: ${COLORS.lightGray};
        padding-bottom: 0;
    `}
`;

const Socials = styled.aside`
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    min-height: 70rem;
    max-height: 102rem;
`;

const Main = styled.section`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: Roboto, sans-serif;
    background-color: ${COLORS.lightGray};
    padding-top: 13rem;
    padding-bottom: 16rem;
`;

const Title = styled.h1`
    font-size: 8rem;
    font-style: normal;
    font-weight: 700;
    line-height: 9.4rem;
    letter-spacing: 0;
    color: ${COLORS.titleText};

    ${respondDown(Breakpoints.xl)`
        font-size: 7rem;
    `}

    ${respondDown(Breakpoints.lg)`
        font-size: 4.5rem;
    `}

    ${respondDown(Breakpoints.sm)`
        font-size: 2.4rem;
        line-height: 2.5rem;
    `}
`;

const Description = styled.div`
    margin: 3.2rem 0 10.2rem;
    max-width: 82rem;
    padding: 0 1rem;
    font-size: 1.8rem;
    font-style: normal;
    font-weight: 400;
    line-height: 3.2rem;
    letter-spacing: 0;
    text-align: center;
    color: ${COLORS.darkGrayText};

    ${respondDown(Breakpoints.xl)`
        max-width: 73rem;
        font-size: 1.6rem;
    `}

    ${respondDown(Breakpoints.lg)`
        max-width: 73rem;
        font-size: 1.6rem;
        line-height: 2.5rem;
        margin: 1.5rem 0 10.2rem;
    `}

    ${respondDown(Breakpoints.sm)`
        max-width: 50rem;
        margin: 1.5rem 0 4.2rem;
    `}
`;

const Cards = styled.div`
    display: flex;
    width: 100%;
    height: min-content;
    align-items: stretch;
    justify-content: center;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        padding: 0 1rem;
        align-items: center;
    `}
`;

const Card = styled.div`
    position: relative;
    width: 58rem;
    padding: 6rem;
    height: auto;
    background: ${COLORS.white};
    border-radius: 0.5rem;
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);

    &:first-child {
        margin-right: 6rem;
    }

    ${respondDown(Breakpoints.xl)`
        width: 46rem;
        min-height: 32rem;
        padding: 4rem;
        
        &:first-child {
            margin-right: 4rem;
        }
    `}

    ${respondDown(Breakpoints.lg)`
        width: 37rem;
        min-height: 27rem;
        padding: 2.5rem;

        &:first-child {
            margin-right: 2.5rem;
        }
    `}

    ${respondDown(Breakpoints.sm)`
        width: 100%;
        max-width: 39rem;
        min-height: 27rem;
        padding: 2.5rem;

        &:first-child {
           margin-right: 0;
           margin-bottom: 1.6rem;
        }
    `}
`;

const Heading = styled.div`
    font-size: 3.6rem;
    font-weight: 400;
    line-height: 4.2rem;
    letter-spacing: 0;
    margin-bottom: 0.4rem;
    color: ${COLORS.titleText};

    ${respondDown(Breakpoints.xl)`
        font-size: 3.4rem;
    `}

    ${respondDown(Breakpoints.lg)`
        font-size: 2.9rem;
        line-height: 3.3rem;
    `}

    ${respondDown(Breakpoints.sm)`
        font-size: 2.9rem;
        line-height: 3.3rem;
    `}
`;

const Label = styled.div`
    display: flex;
    align-items: center;
    width: min-content;
    padding: 0.7rem 0.9rem 0.7rem 0.7rem;
    background-color: ${COLORS.tooltip};
    border-radius: 0.5rem;
    font-size: 1.2rem;
    font-weight: 700;
    line-height: 1.4rem;
    color: ${COLORS.white};
    white-space: nowrap;
`;

const Text = styled.div`
    max-width: 36.6rem;
    margin: 2.4rem 0;
    font-size: 1.6rem;
    font-weight: 400;
    line-height: 2.9rem;
    letter-spacing: 0;
    color: ${COLORS.darkGrayText};

    ${respondDown(Breakpoints.xl)`
        max-width: 32.6rem;
        font-size: 1.4rem;
    `}

    ${respondDown(Breakpoints.lg)`
        max-width: 22rem;
        font-size: 1.4rem;
        line-height: 2.5rem;
    `}

    ${respondDown(Breakpoints.sm)`
        margin: 0.4rem 0;
        max-width: 29rem;
        font-size: 1.4rem;
        line-height: 2.5rem;
    `}
`;

const Phases = styled.div`
    display: flex;
    align-items: center;
    font-size: 1.8rem;
    line-height: 3.2rem;

    svg {
        width: 1.5rem;
        height: 1.9rem;
        margin-right: 0.6rem;
    }

    b {
        margin-right: 0.6rem;
    }

    ${respondDown(Breakpoints.lg)`
        font-size: 1.6rem;
    `}

    ${respondDown(Breakpoints.sm)`
        font-size: 1.6rem;
    `}
`;

const Airdrop = () => {
    return (
        <Container>
            <Socials>
                <SocialLinks />
            </Socials>
            <Main>
                <Title>Airdrop distributions complete</Title>
                <Description>
                    Both the Initial Airdrop & Airdrop #2 have been distributed in full. Eligible
                    users can claim their airdrop rewards monthly until March 2025.
                </Description>
                <Cards>
                    <Card>
                        <Heading>AQUA Airdrop #2</Heading>
                        <Label>⚡ Snapshot & distribution complete!</Label>
                        <Text>
                            XLM, yXLM & AQUA holders got a share of <b>15,000,000,000 AQUA</b> based
                            on their balances at the time of the January 15th 2022 snapshot. Rewards
                            have been distributed and can be claimed monthly inside of eligible
                            Stellar wallets.
                        </Text>
                        <ExternalLink asDiv>
                            <Link to={MainRoutes.airdrop2}>Read more</Link>
                        </ExternalLink>
                    </Card>
                    <Card>
                        <Heading>Initial Airdrop</Heading>
                        <Phases>
                            <Success />
                            <b>All 5</b> phases were completed!
                        </Phases>
                        <Text>
                            The initial 5 billion AQUA airdrop was successfully distributed. All
                            unclaimed funds were sent to the Aquarius DAO fund.
                        </Text>
                    </Card>
                </Cards>
            </Main>
        </Container>
    );
};

export default Airdrop;
