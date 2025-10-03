import * as React from 'react';
import styled from 'styled-components';

import { LockerRoutes } from 'constants/routes';

import CircleButton from 'web/basics/buttons/CircleButton';
import { commonMaxWidth, respondDown } from 'web/mixins';
import { Breakpoints, COLORS, FONT_SIZE } from 'web/styles';

import ArrowLeft from 'assets/icons/arrows/arrow-left-16.svg';
import LockerMainImage from 'assets/locker/locker-main.svg';

import { BlankRouterLink } from 'basics/links';

const Container = styled.div`
    background-color: ${COLORS.gray50};
`;

const Content = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    ${commonMaxWidth};
    padding: 0 4rem;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        padding: 0 1.6rem;
        gap: 1.6rem;
    `}
`;

const Image = styled(LockerMainImage)`
    max-height: 70vh;
    margin: auto;

    ${respondDown(Breakpoints.lg)`
        max-height: 50rem;
    `}

    ${respondDown(Breakpoints.md)`
        max-height: 30rem;
    `}
`;

const TextContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin-right: 6.2rem;
    flex: 1;
    justify-content: center;
    padding: 5% 0;
    max-width: 45rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
        margin-right: 0;
        max-width: unset;
    `}
`;

const Title = styled.span`
    font-weight: bold;
    font-size: 5.6rem;
    line-height: 6.4rem;
    color: ${COLORS.textPrimary};
    margin-bottom: 1.6rem;

    ${respondDown(Breakpoints.md)`
        ${FONT_SIZE.xl}
    `}
`;

const Description = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textDark};
`;

const BackButton = styled(CircleButton)`
    margin-bottom: 4.5rem;

    ${respondDown(Breakpoints.md)`
        margin-bottom: 3.2rem;
    `}
`;

const Purpose = (): JSX.Element => (
    <Container>
        <Content>
            <TextContainer>
                <BlankRouterLink to={LockerRoutes.main}>
                    <BackButton label="Back to locker">
                        <ArrowLeft />
                    </BackButton>
                </BlankRouterLink>
                <Title>Freeze your AQUA into ICE!</Title>
                <Description>
                    Lock AQUA to receive ICE — a non-transferable token that boosts your voting
                    power and increases your rewards across the Aquarius ecosystem. Use ICE to vote
                    for markets, earn bribes and protocol incentives, and unlock higher yields
                    through ICE Boosts when providing liquidity on AMM or SDEX.
                </Description>
            </TextContainer>
            <Image />
        </Content>
    </Container>
);

export default Purpose;
