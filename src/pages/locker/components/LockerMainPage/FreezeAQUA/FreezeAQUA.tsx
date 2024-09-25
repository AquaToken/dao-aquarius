import * as React from 'react';
import styled from 'styled-components';

import FreezeAquaImage from 'assets/freeze-aqua.svg';

import ExternalLink from 'basics/ExternalLink';

import { respondDown } from '../../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../../common/styles';

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
    color: ${COLORS.buttonBackground};

    ${respondDown(Breakpoints.md)`
        font-size: 2.5rem;
    `}
`;

const TitleOpacity = styled.span`
    opacity: 0.2;
`;

const Description = styled.span`
    font-size: 1.6rem;
    color: ${COLORS.darkGrayText};
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
                Freeze AQUA <TitleOpacity>= Lock AQUA</TitleOpacity>
            </Title>
            <Description>
                ICE tokens work similarly to veCRV on the Curve platform, with users locking the
                main CRV token in exchange for veCRV. This secondary token allows for voting in
                governance and boosts CRV liquidity rewards on Curve.
                <br />
                <br />
                We have taken this core idea and revamped it for use inside the Stellar ecosystem.
                Users who lock (freeze) AQUA will receive four additional non-transferable tokens
                inside their Stellar wallets, specifically for use in the Aquarius universe.
            </Description>
            <ExternalLink href="https://medium.com/aquarius-aqua/ice-the-next-stage-of-aquarius-810edc7cf3bb">
                Read more about freezing AQUA
            </ExternalLink>
        </TextBlock>
        <Image />
    </Container>
);

export default FreezeAQUA;
