import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { MainRoutes } from 'constants/routes';

import StellarLogo from 'assets/main-page/stellar-logo.svg';
import HeroBackground from 'assets/main-page/hero-background.png';
import HandTopRight from 'assets/main-page/hand-top-right.svg';
import HandLeftBottom from 'assets/main-page/hand-left-bottom.svg';
import HeroTopLeft from 'assets/main-page/hero-top-left.svg';
import HeroBottomRight from 'assets/main-page/hero-bottom-right.svg';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Button from 'basics/buttons/Button';
import { formatBalance } from 'helpers/format-number';
import { getIsDarkTheme } from 'helpers/theme';
import LiveIndicator from 'basics/LiveIndicator';

import { DotsLoader } from 'basics/loaders';
import { AllTimeStats } from 'api/amm.types';

const Hero = styled.section<{ $isDarkTheme: boolean }>`
    width: calc(100% - 4.8rem);
    position: relative;
    overflow: hidden;
    background: ${({ $isDarkTheme }) =>
        $isDarkTheme ? `url(${HeroBackground}) no-repeat center center / cover` : COLORS.lightGray};

    border-radius: 96px;
    padding: 3.6rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 85rem;

    /* hide icons to back of content */
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
        height: 44.8rem;
        border-radius: 0;
        padding: 5.6rem 0.8rem 3.6rem 0.8rem;
    `}
`;

const MainContent = styled.div`
    display: flex;
    flex: 3;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const FooterContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    flex: 1;
    align-items: center;
    justify-content: end;
`;

const Title = styled.h1<{ $isDarkTheme: boolean }>`
    font-weight: 700;
    font-size: 7rem;
    line-height: 100%;
    margin-top: 1.6rem;
    color: ${props => (props.$isDarkTheme ? COLORS.white : COLORS.titleText)};

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
    color: ${props => (props.$isDarkTheme ? COLORS.white : COLORS.descriptionText)};
    opacity: ${props => (props.$isDarkTheme ? 0.7 : 1)};

    ${respondDown(Breakpoints.sm)`
       font-size: 1.4rem;
       text-align: center;
    `}
`;

const ProvideLiqButton = styled(Button)`
    border-radius: 46px;
`;

const LiveStats = styled.div`
    font-weight: 700;
    font-size: 1.4rem;
    line-height: 180%;
    color: ${COLORS.green};
`;

const LockedLiquidity = styled.div`
    display: flex;
    gap: 0.4rem;
`;

const TotalLiq = styled.span<{ $isDarkTheme: boolean }>`
    font-weight: 700;
    font-size: 1.8rem;
    line-height: 180%;
    color: ${props => (props.$isDarkTheme ? COLORS.white : COLORS.titleText)};
`;

const TotalLiqDesc = styled(TotalLiq)<{ $isDarkTheme: boolean }>`
    font-weight: 400;
    opacity: ${props => (props.$isDarkTheme ? 0.7 : 1)};
    color: ${props => (props.$isDarkTheme ? COLORS.white : '#4D4F68')};
`;

const Label = styled.div<{ $isDarkTheme: boolean }>`
    display: flex;
    align-items: center;
    gap: 1.2rem;
    background-color: ${props => (props.$isDarkTheme ? '#270158' : COLORS.white)};
    color: ${props => (props.$isDarkTheme ? COLORS.white : COLORS.black)};
    padding: 1.6rem 2.4rem;
    border-radius: 46px;
    font-weight: 500;
    font-size: 1.8rem;
    line-height: 180%;
`;

const StellarLogoStyled = styled(StellarLogo)<{ $isDarkTheme: boolean }>`
    color: ${props => (props.$isDarkTheme ? COLORS.white : COLORS.black)};
`;

const HandTopRightStyled = styled(HandTopRight)`
    position: absolute;
    top: 0;
    right: 0;

    ${respondDown(Breakpoints.sm)`
        display: none;
    `}
`;

const HandBottomLeftStyled = styled(HandLeftBottom)`
    position: absolute;
    bottom: 0;
    left: 0;

    ${respondDown(Breakpoints.sm)`
        display: none;
    `}
`;

const HeroTopLeftStyled = styled(HeroTopLeft)`
    position: absolute;
    top: 0;
    left: 0;
`;

const HeroBottomRightStyled = styled(HeroBottomRight)`
    position: absolute;
    bottom: 0;
    right: 0;
`;

interface Props {
    isLoading: boolean;
    stats: AllTimeStats | null;
}

const HeroBlock = ({ isLoading, stats }: Props) => {
    const isDarkTheme = getIsDarkTheme();

    return (
        <Hero $isDarkTheme={isDarkTheme}>
            <HandTopRightStyled />
            <HandBottomLeftStyled />
            <HeroTopLeftStyled />
            <HeroBottomRightStyled />
            <MainContent>
                <Label $isDarkTheme={isDarkTheme}>
                    Built on <StellarLogoStyled $isDarkTheme={isDarkTheme} />
                </Label>
                <Title $isDarkTheme={isDarkTheme}>DeFi Liquidity Layer</Title>
                <Description $isDarkTheme={isDarkTheme}>
                    Add liquidity. Earn AQUA. Shape the future of decentralized finance.
                </Description>
                <Link to={MainRoutes.amm}>
                    <ProvideLiqButton withGradient isBig isRounded>
                        Provide liquidity
                    </ProvideLiqButton>
                </Link>
            </MainContent>
            <FooterContent>
                <LiveStats>
                    <LiveIndicator />
                    Live Stats
                </LiveStats>
                <LockedLiquidity>
                    <TotalLiq $isDarkTheme={isDarkTheme}>
                        {isLoading ? (
                            <DotsLoader />
                        ) : (
                            `$${formatBalance(stats?.tvl / 1e7, true, true)}`
                        )}
                    </TotalLiq>
                    <TotalLiqDesc $isDarkTheme={isDarkTheme}>Locked in Liquidity</TotalLiqDesc>
                </LockedLiquidity>
            </FooterContent>
        </Hero>
    );
};

export default HeroBlock;
