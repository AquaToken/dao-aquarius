import styled from 'styled-components';

import AquaLogo from 'assets/aqua/aqua-logo-text.svg';
import ArrowAlt16 from 'assets/icons/arrows/arrow-alt-16.svg';
import HandLeftBottomLight from 'assets/main-page/hand-left-bottom-light.svg';
import HandLeftBottom from 'assets/main-page/hand-left-bottom.svg';
import HandTopRightLight from 'assets/main-page/hand-top-right-light.svg';
import HandTopRight from 'assets/main-page/hand-top-right.svg';
import HeroBackground from 'assets/main-page/hero-background.png';
import HeroBottomRight from 'assets/main-page/hero-bottom-right.svg';
import HeroTopLeft from 'assets/main-page/hero-top-left.svg';

import Button from 'basics/buttons/Button';

import { fadeAppearAnimation, pulseAnimation } from 'styles/animations';
import { fullWidthSectionStyles, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS, HEADER_HEIGHT, PAGE_PADDINGS } from 'styles/style-constants';

/* ----------------------------- Layout -------------------------------- */

export const Hero = styled.section<{ $isDarkTheme: boolean }>`
    ${fullWidthSectionStyles};
    position: relative;
    overflow: hidden;
    background: ${({ $isDarkTheme }) =>
        $isDarkTheme ? `url(${HeroBackground}) no-repeat center center / cover` : COLORS.gray50};
    border-radius: 9.6rem;
    padding: 3.6rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: calc(100vh - ${HEADER_HEIGHT});
    ${fadeAppearAnimation};

    svg {
        z-index: 0;
    }

    div {
        z-index: 1;
    }

    ${respondDown(Breakpoints.md)`
    height: 56rem;
  `}

    ${respondDown(Breakpoints.xs)`
    width: 100%;
    height: auto;
    border-radius: 0;
    padding: 6rem ${PAGE_PADDINGS}rem;
    gap: 6rem;
  `}
`;

export const MainContent = styled.div`
    display: flex;
    flex: 3;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    ${fadeAppearAnimation};
    animation-delay: 0.1s;
`;

export const FooterContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    flex: 1;
    align-items: center;
    justify-content: end;
    ${fadeAppearAnimation};
    animation-delay: 0.4s;
`;

export const Title = styled.h1<{ $isDarkTheme: boolean }>`
    font-weight: 700;
    font-size: 7rem;
    line-height: 100%;
    margin-top: 1.6rem;
    color: ${({ $isDarkTheme }) => ($isDarkTheme ? COLORS.white : COLORS.textPrimary)};
    ${fadeAppearAnimation};
    animation-delay: 0.2s;

    ${respondDown(Breakpoints.md)`
    font-size: 5.6rem;
  `}

    ${respondDown(Breakpoints.sm)`
    font-size: 3.2rem;
  `}
`;

export const Description = styled.p<{ $isDarkTheme: boolean }>`
    font-weight: 500;
    font-size: 1.8rem;
    line-height: 180%;
    color: ${({ $isDarkTheme }) => ($isDarkTheme ? COLORS.white : COLORS.textSecondary)};
    opacity: ${({ $isDarkTheme }) => ($isDarkTheme ? 0.8 : 1)};
    margin-top: 1.2rem;
    ${fadeAppearAnimation};
    animation-delay: 0.35s;

    ${respondDown(Breakpoints.sm)`
    font-size: 1.4rem;
    text-align: center;
  `}
`;

export const ProvideLiqButton = styled(Button)`
    border-radius: 4.6rem;
    padding: 0 4rem;
    margin-top: 2.4rem;
    ${fadeAppearAnimation};
    animation-delay: 0.5s;

    ${respondDown(Breakpoints.sm)`
    padding: 0 3rem;
    height: 5rem;
  `}
`;

export const LiveStats = styled.div`
    font-weight: 700;
    font-size: 1.4rem;
    line-height: 180%;
    color: ${COLORS.green500};
    display: flex;
    align-items: center;
    gap: 0.8rem;
`;

export const LockedLiquidity = styled.div`
    display: flex;
    gap: 2.4rem;

    ${respondDown(Breakpoints.sm)`
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
  `}
`;

export const StatsWrapper = styled.div`
    display: flex;
    gap: 0.8rem;
`;

export const Stats = styled.span<{ $isDarkTheme: boolean }>`
    font-weight: 700;
    font-size: 1.8rem;
    line-height: 180%;
    color: ${({ $isDarkTheme }) => ($isDarkTheme ? COLORS.white : COLORS.textPrimary)};
`;

export const StatsDesc = styled(Stats)<{ $isDarkTheme: boolean }>`
    font-weight: 400;
    opacity: ${({ $isDarkTheme }) => ($isDarkTheme ? 0.7 : 1)};
    color: ${({ $isDarkTheme }) => ($isDarkTheme ? COLORS.white : COLORS.gray550)};
`;

export const Label = styled.div<{ $isDarkTheme: boolean }>`
    display: flex;
    align-items: center;
    gap: 1.2rem;
    background-color: ${({ $isDarkTheme }) => ($isDarkTheme ? COLORS.purple990 : COLORS.white)};
    color: ${({ $isDarkTheme }) => ($isDarkTheme ? COLORS.white : COLORS.black)};
    padding: 1.6rem 2.4rem;
    border-radius: 4.6rem;
    font-weight: 500;
    font-size: 1.8rem;
    line-height: 180%;
    ${fadeAppearAnimation};
    animation-delay: 0.1s;
`;

export const AquaLogoStyled = styled(AquaLogo)<{ $isDarkTheme: boolean }>`
    color: ${({ $isDarkTheme }) => ($isDarkTheme ? COLORS.white : COLORS.black)};
    height: 4rem;
    ${pulseAnimation};
`;

/* ----------------------------- Decorations -------------------------------- */

export const HandTopRightStyled = styled(HandTopRight)`
    position: absolute;
    top: 0;
    right: 0;
    ${fadeAppearAnimation};
    animation-delay: 0.1s;

    ${respondDown(Breakpoints.sm)`
    display: none;
  `}
`;

export const HandTopRightLightStyled = styled(HandTopRightLight)`
    position: absolute;
    top: 0;
    right: 0;
    ${fadeAppearAnimation};
    animation-delay: 0.1s;

    ${respondDown(Breakpoints.sm)`
    display: none;
  `}
`;

export const HandBottomLeftStyled = styled(HandLeftBottom)`
    position: absolute;
    bottom: 0;
    left: 0;
    ${fadeAppearAnimation};
    animation-delay: 0.15s;

    ${respondDown(Breakpoints.sm)`
    display: none;
  `}
`;

export const HandBottomLeftLightStyled = styled(HandLeftBottomLight)`
    position: absolute;
    bottom: 0;
    left: 0;
    ${fadeAppearAnimation};
    animation-delay: 0.15s;

    ${respondDown(Breakpoints.sm)`
    display: none;
  `}
`;

export const HeroTopLeftStyled = styled(HeroTopLeft)`
    position: absolute;
    top: 0;
    left: 0;
    ${fadeAppearAnimation};
    animation-delay: 0.2s;
`;

export const HeroBottomRightStyled = styled(HeroBottomRight)`
    position: absolute;
    bottom: 0;
    right: 0;
    ${fadeAppearAnimation};
    animation-delay: 0.25s;
`;

export const ArrowAlt16Styled = styled(ArrowAlt16)`
    margin-left: 0.8rem;
    color: ${COLORS.white};
`;
