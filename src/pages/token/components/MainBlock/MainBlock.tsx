import * as React from 'react';
import { Link } from 'react-router-dom';
import styled, { css, keyframes } from 'styled-components';

import { MainRoutes } from 'constants/routes';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import { commonMaxWidth, respondDown } from 'web/mixins';
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';
import { Breakpoints, COLORS } from 'web/styles';

import Bg from 'assets/token-page/token-page-bg.svg';

import { Button } from 'basics/buttons';

import SocialLinks from 'components/SocialLinks';

import AnimatedBorderedText from 'pages/token/components/AnimatedBorderedText/AnimatedBorderedText';
import AquaPrice from 'pages/token/components/AquaPrice/AquaPrice';

/* -------------------------------------------------------------------------- */
/*                                Animations                                  */
/* -------------------------------------------------------------------------- */

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const Container = styled.section`
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;

    ${respondDown(Breakpoints.md)`
        height: unset;
    `}
`;

const Content = styled.div<{ $visible: boolean }>`
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 20rem 10rem 16rem;
    z-index: 20;
    ${commonMaxWidth};

    ${({ $visible }) =>
        $visible &&
        css`
            animation: ${fadeInUp} 1s ease-out both;
        `}

    ${respondDown(Breakpoints.md)`
        padding-top: 10rem;
    `}

    ${respondDown(Breakpoints.sm)`
        padding: 25rem 1.6rem 0;
    `}
`;

const Background = styled(Bg)<{ $visible: boolean }>`
    position: absolute;
    height: 90rem;
    right: -20rem;
    top: -11.2rem;
    opacity: 0;
    transition: opacity 1.4s ease-out;
    ${({ $visible }) =>
        $visible &&
        css`
            opacity: 1;
            animation: ${fadeIn} 2s ease-out both;
        `}

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

const Title = styled.div<{ $visible: boolean }>`
    display: flex;
    align-items: center;
    font-weight: 700;
    font-size: 10rem;
    opacity: 0;
    ${({ $visible }) =>
        $visible &&
        css`
            animation: ${fadeInUp} 0.8s ease-out both;
        `}

    ${respondDown(Breakpoints.lg)`
        font-size: 7rem;
    `}

    ${respondDown(Breakpoints.md)`
        font-size: 5rem;
        height: 5rem;
    `}
`;

const Description = styled.p<{ $visible: boolean }>`
    font-size: 3.6rem;
    line-height: 4.2rem;
    margin: 2.4rem 0;
    opacity: 0;
    ${({ $visible }) =>
        $visible &&
        css`
            animation: ${fadeInUp} 1s ease-out both;
        `}

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

const SecondaryDescription = styled.p<{ $visible: boolean }>`
    margin: 0;
    font-size: 1.6rem;
    line-height: 180%;
    color: ${COLORS.textGray};
    opacity: 0;
    ${({ $visible }) =>
        $visible &&
        css`
            animation: ${fadeInUp} 1.2s ease-out both;
        `}

    ${respondDown(Breakpoints.sm)`
        font-size: 1.4rem;
    `}
`;

const ButtonAndPriceBlock = styled.div`
    display: flex;
    width: 100%;
    padding-top: 2.4rem;
    position: relative;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        gap: 3.6rem;
    `}

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
    width: 25rem;
    height: 7rem;
    margin-right: 1.6rem;

    ${respondDown(Breakpoints.md)`
        width: 34rem;
    `}

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

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

const MainBlock: React.FC = () => {
    const { isLogged } = useAuthStore();
    const [visible, setVisible] = React.useState(false);
    const [showPrice, setShowPrice] = React.useState(false);

    React.useEffect(() => {
        // Тrigger animation on mount
        const start = setTimeout(() => setVisible(true), 50);
        // Show AquaPrice after animation
        const priceTimer = setTimeout(() => setShowPrice(true), 1100);
        return () => {
            clearTimeout(start);
            clearTimeout(priceTimer);
        };
    }, []);

    const buyAqua = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!isLogged) {
            e.preventDefault();
            e.stopPropagation();
            ModalService.openModal(ChooseLoginMethodModal, {});
        }
    };

    return (
        <Container>
            <SocialLinks />
            <Content $visible={visible}>
                <Background $visible={visible} />
                <Title $visible={visible}>
                    AQUA
                    <AnimatedBorderedText text="Token" />
                </Title>
                <Description $visible={visible}>Powers the #1 Stellar DeFi protocol</Description>
                <SecondaryDescription $visible={visible}>
                    Earn AQUA rewards by providing liquidity and voting in the Aquarius ecosystem.
                </SecondaryDescription>
                <ButtonAndPriceBlock>
                    <Link to={MainRoutes.swap}>
                        <ButtonStyled isRounded withGradient isBig>
                            swap aqua
                        </ButtonStyled>
                    </Link>

                    <Link to={MainRoutes.buyAqua} onClick={buyAqua}>
                        <ButtonStyled isRounded withGradient isBig secondary>
                            Buy with a card
                        </ButtonStyled>
                    </Link>

                    {showPrice && <AquaPriceStyled />}
                </ButtonAndPriceBlock>
            </Content>
        </Container>
    );
};

export default MainBlock;
