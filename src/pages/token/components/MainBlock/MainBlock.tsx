import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { MainRoutes } from 'constants/routes';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import { commonMaxWidth, respondDown } from 'web/mixins';
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';
import { Breakpoints, COLORS } from 'web/styles';

import Bg from 'assets/token-page-bg.svg';

import { Button } from 'basics/buttons';

import SocialLinks from 'components/SocialLinks';

import AnimatedBorderedText from 'pages/token/components/AnimatedBorderedText/AnimatedBorderedText';
import AquaPrice from 'pages/token/components/AquaPrice/AquaPrice';

const Container = styled.section`
    display: flex;
    flex-direction: column;
    position: relative;

    ${respondDown(Breakpoints.md)`
        height: unset;
    `}
`;

const Content = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 20rem 10rem 16rem;
    z-index: 20;
    ${commonMaxWidth};

    ${respondDown(Breakpoints.md)`
        padding-top: 10rem;
    `}

    ${respondDown(Breakpoints.sm)`
        padding: 25rem 1.6rem 0;
    `}
`;

const Background = styled(Bg)`
    position: absolute;
    height: 90rem;
    right: -20rem;
    top: -11.2rem;

    ${respondDown(Breakpoints.lg)`
        right: -25rem;
    `}

    ${respondDown(Breakpoints.md)`
        width: 60rem;
        right: -20rem;
        top: -10rem;
    `}

    ${respondDown(Breakpoints.sm)`
        left: 50%;
        transform: translate(-50%, 0);
        height: 45rem;
        right: unset;
        width: unset;
    `}
`;

const Title = styled.div`
    display: flex;
    align-items: center;
    font-weight: 700;
    font-size: 10rem;

    ${respondDown(Breakpoints.lg)`
        font-size: 7rem;
    `}

    ${respondDown(Breakpoints.md)`
        font-size: 5rem;
        height: 5rem;
    `}
`;

const Description = styled.p`
    font-size: 3.6rem;
    line-height: 4.2rem;
    margin: 2.4rem 0;

    ${respondDown(Breakpoints.lg)`
        font-size: 3rem;
        margin: 1.6rem 0 1.6rem;
    `}

    ${respondDown(Breakpoints.sm)`
        font-size: 1.8rem;
        line-height: 3.2rem;
        margin: 0.8rem 0;
    `}
`;

const SecondaryDescription = styled.p`
    margin: 0;
    font-size: 1.6rem;
    line-height: 180%;
    color: ${COLORS.grayText};

    ${respondDown(Breakpoints.sm)`
        font-size: 1.4rem;
    `}
`;

const ButtonAndPriceBlock = styled.div`
    display: flex;
    width: 100%;
    padding-top: 2.4rem;
    position: relative;

    ${respondDown(Breakpoints.sm)`
        a {
            width: 100%;
            height: 5.2rem;
        }
    `}

    a {
        text-decoration: none !important;
    }
`;

const ButtonStyled = styled(Button)`
    width: 33rem;
    height: 7rem;

    ${respondDown(Breakpoints.sm)`
        width: 100%;
        height: 5.2rem;
    `}
`;

const AquaPriceStyled = styled(AquaPrice)`
    ${respondDown(Breakpoints.sm)`
        display: none;
    `}
`;

const MainBlock = () => {
    const { isLogged } = useAuthStore();
    const buyAqua = e => {
        if (!isLogged) {
            e.preventDefault();
            e.stopPropagation();

            ModalService.openModal(ChooseLoginMethodModal, {});

            return;
        }
    };
    return (
        <Container>
            <SocialLinks />
            <Content>
                <Background />
                <Title>
                    AQUA
                    <AnimatedBorderedText />
                </Title>
                <Description>Powers the #1 Stellar defi protocol</Description>
                <SecondaryDescription>
                    Join Aquarius to start earning AQUA rewards for liquidity provision and voting
                </SecondaryDescription>
                <ButtonAndPriceBlock>
                    <Link to={MainRoutes.buyAqua} onClick={buyAqua}>
                        <ButtonStyled isRounded withGradient isBig>
                            buy aqua
                        </ButtonStyled>
                    </Link>

                    <AquaPriceStyled />
                </ButtonAndPriceBlock>
            </Content>
        </Container>
    );
};

export default MainBlock;
