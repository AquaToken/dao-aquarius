import * as React from 'react';

import { useScrollAnimation } from 'hooks/useScrollAnimation';

import FreezeAquaImage from 'assets/locker/freeze-aqua.svg';

import { ExternalLink } from 'basics/links';

import { Container, TextBlock, Title, Description, ImageWrapper } from './FreezeAQUA.styled';

const FreezeAQUA: React.FC = () => {
    const { ref, visible } = useScrollAnimation(0.2, true);

    return (
        <Container ref={ref} $visible={visible}>
            <TextBlock $visible={visible}>
                <Title>Freeze AQUA, Get ICE</Title>
                <Description $visible={visible}>
                    <b>Freeze your AQUA to receive ICE</b> — a non-transferable token that gives you
                    more influence over how rewards are distributed across AMM and SDEX markets. ICE
                    also boosts your earnings through bribes for voting and higher yields from
                    liquidity rewards.
                    <br />
                    <br />
                    You choose how much AQUA to freeze and for how long — from 1 week up to 3 years.
                    The longer you lock it, the more ICE you receive per token. More ICE means more
                    voting influence and greater rewards.
                    <br />
                    <br />
                    Inspired by veCRV on Curve, this system has been reimagined for Stellar and
                    fully integrated into Aquarius.
                </Description>
                <ExternalLink href="https://docs.aqua.network/ice/ice-tokens-locking-aqua-and-getting-benefits">
                    Read more about freezing AQUA
                </ExternalLink>
            </TextBlock>

            <ImageWrapper $visible={visible}>
                <FreezeAquaImage />
            </ImageWrapper>
        </Container>
    );
};

export default FreezeAQUA;
