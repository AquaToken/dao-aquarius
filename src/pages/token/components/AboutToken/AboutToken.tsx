import * as React from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { AppRoutes } from 'constants/routes';

import { useScrollAnimation } from 'hooks/useScrollAnimation';

import LP from 'assets/token-page/landing-about-amm-80.svg';
import Bribes from 'assets/token-page/landing-about-bribes.svg';

import { containerScrollAnimation, slideUpSoftAnimation } from 'styles/animations';
import { commonMaxWidth, respondDown } from 'styles/mixins';
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
        padding: 0 1.6rem;
        margin-top: 4.8rem;
    `}
`;

const Title = styled.h1<{ $visible: boolean }>`
    font-weight: 700;
    font-size: 5.6rem;
    line-height: 6.4rem;
    color: ${COLORS.textPrimary};
    opacity: 0;
    ${({ $visible }) => $visible && slideUpSoftAnimation};

    ${respondDown(Breakpoints.sm)`
        font-size: 2.9rem;
        line-height: 3rem;
        font-weight: 400;
    `}
`;

const Description = styled.p<{ $visible: boolean }>`
    margin: 1.6rem 0 0;
    color: ${COLORS.textTertiary};
    font-size: 1.6rem;
    line-height: 2.8rem;
    opacity: 0;
    ${({ $visible }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: 0.1s;
        `}
`;

const Links = styled.div<{ $visible: boolean }>`
    display: flex;
    gap: 3.8rem;
    margin-top: 4rem;
    flex-direction: column;
    opacity: 0;
    ${({ $visible }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: 0.2s;
        `}

    ${respondDown(Breakpoints.sm)`
        gap: 1.6rem;
        margin-top: 0.8rem;
    `}
`;

const LinksRow = styled.div`
    display: flex;
    gap: 3.8rem;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        gap: 1.6rem;
    `}
`;

const LinkStyled = styled(Link)<{ $visible: boolean; $delay: number }>`
    display: flex;
    gap: 2.4rem;
    padding: 4rem 3.6rem;
    align-items: center;
    background-color: ${COLORS.gray50};
    border-radius: 4.4rem;
    flex: 1;
    cursor: pointer;
    text-decoration: none;
    color: ${COLORS.textPrimary};
    opacity: 0;

    ${({ $visible, $delay }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: ${$delay}s;
        `}

    h3 {
        font-size: 2rem;
        line-height: 2.8rem;
    }

    svg {
        min-width: 8rem;
    }
`;

const LinkContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
`;

/* -------------------------------------------------------------------------- */
/*                                Component                                   */
/* -------------------------------------------------------------------------- */

const AboutToken = () => {
    const { ref, visible } = useScrollAnimation(0.3, true);

    return (
        <Container ref={ref as React.RefObject<HTMLDivElement>} $visible={visible}>
            <Title $visible={visible}>What is AQUA?</Title>
            <Description $visible={visible}>
                AQUA is the utility token of the Aquarius protocol — the largest DEX on the Stellar
                network. It’s used for:
            </Description>
            <Links $visible={visible}>
                <LinksRow>
                    <LinkStyled to={AppRoutes.page.rewards} $visible={visible} $delay={0.1}>
                        <LP />
                        <LinkContent>
                            <h3>LP rewards</h3>
                            <p>Earn AQUA for providing liquidity in AMM pools or SDEX markets.</p>
                        </LinkContent>
                    </LinkStyled>
                    <LinkStyled
                        to={AppRoutes.section.bribes.link.index}
                        $visible={visible}
                        $delay={0.25}
                    >
                        <Bribes />
                        <LinkContent>
                            <h3>Bribes</h3>
                            <p>Earn bonus incentives for voting on specific markets.</p>
                        </LinkContent>
                    </LinkStyled>
                </LinksRow>
            </Links>
        </Container>
    );
};

export default AboutToken;
