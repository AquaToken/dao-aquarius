import * as React from 'react';
import styled from 'styled-components';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS, FONT_SIZE } from 'web/styles';

import FreezeAquaImage from 'assets/locker/freeze-aqua.svg';

import { ExternalLink } from 'basics/links';

const Container = styled.div`
    display: flex;
    flex-direction: row;
    padding: 6rem 4rem;
    gap: 9rem;

    ${respondDown(Breakpoints.sm)`
        gap: 5rem;
    `}

    ${respondDown(Breakpoints.sm)`
        padding: 0 1.6rem;
        flex-direction: column-reverse;
        gap: 3.2rem;
    `}
`;

const TextBlock = styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;

    ${respondDown(Breakpoints.sm)`
        width: 100%;
        padding-top: 0;
    `}
`;

const Title = styled.span`
    ${FONT_SIZE.xxl};
    font-weight: 700;
    color: ${COLORS.textPrimary};

    ${respondDown(Breakpoints.sm)`
        ${FONT_SIZE.xl}
    `}
`;

const Description = styled.span`
    font-size: 1.6rem;
    color: ${COLORS.textDark};
    margin-top: 3rem;
    margin-bottom: 3rem;
    line-height: 180%;
`;

const Image = styled(FreezeAquaImage)`
    width: 40%;
    margin: -5rem auto 0;

    ${respondDown(Breakpoints.sm)`
        width: 100%;
        margin: 0 auto;
        max-height: 40rem;
        
    `}
`;

const FreezeAQUA = (): JSX.Element => (
    <Container>
        <TextBlock>
            <Title>Freeze AQUA, Get ICE</Title>
            <Description>
                <b>Freeze your AQUA to receive ICE</b> — a non-transferable token that gives you
                more influence over how rewards are distributed across AMM and SDEX markets. ICE
                also boosts your earnings through bribes for voting and higher yields from liquidity
                rewards.
                <br />
                <br />
                You choose how much AQUA to freeze and for how long — from 1 week up to 3 years. The
                longer you lock it, the more ICE you receive per token. More ICE means more voting
                influence and greater rewards.
                <br />
                <br />
                Inspired by veCRV on Curve, this system has been reimagined for Stellar and fully
                integrated into Aquarius.
            </Description>
            <ExternalLink href=" https://docs.aqua.network/ice/ice-tokens-locking-aqua-and-getting-benefits">
                Read more about freezing AQUA
            </ExternalLink>
        </TextBlock>
        <Image />
    </Container>
);

export default FreezeAQUA;
