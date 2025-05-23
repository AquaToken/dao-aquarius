import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { MainRoutes } from 'constants/routes';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Background from 'assets/main-screen-img.svg';
import Stars from 'assets/main-stars.svg';

import Button from 'basics/buttons/Button';

import SocialLinks from 'components/SocialLinks';

const Main = styled.section`
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    padding-top: 11.2rem;
    padding-bottom: 15rem;
    flex: auto;
    position: relative;
    min-height: 0;
    overflow: hidden;
    top: -11.2rem;
    height: 100vh;

    ${respondDown(Breakpoints.md)`
        justify-content: flex-start;
        padding-top: 0;
        padding-bottom: 0;
        top: 0;
        height: calc(100vh - 20rem);
    `}
`;

const StarsImage = styled(Stars)`
    position: absolute;
    height: 100%;
    width: 100%;
    z-index: 15;
    top: 0;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const StyledBackground = styled(Background)`
    position: absolute;
    top: 5%;
    left: 55%;
    height: calc(90%);
    width: auto;
    z-index: 5;

    ${respondDown(Breakpoints.md)`
        position: relative;
        top: 0rem;
        left: 0;
        height: auto;
        width: auto;
        object-fit: cover;
        object-position: center;
    `}
`;

const TextBlock = styled.div`
    top: -11.2rem;
    max-width: 142rem;
    padding: 0 10rem;
    position: relative;
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    z-index: 19;

    ${respondDown(Breakpoints.md)`
        top: unset;
        padding: 0 1.6rem;
        max-width: 55rem;
    `}
`;

const Title = styled.h1`
    margin: 3.5rem 0 2rem;
    max-width: 80rem;
    font-weight: bold;
    font-size: 10rem;
    line-height: 9.4rem;
    color: ${COLORS.titleText};

    ${respondDown(Breakpoints.lg)`
        font-size: 5rem;
        line-height: 6.4rem;
    `}

    ${respondDown(Breakpoints.md)`
        margin: 1.6rem 0 1.6rem;
        max-width: 46rem;
        font-size: 3.9rem;
        line-height: 4.6rem;
    `}
`;

const Description = styled.p`
    margin-bottom: 3.2rem;
    max-width: 80rem;
    font-size: 1.8rem;
    line-height: 3rem;
    color: ${COLORS.descriptionText};
    opacity: 0.7;

    ${respondDown(Breakpoints.lg)`
        font-size: 1.4rem;
        line-height: 2.5rem;
        max-width: 55rem;
    `}

    ${respondDown(Breakpoints.md)`
        max-width: 46rem;
    `}
`;

const LinkButton = styled(Link)`
    color: ${COLORS.white};
    text-decoration: none;
    width: 100%;
    flex: 1;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const StyledButton = styled(Button)`
    width: 100%;
    flex: 1;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const Buttons = styled.div`
    display: flex;
    gap: 2.4rem;
    width: 50%;

    ${respondDown(Breakpoints.md)`
        width: 100%;
        flex-direction: column;
    `}
`;

const MainBlock = () => (
    <Main>
        <SocialLinks />
        <StarsImage />
        <StyledBackground />
        <TextBlock>
            <Title>Boost Liquidity</Title>
            <Description>
                Aquarius is a decentralized liquidity management platform for Stellar.
            </Description>
            <Buttons>
                <LinkButton to={MainRoutes.amm}>
                    <StyledButton isBig>Discover Pools</StyledButton>
                </LinkButton>
                <LinkButton to={MainRoutes.swap}>
                    <StyledButton secondary isBig>
                        Swap
                    </StyledButton>
                </LinkButton>
            </Buttons>
        </TextBlock>
    </Main>
);

export default MainBlock;
