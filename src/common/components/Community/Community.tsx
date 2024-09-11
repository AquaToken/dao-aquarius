import * as React from 'react';
import styled from 'styled-components';
import { respondDown } from '../../mixins';
import { Breakpoints, COLORS } from '../../styles';
import Telegram from '../../assets/img/telegram-styled.svg';
import Twitter from '../../assets/img/twitter-styled.svg';
import Github from '../../assets/img/github-styled.svg';
import Discord from '../../assets/img/discord-styled.svg';
import Reddit from '../../assets/img/reddit-styled.svg';
import Medium from '../../assets/img/medium-styled.svg';
import Email from '../../assets/img/email-styled.svg';

const Container = styled.section`
    padding-top: 16rem;
    padding-bottom: 4rem;
    display: flex;
    justify-content: center;
    flex: auto;
    position: relative;
    min-height: 0;

    ${respondDown(Breakpoints.lg)`
        padding-top: 6rem;
    `}
`;

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 142rem;
    padding: 0 10rem;

    ${respondDown(Breakpoints.md)`
        padding: 0 1.6rem;
        max-width: 55rem;
    `}

    a {
        text-decoration: none;
    }
`;

const Title = styled.div`
    font-size: 3.5rem;
    line-height: 4.1rem;
    color: ${COLORS.titleText};
    margin-bottom: 2.9rem;
`;

const Description = styled.div`
    font-size: 1.6rem;
    line-height: 3rem;
    color: ${COLORS.descriptionText};
    opacity: 0.7;
    margin-bottom: 5rem;

    ${respondDown(Breakpoints.md)`
        font-size: 1.4rem;
        line-height: 180%;
    `}
`;

const Links = styled.div`
    display: grid;
    grid-template-columns:
        calc(25% - (3.2rem * 0.75))
        calc(25% - (3.2rem * 0.75))
        calc(25% - (3.2rem * 0.75))
        calc(25% - (3.2rem * 0.75));
    grid-column-gap: 3.2rem;
    grid-row-gap: 3.2rem;
    justify-content: center;

    ${respondDown(Breakpoints.lg)`
        display: flex;
        width: 100%;
        flex-direction: column;
        flex-wrap: nowrap;
        margin-top: unset;
        grid-row-gap: 0;
    `}
`;

const Link = styled.a`
    flex-basis: 20%;

    ${respondDown(Breakpoints.lg)`
       margin-top: 1rem;
       flex-basis: 100%;
    `}
`;

const Item = styled.div`
    background: ${COLORS.lightGray};
    border-radius: 0.5rem;
    width: 100%;

    &:hover {
        background: ${COLORS.white};
        box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
        cursor: pointer;
    }

    ${respondDown(Breakpoints.lg)`
        width: unset;
        margin: 0;
    `}
`;

const ItemContent = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 5rem;

    svg {
        margin-bottom: 1.6rem;
        height: 9.1rem;
        width: 9.1rem;
    }

    ${respondDown(Breakpoints.lg)`
        flex-direction: row-reverse;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        padding: 2.5rem 3rem;
        
        svg {
            margin-bottom: 0;
            height: 4.8rem;
            width: 4.8rem;
        }
    `}
`;

const ItemTitle = styled.span`
    font-size: 2rem;
    line-height: 2.3rem;
    text-align: center;
    color: ${COLORS.titleText};
    white-space: nowrap;

    ${respondDown(Breakpoints.md)`
        font-size: 1.4rem;
        line-height: 1.6rem;
    `}
`;

const Community = () => {
    return (
        <Container>
            <Wrapper>
                <Title>Join AQUA community</Title>
                <Description>
                    Learn more about Aquarius, follow the project updates, chat with the team and
                    other community members.
                </Description>
                <Links>
                    <Link href="https://t.me/aquarius_official_community" target="_blank">
                        <Item>
                            <ItemContent>
                                <Telegram />
                                <ItemTitle>Telegram chat</ItemTitle>
                            </ItemContent>
                        </Item>
                    </Link>
                    <Link href="https://t.me/aqua_token" target="_blank">
                        <Item>
                            <ItemContent>
                                <Telegram />
                                <ItemTitle>Telegram news</ItemTitle>
                            </ItemContent>
                        </Item>
                    </Link>
                    <Link href="https://x.com/aqua_token" target="_blank">
                        <Item>
                            <ItemContent>
                                <Twitter />
                                <ItemTitle>@aqua_token</ItemTitle>
                            </ItemContent>
                        </Item>
                    </Link>
                    <Link href="https://github.com/AquaToken" target="_blank">
                        <Item>
                            <ItemContent>
                                <Github />
                                <ItemTitle>GitHub</ItemTitle>
                            </ItemContent>
                        </Item>
                    </Link>
                    <Link href="https://discord.gg/sgzFscHp4C" target="_blank">
                        <Item>
                            <ItemContent>
                                <Discord />
                                <ItemTitle>Discord</ItemTitle>
                            </ItemContent>
                        </Item>
                    </Link>
                    <Link href="https://www.reddit.com/r/AquariusAqua/" target="_blank">
                        <Item>
                            <ItemContent>
                                <Reddit />
                                <ItemTitle>Reddit</ItemTitle>
                            </ItemContent>
                        </Item>
                    </Link>
                    <Link href="https://medium.com/aquarius-aqua" target="_blank">
                        <Item>
                            <ItemContent>
                                <Medium />
                                <ItemTitle>Medium</ItemTitle>
                            </ItemContent>
                        </Item>
                    </Link>
                    <Link href="mailto:hello@aqua.network" target="_blank">
                        <Item>
                            <ItemContent>
                                <Email />
                                <ItemTitle>hello@aqua.network</ItemTitle>
                            </ItemContent>
                        </Item>
                    </Link>
                </Links>
            </Wrapper>
        </Container>
    );
};

export default Community;
