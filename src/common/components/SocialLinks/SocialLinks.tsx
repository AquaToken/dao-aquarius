import * as React from 'react';
import styled, { css } from 'styled-components';
import Reddit from '../../assets/img/reddit.svg';
import Discord from '../../assets/img/discord.svg';
import Medium from '../../assets/img/medium.svg';
import Github from '../../assets/img/github.svg';
import Telegram from '../../assets/img/telegram.svg';
import Twitter from '../../assets/img/twitter.svg';
import Email from '../../assets/img/email.svg';
import { Breakpoints, COLORS } from '../../styles';
import { respondDown } from '../../mixins';

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

const Container = styled.div<{ isHorizontal?: boolean }>`
    ${({ isHorizontal }) => (isHorizontal ? HorizontalStyles : VerticalStyles)};

    a:hover svg path:not(.white) {
        fill: ${COLORS.purple};
    }
`;

const StayInTouch = styled.div<{ isHorizontal?: boolean }>`
    display: ${({ isHorizontal }) => (isHorizontal ? 'none' : 'flex')};
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

const SocialLinks = ({ isHorizontal }: { isHorizontal?: boolean }) => {
    return (
        <Container isHorizontal={isHorizontal}>
            <a href="src/common/components/SocialLinks/SocialLinks" target="_blank">
                <Reddit />
            </a>
            <a href="https://discord.gg/sgzFscHp4C" target="_blank">
                <Discord />
            </a>
            <a href="https://medium.com/aquarius-aqua" target="_blank">
                <Medium />
            </a>
            <a href="https://github.com/AquaToken" target="_blank">
                <Github />
            </a>
            <a href="https://t.me/aquarius_HOME" target="_blank">
                <Telegram />
            </a>
            <a href="https://twitter.com/aqua_token" target="_blank">
                <Twitter />
            </a>
            <a href="mailto:hello@aqua.network">
                <Email />
            </a>
            <StayInTouch isHorizontal={isHorizontal}>
                Stay in touch <Line />
            </StayInTouch>
        </Container>
    );
};

export default SocialLinks;
