import * as React from 'react';
import styled from 'styled-components';

import { cardBoxShadow, flexColumnCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Discord from 'assets/discord.svg';
import Telegram from 'assets/telegram-new.svg';
import X from 'assets/twitter.svg';

import { Button } from 'basics/buttons';

const Container = styled.div`
    border-radius: 4.4rem;
    ${cardBoxShadow};
    ${flexColumnCenter};
    padding: 4.6rem 10rem;

    ${respondDown(Breakpoints.md)`
        padding: 3.6rem;
    `}
`;

const Title = styled.h2`
    margin: 2.4rem 0;
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.textPrimary};
    text-align: center;
`;

const Description = styled.p`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 2.4rem;
    color: ${COLORS.textGray};
    text-align: center;
`;

const Buttons = styled.div`
    display: flex;
    gap: 1.2rem;

    a {
        text-decoration: none;
    }
`;

const ButtonStyled = styled(Button)`
    width: 6.6rem;
    border-radius: 2.4rem;
    height: 4.5rem;
`;

const Emoji = styled.span`
    font-size: 2rem;
`;

const QuestCompleted = () => (
    <Container>
        <Emoji>🎉</Emoji>
        <Title>Congratulations with completing the quest!</Title>
        <Description>
            Join our Discord server, Telegram chat and subscribe to our X account to make sure you
            don’t miss the information about rewards!
        </Description>
        <Buttons>
            <a href="https://discord.com/invite/sgzFscHp4C" target="_blank" rel="noreferrer">
                <ButtonStyled isRounded secondary withGradient>
                    <Discord />
                </ButtonStyled>
            </a>
            <a href="https://t.me/aquarius_official_community" target="_blank" rel="noreferrer">
                <ButtonStyled isRounded secondary withGradient>
                    <Telegram />
                </ButtonStyled>
            </a>

            <a href="https://x.com/AquariusDeFi" target="_blank" rel="noreferrer">
                <ButtonStyled isRounded secondary withGradient>
                    <X />
                </ButtonStyled>
            </a>
        </Buttons>
    </Container>
);

export default QuestCompleted;
