import * as React from 'react';
import styled from 'styled-components';

import FreezeAquaImage from 'assets/locker/freeze-aqua.svg';

import { ExternalLink } from 'basics/links';

import { respondDown } from '../../../../web/mixins';
import { Breakpoints, COLORS } from '../../../../web/styles';

const Container = styled.div`
    display: flex;
    flex-direction: row;
    padding: 0 4rem;

    ${respondDown(Breakpoints.md)`
        padding: 4rem 1.6rem;
        flex-direction: column-reverse;
    `}
`;

const TextBlock = styled.div`
    display: flex;
    flex-direction: column;
    padding-top: 13rem;
    width: 50%;

    ${respondDown(Breakpoints.md)`
        width: 100%;
        padding-top: 0;
    `}
`;

const Title = styled.span`
    font-size: 3.5rem;
    line-height: 4.1rem;
    color: ${COLORS.purple950};

    ${respondDown(Breakpoints.md)`
        font-size: 2.5rem;
    `}
`;

const TitleOpacity = styled.span`
    opacity: 0.2;
`;

const Description = styled.span`
    font-size: 1.6rem;
    color: ${COLORS.textDark};
    margin-top: 3rem;
    margin-bottom: 3rem;
    line-height: 180%;
`;

const Image = styled(FreezeAquaImage)`
    width: 50%;
    margin-left: -10%;

    ${respondDown(Breakpoints.md)`
        width: 100%;
        margin-left: 0;
        max-height: 40rem;
    `}
`;

const FreezeAQUA = (): JSX.Element => (
    <Container>
        <TextBlock>
            <Title>
                Freeze AQUA <TitleOpacity>= Get ICE</TitleOpacity>
            </Title>
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
