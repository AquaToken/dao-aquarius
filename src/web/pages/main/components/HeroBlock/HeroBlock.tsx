import * as React from 'react';

import { MainRoutes } from 'constants/routes';

import { getIsDarkTheme } from 'helpers/theme';

import { BlankRouterLink } from 'basics/links';
import LiveIndicator from 'basics/LiveIndicator';
import { DotsLoader } from 'basics/loaders';

import {
    Hero,
    MainContent,
    FooterContent,
    Title,
    Description,
    ProvideLiqButton,
    LiveStats,
    LockedLiquidity,
    StatsWrapper,
    Stats,
    StatsDesc,
    Label,
    AquaLogoStyled,
    HandTopRightStyled,
    HandBottomLeftStyled,
    HandTopRightLightStyled,
    HandBottomLeftLightStyled,
    HeroTopLeftStyled,
    HeroBottomRightStyled,
    ArrowAlt16Styled,
} from './HeroBlock.styled';

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
