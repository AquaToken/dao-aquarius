import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { MainRoutes } from 'constants/routes';

import { commonMaxWidth, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import LP from 'assets/landing-about-amm-80.svg';
import Bribes from 'assets/landing-about-bribes.svg';
import Voting from 'assets/landing-about-vote-markets-80.svg';
import DAO from 'assets/landing-about-vote-proposals-80.svg';

const Container = styled.section`
    padding: 0 10rem;
    ${commonMaxWidth};
    margin-top: 8rem;
    width: 100%;

    ${respondDown(Breakpoints.sm)`
        padding: 0 1.6rem;
        margin-top: 4.8rem;
    `}
`;

const Title = styled.h1`
    font-weight: 700;
    font-size: 5.6rem;
    line-height: 6.4rem;
    color: ${COLORS.titleText};

    ${respondDown(Breakpoints.sm)`
        font-size: 2.9rem;
        line-height: 3rem;
        font-weight: 400;
    `}
`;

const Description = styled.p`
    margin: 1.6rem 0 0;
    color: ${COLORS.paragraphText};
    font-size: 1.6rem;
    line-height: 2.8rem;
`;

const Links = styled.div`
    display: flex;
    gap: 3.8rem;
    margin-top: 4rem;
    flex-direction: column;

    ${respondDown(Breakpoints.sm)`
        gap: 1.6rem;
        margin-top: 0.8rem;
    `}
`;

const LinksRow = styled.div`
    display: flex;
    gap: 3.8rem;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        gap: 1.6rem;
    `}
`;

const LinkStyled = styled(Link)`
    display: flex;
    gap: 2.4rem;
    padding: 4rem 3.6rem;
    align-items: center;
    background-color: ${COLORS.lightGray};
    border-radius: 4.4rem;
    flex: 1;
    cursor: pointer;
    text-decoration: none;
    color: ${COLORS.titleText};

    h3 {
        font-size: 2rem;
        line-height: 2.8rem;
    }

    svg {
        min-width: 8rem;
    }
`;

const LinkContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
`;

const AboutToken = () => (
    <Container>
        <Title>What is AQUA token?</Title>
        <Description>
            AQUA is the utility token of Aquarius protocol, the largest DEX on Stellar network. It's
            used for:
        </Description>
        <Links>
            <LinksRow>
                <LinkStyled to={MainRoutes.rewards}>
                    <LP />
                    <LinkContent>
                        <h3>LP rewards</h3>
                        <p>Get rewards for depositing tokens into AMM and Stellar DEX</p>
                    </LinkContent>
                </LinkStyled>
                <LinkStyled to={MainRoutes.bribes}>
                    <Bribes />
                    <LinkContent>
                        <h3>Bribes</h3>
                        <p>Get paid from market creators for your votes</p>
                    </LinkContent>
                </LinkStyled>
            </LinksRow>
            <LinksRow>
                <LinkStyled to={MainRoutes.governance}>
                    <DAO />
                    <LinkContent>
                        <h3>Governance</h3>
                        <p>Influence on the protocol development</p>
                    </LinkContent>
                </LinkStyled>
                <LinkStyled to={MainRoutes.vote}>
                    <Voting />
                    <LinkContent>
                        <h3>Voting</h3>
                        <p>Support markets to inventivize liquidity providers</p>
                    </LinkContent>
                </LinkStyled>
            </LinksRow>
        </Links>
    </Container>
);

export default AboutToken;
