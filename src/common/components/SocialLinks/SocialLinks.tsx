import * as React from 'react';
import styled, { css } from 'styled-components';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Discord from 'assets/discord.svg';
import Email from 'assets/email.svg';
import Github from 'assets/github.svg';
import Medium from 'assets/medium.svg';
import Reddit from 'assets/reddit.svg';
import Telegram from 'assets/telegram.svg';
import Twitter from 'assets/twitter.svg';

const VerticalStyles = css`
    position: absolute;
    justify-content: flex-end;
    bottom: 6.5%;
    height: 100%;
    left: 0;
    flex-direction: column;
    width: 2rem;
    padding: 0 4rem 9%;
    z-index: 20;
    display: flex;
    align-items: center;
    margin-top: 2rem;

    a {
        margin-bottom: 2.5rem;
    }

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const HorizontalStyles = css`
    position: relative;
    justify-content: center;
    margin-top: auto;
    margin-bottom: 2rem;
    display: none;

    a:not(:first-child) {
        margin-left: 2.5rem;
    }

    ${respondDown(Breakpoints.md)`
        display: flex;
    `}
`;

const Container = styled.div<{ $isHorizontal?: boolean }>`
    ${({ $isHorizontal }) => ($isHorizontal ? HorizontalStyles : VerticalStyles)};

    a:hover svg path:not(.white) {
        fill: ${COLORS.purple};
    }
`;

const StayInTouch = styled.div<{ $isHorizontal?: boolean }>`
    display: ${({ $isHorizontal }) => ($isHorizontal ? 'none' : 'flex')};
    align-items: center;
    font-size: 1.6rem;
    line-height: 1.9rem;
    color: ${COLORS.placeholder};
    white-space: nowrap;
    transform: rotate(-90deg);
    margin-top: 8.5rem;
`;

const Line = styled.div`
    width: 6.7rem;
    height: 1px;
    background-color: ${COLORS.placeholder};
    margin-left: 1.6rem;
`;

const SocialLinks = ({ isHorizontal }: { isHorizontal?: boolean }) => (
    <Container $isHorizontal={isHorizontal}>
        <a href="https://www.reddit.com/r/AquariusAqua/" target="_blank" rel="noreferrer">
            <Reddit />
        </a>
        <a href="https://discord.gg/sgzFscHp4C" target="_blank" rel="noreferrer">
            <Discord />
        </a>
        <a href="https://medium.com/aquarius-aqua" target="_blank" rel="noreferrer">
            <Medium />
        </a>
        <a href="https://github.com/AquaToken" target="_blank" rel="noreferrer">
            <Github />
        </a>
        <a href="https://t.me/aquarius_official_community" target="_blank" rel="noreferrer">
            <Telegram />
        </a>
        <a href="https://x.com/aqua_token" target="_blank" rel="noreferrer">
            <Twitter />
        </a>
        <a href="mailto:hello@aqua.network">
            <Email />
        </a>
        <StayInTouch $isHorizontal={isHorizontal}>
            Stay in touch <Line />
        </StayInTouch>
    </Container>
);

export default SocialLinks;
