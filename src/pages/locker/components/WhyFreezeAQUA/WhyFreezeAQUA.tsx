import * as React from 'react';
import styled from 'styled-components';

import Image1 from 'assets/locker/why-freeze-aqua-1.svg';
import Image2 from 'assets/locker/why-freeze-aqua-2.svg';
import Image3 from 'assets/locker/why-freeze-aqua-3.svg';

import { flexColumn, respondDown } from '../../../../web/mixins';
import { Breakpoints, COLORS, FONT_SIZE } from '../../../../web/styles';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    padding: 0 4rem;
    margin-top: 6rem;
    margin-bottom: 6rem;

    ${respondDown(Breakpoints.md)`
        padding: 4rem 1.6rem 0;
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
    ${flexColumn};
    width: 100%;

    svg {
        min-height: 13.8rem;
        min-width: 13.8rem;
    }

    ${respondDown(Breakpoints.md)`
        flex-direction: row;
        margin-bottom: 3.2rem;
        gap: 1.6rem;
    `}
`;

const TextWrap = styled.div`
    ${flexColumn};
`;

const Title = styled.span`
    font-size: 3.5rem;
    line-height: 4.1rem;
    color: ${COLORS.purple950};
    margin-bottom: 7rem;

    ${respondDown(Breakpoints.md)`
        ${FONT_SIZE.xl};
        font-weight: 700;
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
        margin-top: 0;
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
                <TextWrap>
                    <ColumnTitle>Boosted Liquidity Rewards</ColumnTitle>
                    <ColumnText>
                        ICE boosts your AQUA rewards when providing liquidity on both SDEX and AMM
                        markets. The more ICE you hold, the higher your boost — up to 250% of the
                        normal rewards. Earn more from the same position just by freezing AQUA
                    </ColumnText>
                </TextWrap>
            </Column>
            <Column>
                <Image3 />
                <TextWrap>
                    <ColumnTitle>Unlock voting</ColumnTitle>
                    <ColumnText>
                        Use ICE to participate in Aquarius governance and liquidity voting. The
                        longer is the lock period of ICE the more voting power you gain.
                    </ColumnText>
                </TextWrap>
            </Column>
            <Column>
                <Image2 />
                <TextWrap>
                    <ColumnTitle>Earn for Voting</ColumnTitle>
                    <ColumnText>
                        Voting with ICE lets you earn additional incentives through bribes —
                        including protocol-funded ones tied to market activity. You can also
                        delegate your ICE to trusted community members and earn passively while they
                        vote on your behalf.
                    </ColumnText>
                </TextWrap>
            </Column>
        </Content>
    </Container>
);

export default WhyFreezeAQUA;
