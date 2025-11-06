import styled, { css } from 'styled-components';

import ArrowAlt16 from 'assets/icons/arrows/arrow-alt-16.svg';
import TokenSystemIcon from 'assets/main-page/token-system.svg';

import { BlankRouterLink } from 'basics/links';

import {
    containerScrollAnimation,
    fadeAppearAnimation,
    slideUpSoftAnimation,
} from 'styles/animations';
import { cardBoxShadow, flexAllCenter, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

export const Wrapper = styled.section<{ $visible: boolean }>`
    ${flexAllCenter};
    flex-direction: column;
    margin-top: 11rem;
    ${containerScrollAnimation};

    ${respondDown(Breakpoints.md)`margin-top: 6rem; font-size: 6rem;`};
    ${respondDown(Breakpoints.sm)`margin-top: 0`};
    ${respondDown(Breakpoints.xs)`margin-top: 1.6rem;`};
`;

export const Title = styled.div<{ $visible: boolean }>`
    font-weight: bold;
    font-size: 7rem;
    color: ${COLORS.textPrimary};
    line-height: 100%;
    opacity: 0;

    ${({ $visible }) =>
        $visible &&
        css`
            ${fadeAppearAnimation};
            animation-delay: 0.1s;
        `}

    ${respondDown(Breakpoints.md)`font-size: 5.6rem;`};
    ${respondDown(Breakpoints.sm)`font-size: 3.2rem;`};
    ${respondDown(Breakpoints.xs)`font-size: 2.4rem;`};
`;

export const BlocksWrapper = styled.div`
    display: flex;
    width: 100%;
    gap: 6rem;

    ${respondDown(Breakpoints.md)`gap: 4rem;`};
    ${respondDown(Breakpoints.sm)`flex-direction: column; gap: 0;`};
`;

export const IconBlock = styled.div<{ $visible: boolean }>`
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 50%;
    position: relative;
    opacity: 0;

    ${({ $visible }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: 0.1s;
        `}

    ${respondDown(Breakpoints.sm)`
    justify-content: center;
    align-items: center;
    width: 100%;
  `}
`;

export const TokensBlock = styled.div<{ $visible: boolean }>`
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    max-height: 58rem;
    flex: 1;
    width: 50%;
    gap: 2.4rem;
    opacity: 0;

    ${({ $visible }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: 0.25s;
        `}

    ${respondDown(Breakpoints.sm)`width: 100%; gap: 1.6rem;`};
`;

export const Description = styled.div`
    font-size: 1.6rem;
    font-weight: 500;
    line-height: 180%;
    color: ${COLORS.gray550};
    margin-top: 0.8rem;

    ${respondDown(Breakpoints.xs)`font-size: 1.4rem;`};
`;

export const StyledTokenSystemIcon = styled(TokenSystemIcon)`
    position: absolute;
    top: -100px;
    left: -100px;
    width: 77.8rem;
    height: 69.1rem;

    ${respondDown(Breakpoints.md)`
    width: 56.5rem;
    height: 50.2rem;
    top: 0;
    left: -60px;
    z-index: 1;
  `}

    ${respondDown(Breakpoints.sm)`
    position: initial;
    width: 47.2rem;
    height: 42rem;
  `}

  ${respondDown(Breakpoints.xs)`
    position: initial;
    width: auto;
    height: 26.9rem;
  `}
`;

export const LinkButton = styled(BlankRouterLink)`
    background-color: ${COLORS.gray50};
    border-radius: 48px;
    padding: 3.2rem 4rem;
    width: 100%;
    z-index: 2;
    transition: all 0.2s ease;

    &:hover {
        background: ${COLORS.white};
        ${cardBoxShadow};
        transform: translateY(-2px);
    }

    ${respondDown(Breakpoints.md)`
        padding: 2.4rem 3.2rem;
    `}

    ${respondDown(Breakpoints.sm)`
        border-radius: 32px;
        padding: 1.6rem 2.4rem;
    `}
`;

export const LinkContent = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    gap: 2.4rem;

    ${respondDown(Breakpoints.xs)`
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  `}
`;

export const LogoWrapper = styled.div`
    display: flex;
    justify-content: start;
    align-items: center;

    svg {
        width: 5rem;
        height: 5rem;
    }

    ${respondDown(Breakpoints.xs)`width: 100%; gap: 0.8rem;`};
`;

export const DescWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

export const LinkTitle = styled.div`
    font-weight: bold;
    font-size: 2.4rem;
    line-height: 3.6rem;
    color: ${COLORS.textPrimary};

    ${respondDown(Breakpoints.xs)`display: none;`};
`;

export const LinkTitleXs = styled(LinkTitle)`
    display: none;
    ${respondDown(Breakpoints.xs)`display: block;`};
`;

export const LinkDesc = styled.div`
    font-weight: 500;
    font-size: 1.6rem;
    line-height: 180%;
`;

export const ArrowAlt16Styled = styled(ArrowAlt16)`
    position: absolute;
    right: 0;
    color: ${COLORS.purple500};
    ${respondDown(Breakpoints.xs)`top: 1.7rem;`};
`;
