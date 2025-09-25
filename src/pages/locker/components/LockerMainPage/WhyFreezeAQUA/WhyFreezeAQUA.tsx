import * as React from 'react';
import styled from 'styled-components';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Image1 from 'assets/why-freeze-aqua-1.svg';
import Image2 from 'assets/why-freeze-aqua-2.svg';
import Image3 from 'assets/why-freeze-aqua-3.svg';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    padding: 0 4rem;
    margin-top: 10rem;
    margin-bottom: 18rem;

    ${respondDown(Breakpoints.md)`
        padding: 4rem 1.6rem;
        margin-top: 0;
        margin-bottom: 0;
    `}
`;

const Content = styled.div`
    display: flex;
    gap: 6rem;

    ${respondDown(Breakpoints.md)`
        gap: 0;
        flex-direction: column;
    `}
`;

const Column = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;

    svg {
        min-height: 13.8rem;
    }

    ${respondDown(Breakpoints.md)`
        margin-bottom: 8rem;
    `}
`;

const Title = styled.span`
    font-size: 3.5rem;
    line-height: 4.1rem;
    color: ${COLORS.purple950};
    margin-bottom: 7rem;

    ${respondDown(Breakpoints.md)`
        font-size: 2.5rem;
        margin-bottom: 3rem;
    `}
`;

const ColumnTitle = styled.span`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.textPrimary};
    margin-top: 5.5rem;
    margin-bottom: 2.3rem;

    ${respondDown(Breakpoints.md)`
        margin-top: 2rem;
    `}
`;

const ColumnText = styled.span`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textTertiary};
`;

const WhyFreezeAQUA = (): JSX.Element => (
    <Container>
        <Title>Why freeze AQUA?</Title>
        <Content>
            <Column>
                <Image1 />
                <ColumnTitle>Boosted Liquidity Rewards</ColumnTitle>
                <ColumnText>
                    ICE boosts your AQUA rewards when providing liquidity on both SDEX and AMM
                    markets. The more ICE you hold, the higher your boost — up to 250% of the normal
                    rewards. Earn more from the same position just by freezing AQUA
                </ColumnText>
            </Column>
            <Column>
                <Image3 />
                <ColumnTitle>Unlock voting</ColumnTitle>
                <ColumnText>
                    Use ICE to participate in Aquarius governance and liquidity voting. The longer
                    is the lock period of ICE the more voting power you gain.
                </ColumnText>
            </Column>
            <Column>
                <Image2 />
                <ColumnTitle>Earn for Voting</ColumnTitle>
                <ColumnText>
                    Voting with ICE lets you earn additional incentives through bribes — including
                    protocol-funded ones tied to market activity. You can also delegate your ICE to
                    trusted community members and earn passively while they vote on your behalf.
                </ColumnText>
            </Column>
        </Content>
    </Container>
);

export default WhyFreezeAQUA;
