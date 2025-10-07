import * as React from 'react';
import styled, { css } from 'styled-components';

import { useScrollAnimation } from 'hooks/useScrollAnimation';

import {
    containerScrollAnimation,
    fadeAppearAnimation,
    slideUpSoftAnimation,
} from 'web/animations';
import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Freighter from 'assets/wallets/freighter/freighter-dark.svg';
import HotWallet from 'assets/wallets/hot-wallet.svg';
import LobstrIcon from 'assets/wallets/lobstr/lobstr-name-logo.svg';
import StellarTermIcon from 'assets/wallets/stellarterm-logo.svg';
import StellarXIcon from 'assets/wallets/stellarx-logo.svg';

/* -------------------------------------------------------------------------- */
/*                              Layout + Animations                           */
/* -------------------------------------------------------------------------- */

const Wrapper = styled.section<{ $visible: boolean }>`
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
    position: relative;
    margin-top: 8rem;
    gap: 2.4rem;

    ${containerScrollAnimation}

    ${respondDown(Breakpoints.md)`
    margin-top: 3.2rem;
    flex-direction: column;
  `}
`;

const Title = styled.span<{ $visible: boolean }>`
    font-size: 1.6rem;
    color: ${COLORS.gray200};
    display: none;

    ${respondDown(Breakpoints.md)`
    display: block;
    ${({ $visible }) =>
        $visible &&
        css`
            ${fadeAppearAnimation};
            animation-delay: 0.1s;
        `}
  `}
`;

const FlexTitle = styled(Title)`
    display: flex;

    ${respondDown(Breakpoints.md)`
    display: none;
  `}
`;

const ImageBlock = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6.4rem;
    align-items: center;
    justify-content: center;
    padding: 16px 0;
    width: 100%;

    ${respondDown(Breakpoints.md)`
    gap: 3.2rem;
  `}
`;

/* --- Icon wrappers with staggered slide-up --- */
const IconWrapper = styled.a<{ $visible: boolean; $delay: number }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    opacity: 0;

    ${({ $visible, $delay }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: ${$delay}s;
        `}
`;

const FreighterIcon = styled(Freighter)`
    height: 2.4rem;
`;

const HotWalletIcon = styled(HotWallet)`
    height: 2.4rem;
`;

/* -------------------------------------------------------------------------- */
/*                                   Component                                */
/* -------------------------------------------------------------------------- */

const SupportedWallets: React.FC = () => {
    const { ref, visible } = useScrollAnimation(0.2, true);

    return (
        <Wrapper
            id="supported-wallets"
            ref={ref as React.RefObject<HTMLElement>}
            $visible={visible}
        >
            <Title $visible={visible}>Supported by:</Title>

            <ImageBlock>
                <FlexTitle $visible={visible}>Supported by:</FlexTitle>

                <IconWrapper
                    href="https://lobstr.co/"
                    target="_blank"
                    rel="noreferrer"
                    $visible={visible}
                    $delay={0.05}
                >
                    <LobstrIcon />
                </IconWrapper>

                <IconWrapper
                    href="https://www.stellarx.com/"
                    target="_blank"
                    rel="noreferrer"
                    $visible={visible}
                    $delay={0.15}
                >
                    <StellarXIcon />
                </IconWrapper>

                <IconWrapper
                    href="https://www.freighter.app/"
                    target="_blank"
                    rel="noreferrer"
                    $visible={visible}
                    $delay={0.25}
                >
                    <FreighterIcon />
                </IconWrapper>

                <IconWrapper
                    href="https://stellarterm.com/"
                    target="_blank"
                    rel="noreferrer"
                    $visible={visible}
                    $delay={0.35}
                >
                    <StellarTermIcon />
                </IconWrapper>

                <IconWrapper
                    href="https://hot-labs.org/"
                    target="_blank"
                    rel="noreferrer"
                    $visible={visible}
                    $delay={0.45}
                >
                    <HotWalletIcon />
                </IconWrapper>
            </ImageBlock>
        </Wrapper>
    );
};

export default SupportedWallets;
