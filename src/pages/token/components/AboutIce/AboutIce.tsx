import * as React from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { LockerRoutes, MainRoutes } from 'constants/routes';

import { useScrollAnimation } from 'hooks/useScrollAnimation';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import IconIce from 'assets/icons/small-icons/icon-ice-symbol-10.svg?url';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import BG from 'assets/token-page/ice-pattern.svg?url';
import IceLogoIcon from 'assets/tokens/ice-logo.svg';

import { Button } from 'basics/buttons';
import { ExternalLink } from 'basics/links';

import { containerScrollAnimation, slideUpSoftAnimation } from 'styles/animations';
import { cardBoxShadow, commonMaxWidth, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const Container = styled.section<{ $visible: boolean }>`
    padding: 0 10rem;
    ${commonMaxWidth};
    margin-top: 8rem;
    width: 100%;
    ${containerScrollAnimation};

    ${respondDown(Breakpoints.sm)`
        padding: 0;
        margin-top: 4.8rem;
    `}
`;

const Content = styled.div<{ $visible: boolean }>`
    display: flex;
    gap: 3.2rem;
    padding-bottom: 10rem;
    opacity: 0;
    ${({ $visible }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
        `}

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

const BlueBlock = styled.div<{ $visible: boolean }>`
    flex: 1;
    background-repeat: repeat;
    background-size: auto;
    background-color: ${COLORS.blue500};
    background-image: url(${BG});
    border-radius: 10rem;
    height: 34rem;
    opacity: 0;
    ${({ $visible }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: 0.15s;
        `}

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

const Title = styled.h1<{ $visible: boolean }>`
    font-weight: 700;
    font-size: 8rem;
    line-height: 8rem;
    color: ${COLORS.textPrimary};
    opacity: 0;
    ${({ $visible }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: 0.05s;
        `}

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

const SubTitle = styled.h2<{ $visible: boolean }>`
    margin: 3.2rem 0;
    font-weight: 400;
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.textPrimary};
    opacity: 0;
    ${({ $visible }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: 0.1s;
        `}

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const List = styled.ul<{ $visible: boolean }>`
    margin: 0 0 3.2rem;
    padding: 0;
    list-style: none;
    opacity: 0;
    ${({ $visible }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: 0.15s;
        `}
`;

const Item = styled.li`
    padding: 0;
    display: flex;
    align-items: center;
    gap: 1.6rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textTertiary};

    &:not(:last-child) {
        margin-bottom: 2.4rem;
    }

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
    background-color: ${COLORS.blue500};

    &:hover {
        background-color: ${COLORS.blue500};
        opacity: 0.9;
    }
`;

/* -------------------------------------------------------------------------- */
/*                                Component                                   */
/* -------------------------------------------------------------------------- */

const AboutIce = () => {
    const { ref, visible } = useScrollAnimation(0.25, true);

    return (
        <Container ref={ref as React.RefObject<HTMLDivElement>} $visible={visible}>
            <Content $visible={visible}>
                <TextBlock>
                    <Title $visible={visible}>
                        Freeze your AQUA into ICE <span>and unlock extra benefits</span>
                    </Title>
                    <SubTitle $visible={visible}>and unlock extra benefits</SubTitle>

                    <List $visible={visible}>
                        <Item>Vote for markets so they generate more rewards</Item>
                        <Item>Earn more from liquidity with ICE boosts</Item>
                        <Item>Delegate ICE and earn passive rewards</Item>
                    </List>

                    <ExternalLink to={LockerRoutes.about}>Learn more about ICE</ExternalLink>
                </TextBlock>

                <BlueBlock $visible={visible}>
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
};

export default AboutIce;
