import * as React from 'react';
import styled from 'styled-components';

import { MAIL_AQUA_HELLO } from 'constants/emails';

import Discord from 'assets/discord-styled.svg';
import Email from 'assets/email-styled.svg';
import Github from 'assets/github-styled.svg';
import Medium from 'assets/medium-styled.svg';
import Reddit from 'assets/reddit-styled.svg';
import Telegram from 'assets/telegram-styled.svg';
import Twitter from 'assets/twitter-styled.svg';

import { BlankExternalLink } from 'basics/links';

import { cardBoxShadow, respondDown } from '../mixins';
import { Breakpoints, COLORS } from '../styles';

const Wrapper = styled.section`
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-top: 11rem;

    ${respondDown(Breakpoints.md)`
        margin-top: 10rem;
    `}

    ${respondDown(Breakpoints.sm)`
        margin-top: 6rem;
    `}

    ${respondDown(Breakpoints.xs)`
        margin-top: 4rem;
    `}
`;

const Title = styled.div`
    font-size: 3.5rem;
    line-height: 100%;

    color: ${COLORS.textPrimary};
    margin-bottom: 2.4rem;

    ${respondDown(Breakpoints.sm)`
        margin-bottom: 1.6rem;
        font-size: 2.9rem;
    `}

    ${respondDown(Breakpoints.xs)`
        font-size: 2.6rem;
    `}
`;

const Description = styled.div`
    font-size: 1.6rem;
    line-height: 180%;
    color: ${COLORS.textSecondary};
    opacity: 0.7;
    margin-bottom: 5.6rem;
    font-weight: 500;

    ${respondDown(Breakpoints.md)`
        font-size: 1.4rem;
    `}

    ${respondDown(Breakpoints.sm)`
        margin-bottom: 4rem;
        font-weight: 400;
    `}
`;

const LinksWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 3.2rem;
    width: 100%;

    ${respondDown(Breakpoints.sm)`
        gap: 1rem 1.2rem;
    `}

    ${respondDown(Breakpoints.sm)`
        gap: 0.8rem 0;
    `}
`;

const Link = styled(BlankExternalLink)`
    flex: 1 1 calc(25% - 3.2rem); // 4 items per row minus gap
    max-width: calc(25% - 3.2rem);
    border-radius: 2.4rem;
    text-decoration: none;
    background: ${COLORS.gray50};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 6rem;

    svg {
        margin-bottom: 2.4rem;
        height: 9rem;
        width: 9rem;
        min-width: 4.8rem;
    }

    &:hover {
        background: ${COLORS.white};
        ${cardBoxShadow};
    }

    ${respondDown(Breakpoints.lg)`
        padding: 2.4rem;
    `}

    ${respondDown(Breakpoints.sm)`
        flex: 1 1 calc(50% - 1.2rem); // 2 items per row minus gap
        max-width: calc(50% - 1.2rem);
        flex-direction: row-reverse;
        justify-content: space-between;
        align-items: center;

        svg {
            margin-bottom: 0;
            height: 4.8rem;
            width: 4.8rem;
        }
    `}

    ${respondDown(Breakpoints.xs)`
        flex: 1 1 100%;
        max-width: 100%;
        padding: 1.6rem;

        svg {
            height: 3.6rem;
            width: 3.6rem;
        }
    `}
`;

const ItemTitle = styled.span`
    font-size: 2rem;
    color: ${COLORS.textPrimary};
    white-space: nowrap;

    ${respondDown(Breakpoints.md)`
        font-size: 1.4rem;
    `}
`;

const Community = (): React.ReactNode => (
    <Wrapper id="community">
        <Title>Join the conversation</Title>
        <Description>
            Learn more about Aquarius, follow the project updates, chat with the team and other
            community members.
        </Description>
        <LinksWrapper>
            <Link href="https://t.me/aquarius_official_community">
                <Telegram />
                <ItemTitle>Telegram chat</ItemTitle>
            </Link>
            <Link href="https://t.me/aqua_token">
                <Telegram />
                <ItemTitle>Telegram news</ItemTitle>
            </Link>
            <Link href="https://x.com/AquariusDeFi">
                <Twitter />
                <ItemTitle>X</ItemTitle>
            </Link>
            <Link href="https://github.com/AquaToken">
                <Github />
                <ItemTitle>GitHub</ItemTitle>
            </Link>
            <Link href="https://discord.gg/sgzFscHp4C">
                <Discord />
                <ItemTitle>Discord</ItemTitle>
            </Link>
            <Link href="https://www.reddit.com/r/AquariusAqua/">
                <Reddit />
                <ItemTitle>Reddit</ItemTitle>
            </Link>
            <Link href="https://medium.com/aquarius-aqua">
                <Medium />
                <ItemTitle>Medium</ItemTitle>
            </Link>
            <Link href={`mailto:${MAIL_AQUA_HELLO}`}>
                <Email />
                <ItemTitle>{MAIL_AQUA_HELLO}</ItemTitle>
            </Link>
        </LinksWrapper>
    </Wrapper>
);

export default Community;
