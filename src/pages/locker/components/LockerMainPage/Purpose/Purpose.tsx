import * as React from 'react';
import styled from 'styled-components';

import { commonMaxWidth, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import LockerMainImage from 'assets/locker-main.svg';

const Container = styled.div`
    background-color: ${COLORS.buttonBackground};
    padding: 5% 0;
`;

const Content = styled.div`
    display: flex;
    flex-direction: row;
    ${commonMaxWidth};
    padding: 0 4rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column-reverse;
        padding: 0 1.6rem;
        gap: 1.6rem;
    `}
`;

const Image = styled(LockerMainImage)`
    max-height: 40rem;
    ${respondDown(Breakpoints.md)`
        max-height: 30rem;
    `}
`;

const TextContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 67.6rem;
    margin-right: 6.2rem;
    flex: 1;
    justify-content: center;

    ${respondDown(Breakpoints.md)`
        min-width: unset;
        margin-right: 0;
    `}
`;

const Title = styled.span`
    font-weight: bold;
    font-size: 5.6rem;
    line-height: 6.4rem;
    color: ${COLORS.white};
    margin-bottom: 1.6rem;

    ${respondDown(Breakpoints.md)`
        font-size: 4rem;
        line-height: 5rem;
    `}
`;

const Description = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.white};
`;

const Purpose = (): JSX.Element => (
    <Container>
        <Content>
            <TextContainer>
                <Title>Freeze your AQUA into ICE!</Title>
                <Description>
                    ICE brings entirely new benefits to the Aquarius ecosystem, giving those who
                    freeze AQUA increased voting power for liquidity & governance voting, boosted
                    yields when providing liquidity for markets receiving SDEX & AMM rewards, and
                    expanded freedom within the Aquarius ecosystem.
                </Description>
            </TextContainer>
            <Image />
        </Content>
    </Container>
);

export default Purpose;
