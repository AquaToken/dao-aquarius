import styled, { css } from 'styled-components';

import Freighter from 'assets/wallets/freighter/freighter-dark.svg';
import HotWallet from 'assets/wallets/hot-wallet.svg';

import {
    containerScrollAnimation,
    fadeAppearAnimation,
    slideUpSoftAnimation,
} from 'styles/animations';
import { respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

/* --------------------------- Wrapper + Layout --------------------------- */

export const Wrapper = styled.section<{ $visible: boolean }>`
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
    position: relative;
    margin-top: 8rem;
    gap: 2.4rem;

    ${containerScrollAnimation};

    ${respondDown(Breakpoints.md)`
    margin-top: 3.2rem;
    flex-direction: column;
  `}
`;

export const Title = styled.span<{ $visible: boolean }>`
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

export const FlexTitle = styled(Title)`
    display: flex;

    ${respondDown(Breakpoints.md)`
    display: none;
  `}
`;

export const ImageBlock = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6.4rem;
    align-items: center;
    justify-content: center;
    padding: 1.6rem 0;
    width: 100%;

    ${respondDown(Breakpoints.md)`
    gap: 3.2rem;
  `}
`;

/* --------------------------- Animated Icons --------------------------- */

export const IconWrapper = styled.a<{ $visible: boolean; $delay: number }>`
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

export const FreighterIcon = styled(Freighter)`
    height: 2.4rem;
`;

export const HotWalletIcon = styled(HotWallet)`
    height: 2.4rem;
`;
