import * as React from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { AppRoutes } from 'constants/routes';

import { getAquaAssetData, getAssetString } from 'helpers/assets';
import { createLumen } from 'helpers/token';

import { useScrollAnimation } from 'hooks/useScrollAnimation';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';

import Bg from 'assets/token-page/token-page-bg.svg?url';

import { Button } from 'basics/buttons';

import SocialLinks from 'components/SocialLinks';

import { commonMaxWidth, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import AnimatedBorderedText from 'pages/token/components/AnimatedBorderedText/AnimatedBorderedText';
import AquaPrice from 'pages/token/components/AquaPrice/AquaPrice';

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

const Background = styled.img`
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

const fadeUp = css`
    opacity: 0;
    transform: translateY(30px);
    transition:
        opacity 0.6s ease,
        transform 0.6s ease;
    &.visible {
        opacity: 1;
        transform: translateY(0);
    }
`;

const Title = styled.div`
    display: flex;
    align-items: center;
    font-weight: 700;
    font-size: 10rem;
    ${fadeUp};

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
    ${fadeUp};

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
    color: ${COLORS.textGray};
    ${fadeUp};

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
/*                                   Component                                */
/* -------------------------------------------------------------------------- */

const MainBlock = () => {
    const { isLogged } = useAuthStore();
    const { ref, visible } = useScrollAnimation(0.3, true);

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
            <Content ref={ref as React.RefObject<HTMLDivElement>}>
                <Background src={Bg} />
                <Title className={visible ? 'visible' : ''}>
                    AQUA
                    <AnimatedBorderedText text="Token" />
                </Title>
                <Description className={visible ? 'visible' : ''}>
                    Powers the #1 Stellar DeFi protocol
                </Description>
                <SecondaryDescription className={visible ? 'visible' : ''}>
                    Earn AQUA rewards by providing liquidity and voting in the Aquarius ecosystem.
                </SecondaryDescription>
                <ButtonAndPriceBlock>
                    <Link
                        to={AppRoutes.section.swap.to.index({
                            source: getAssetString(createLumen()),
                            destination: getAquaAssetData().aquaAssetString,
                        })}
                    >
                        <ButtonStyled isRounded withGradient isBig>
                            swap aqua
                        </ButtonStyled>
                    </Link>
                    <Link to={AppRoutes.page.buyAqua} onClick={buyAqua}>
                        <ButtonStyled isRounded withGradient isBig secondary>
                            Buy with a card
                        </ButtonStyled>
                    </Link>
                    <AquaPriceStyled />
                </ButtonAndPriceBlock>
            </Content>
        </Container>
    );
};

export default MainBlock;
