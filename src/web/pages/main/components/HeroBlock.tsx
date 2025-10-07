import * as React from 'react';
import styled from 'styled-components';

import { MainRoutes } from 'constants/routes';

import { getIsDarkTheme } from 'helpers/theme';

import { fadeAppearAnimation, pulseAnimation } from 'web/animations';
import { fullWidthSectionStyles, respondDown } from 'web/mixins';
import { Breakpoints, COLORS, HEADER_HEIGHT, PAGE_PADDINGS } from 'web/styles';

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
import { BlankRouterLink } from 'basics/links';
import LiveIndicator from 'basics/LiveIndicator';
import { DotsLoader } from 'basics/loaders';

/* -------------------------------------------------------------------------- */
/*                                   Layout                                   */
/* -------------------------------------------------------------------------- */

const Hero = styled.section<{ $isDarkTheme: boolean }>`
    ${fullWidthSectionStyles};
    position: relative;
    overflow: hidden;
    background: ${({ $isDarkTheme }) =>
        $isDarkTheme ? `url(${HeroBackground}) no-repeat center center / cover` : COLORS.gray50};
    border-radius: 96px;
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

const MainContent = styled.div`
    display: flex;
    flex: 3;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    ${fadeAppearAnimation};
    animation-delay: 0.1s;
`;

const FooterContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    flex: 1;
    align-items: center;
    justify-content: end;
    ${fadeAppearAnimation};
    animation-delay: 0.4s;
`;

const Title = styled.h1<{ $isDarkTheme: boolean }>`
    font-weight: 700;
    font-size: 7rem;
    line-height: 100%;
    margin-top: 1.6rem;
    color: ${props => (props.$isDarkTheme ? COLORS.white : COLORS.textPrimary)};
    ${fadeAppearAnimation};
    animation-delay: 0.2s;

    ${respondDown(Breakpoints.md)`
        font-size: 5.6rem;
    `}

    ${respondDown(Breakpoints.sm)`
        font-size: 3.2rem;
    `}
`;

const Description = styled.p<{ $isDarkTheme: boolean }>`
    font-weight: 500;
    font-size: 1.8rem;
    line-height: 180%;
    color: ${props => (props.$isDarkTheme ? COLORS.white : COLORS.textSecondary)};
    opacity: ${props => (props.$isDarkTheme ? 0.8 : 1)};
    margin-top: 1.2rem;
    ${fadeAppearAnimation};
    animation-delay: 0.35s;

    ${respondDown(Breakpoints.sm)`
        font-size: 1.4rem;
        text-align: center;
    `}
`;

const ProvideLiqButton = styled(Button)`
    border-radius: 46px;
    padding: 0 4rem;
    margin-top: 2.4rem;
    ${fadeAppearAnimation};
    animation-delay: 0.5s;

    ${respondDown(Breakpoints.sm)`
        padding: 0 3rem;
        height: 5rem;
    `}
`;

const LiveStats = styled.div`
    font-weight: 700;
    font-size: 1.4rem;
    line-height: 180%;
    color: ${COLORS.green500};
    display: flex;
    align-items: center;
    gap: 0.8rem;
`;

const LockedLiquidity = styled.div`
    display: flex;
    gap: 2.4rem;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        align-items: center;
        gap: 0.8rem;
    `}
`;

const StatsWrapper = styled.div`
    display: flex;
    gap: 0.8rem;
`;

const Stats = styled.span<{ $isDarkTheme: boolean }>`
    font-weight: 700;
    font-size: 1.8rem;
    line-height: 180%;
    color: ${props => (props.$isDarkTheme ? COLORS.white : COLORS.textPrimary)};
`;

const StatsDesc = styled(Stats)<{ $isDarkTheme: boolean }>`
    font-weight: 400;
    opacity: ${props => (props.$isDarkTheme ? 0.7 : 1)};
    color: ${props => (props.$isDarkTheme ? COLORS.white : COLORS.gray550)};
`;

const Label = styled.div<{ $isDarkTheme: boolean }>`
    display: flex;
    align-items: center;
    gap: 1.2rem;
    background-color: ${props => (props.$isDarkTheme ? COLORS.purple990 : COLORS.white)};
    color: ${props => (props.$isDarkTheme ? COLORS.white : COLORS.black)};
    padding: 1.6rem 2.4rem;
    border-radius: 46px;
    font-weight: 500;
    font-size: 1.8rem;
    line-height: 180%;
    ${fadeAppearAnimation};
    animation-delay: 0.1s;
`;

const AquaLogoStyled = styled(AquaLogo)<{ $isDarkTheme: boolean }>`
    color: ${props => (props.$isDarkTheme ? COLORS.white : COLORS.black)};
    height: 4rem;
    ${pulseAnimation};
`;

/* ----------------------------- Decorations -------------------------------- */

const HandTopRightStyled = styled(HandTopRight)`
    position: absolute;
    top: 0;
    right: 0;
    ${fadeAppearAnimation};
    animation-delay: 0.1s;

    ${respondDown(Breakpoints.sm)`
        display: none;
    `}
`;

const HandTopRightLightStyled = styled(HandTopRightLight)`
    position: absolute;
    top: 0;
    right: 0;
    ${fadeAppearAnimation};
    animation-delay: 0.1s;

    ${respondDown(Breakpoints.sm)`
        display: none;
    `}
`;

const HandBottomLeftStyled = styled(HandLeftBottom)`
    position: absolute;
    bottom: 0;
    left: 0;
    ${fadeAppearAnimation};
    animation-delay: 0.15s;

    ${respondDown(Breakpoints.sm)`
        display: none;
    `}
`;

const HandBottomLeftLightStyled = styled(HandLeftBottomLight)`
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

const ArrowAlt16Styled = styled(ArrowAlt16)`
    margin-left: 0.8rem;
    color: ${COLORS.white};
`;

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

interface Props {
    isLoading: boolean;
    monthlyDistributed: string;
    volumeInUsd: string;
    tvlInUsd: string;
}

const HeroBlock: React.FC<Props> = ({ isLoading, monthlyDistributed, volumeInUsd, tvlInUsd }) => {
    const isDarkTheme = getIsDarkTheme();

    return (
        <Hero $isDarkTheme={isDarkTheme}>
            {isDarkTheme ? (
                <>
                    <HandTopRightStyled />
                    <HandBottomLeftStyled />
                </>
            ) : (
                <>
                    <HandTopRightLightStyled />
                    <HandBottomLeftLightStyled />
                </>
            )}

            <HeroTopLeftStyled />
            <HeroBottomRightStyled />

            <MainContent>
                <Label $isDarkTheme={isDarkTheme}>
                    <AquaLogoStyled $isDarkTheme={isDarkTheme} />
                </Label>

                <Title $isDarkTheme={isDarkTheme}>Stellar’s DeFi Hub</Title>
                <Description $isDarkTheme={isDarkTheme}>
                    Swap faster. Add liquidity. Earn AQUA.
                </Description>

                <BlankRouterLink to={MainRoutes.swap}>
                    <ProvideLiqButton withGradient isBig isRounded>
                        Swap now <ArrowAlt16Styled />
                    </ProvideLiqButton>
                </BlankRouterLink>
            </MainContent>

            <FooterContent>
                <LiveStats>
                    <LiveIndicator />
                    Live Stats
                </LiveStats>

                <LockedLiquidity>
                    <StatsWrapper>
                        <StatsDesc $isDarkTheme={isDarkTheme}>Total Swap Volume:</StatsDesc>
                        <Stats $isDarkTheme={isDarkTheme}>
                            {isLoading ? <DotsLoader /> : volumeInUsd}
                        </Stats>
                    </StatsWrapper>

                    <StatsWrapper>
                        <StatsDesc $isDarkTheme={isDarkTheme}>Total Liquidity:</StatsDesc>
                        <Stats $isDarkTheme={isDarkTheme}>
                            {isLoading ? <DotsLoader /> : tvlInUsd}
                        </Stats>
                    </StatsWrapper>

                    <StatsWrapper>
                        <StatsDesc $isDarkTheme={isDarkTheme}>Monthly Rewards:</StatsDesc>
                        <Stats $isDarkTheme={isDarkTheme}>
                            {isLoading ? <DotsLoader /> : monthlyDistributed}
                        </Stats>
                    </StatsWrapper>
                </LockedLiquidity>
            </FooterContent>
        </Hero>
    );
};

export default HeroBlock;
