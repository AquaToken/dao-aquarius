import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { MainRoutes } from 'constants/routes';

import { cardBoxShadow, commonMaxWidth, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import IceLogoIcon from 'assets/ice-logo.svg';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import BG from 'assets/ice-pattern.svg?url';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import IconIce from 'assets/icon-ice-symbol.svg?url';

import { Button } from 'basics/buttons';

const Container = styled.section`
    padding: 0 10rem;
    ${commonMaxWidth};
    margin-top: 8rem;
    width: 100%;

    ${respondDown(Breakpoints.sm)`
        padding: 0;
        margin-top: 4.8rem;
    `}
`;

const Content = styled.div`
    display: flex;
    gap: 3.2rem;
    padding-bottom: 10rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
    `}

    ${respondDown(Breakpoints.sm)`
        padding-bottom: 0;
    `}
`;

const TextBlock = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;

    ${respondDown(Breakpoints.sm)`
        padding: 0 1.6rem;
    `}
`;

const BlueBlock = styled.div`
    flex: 1;
    background-repeat: repeat;
    background-size: auto;
    background-color: ${COLORS.blue};
    background-image: url(${BG});
    border-radius: 10rem;
    height: 34rem;

    ${respondDown(Breakpoints.sm)`
        border-radius: 0;
        padding: 2.2rem 1.6rem;
    `}
`;

const LockerBlock = styled.div`
    position: relative;
    width: 64%;
    margin: 0 auto;
    top: 10rem;
    border-radius: 4.4rem;
    background-color: ${COLORS.white};
    ${cardBoxShadow};
    padding: 6.3rem 4rem 3.6rem;
    display: flex;
    flex-direction: column;
    align-items: center;

    h3 {
        font-weight: 700;
        font-size: 2rem;
        line-height: 3rem;
        text-align: center;
        margin-bottom: 1.9rem;
    }

    a {
        text-decoration: none;
        width: 100%;
    }

    ${respondDown(Breakpoints.sm)`
        top: 0;
        width: 100%;
    `}
`;

const Title = styled.h1`
    font-weight: 700;
    font-size: 8rem;
    line-height: 8rem;
    color: ${COLORS.titleText};

    span {
        display: none;
    }

    ${respondDown(Breakpoints.lg)`
        font-size: 5rem;
    `}

    ${respondDown(Breakpoints.md)`
        font-size: 3rem;
        font-weight: 400;
        line-height: 3rem;
        margin-bottom: 3.2rem;
        
        span {
            display: inline;
        }
    `}
`;

const SubTitle = styled.h2`
    margin: 3.2rem 0;
    font-weight: 400;
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.titleText};

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const List = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
`;

const Item = styled.li`
    padding: 0;
    display: flex;
    align-items: center;
    gap: 1.6rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};

    &::before {
        content: '';
        display: block;
        width: 1.8rem;
        height: 1.8rem;
        background-image: url(${IconIce});
        background-size: cover;
        background-repeat: no-repeat;
    }
`;

const IceLogo = styled(IceLogoIcon)`
    height: 4rem;
    width: 4rem;
    margin-bottom: 3.6rem;
`;

const ButtonStyled = styled(Button)`
    background-color: ${COLORS.blue};

    &:hover {
        background-color: ${COLORS.blue};
        opacity: 0.9;
    }
`;

const AboutIce = () => (
    <Container>
        <Content>
            <TextBlock>
                <Title>
                    Freeze your AQUA into ICE <span>and unlock extra benefits</span>
                </Title>
                <SubTitle>and unlock extra benefits</SubTitle>

                <List>
                    <Item>Vote for markets so they generate more rewards</Item>
                    <Item>Earn more from liquidity with ICE boosts</Item>
                    <Item>Delegate ICE and earn passive rewards</Item>
                </List>
            </TextBlock>
            <BlueBlock>
                <LockerBlock>
                    <IceLogo />
                    <h3>Turn AQUA into ICE with just a few clicks</h3>
                    <Link to={MainRoutes.locker}>
                        <ButtonStyled isBig fullWidth isRounded>
                            Freeze AQUA
                        </ButtonStyled>
                    </Link>
                </LockerBlock>
            </BlueBlock>
        </Content>
    </Container>
);

export default AboutIce;
