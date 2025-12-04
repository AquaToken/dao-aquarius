import * as React from 'react';

import { AppRoutes } from 'constants/routes';

import { getAquaAssetData, getAssetString } from 'helpers/assets';
import { createLumen } from 'helpers/token';

import { useScrollAnimation } from 'hooks/useScrollAnimation';

import PoolsBlockIcon from 'assets/main-page/pools-block.svg';
import SwapBlockIcon from 'assets/main-page/swap-block.svg';

import { BlankRouterLink } from 'basics/links';

import {
    Wrapper,
    InnerWrapper,
    Title,
    TitleBold,
    SorobanStarsStyled,
    SorobanBlocks,
    Block,
    BlockWithIcon,
    BlockDesc,
    SorobanButton,
    ArrowAlt16Styled,
} from './AquaSoroban.styled';

const AquaSoroban: React.FC = () => {
    const { ref, visible } = useScrollAnimation(0.2, true);

    return (
        <Wrapper ref={ref as React.RefObject<HTMLDivElement>} $visible={visible} id="aqua-soroban">
            <InnerWrapper $visible={visible}>
                <SorobanStarsStyled $visible={visible} />
                <Title>
                    Aquarius AMMs <TitleBold>run on Soroban smart contracts</TitleBold> — powering a
                    new generation of DeFi on Stellar.
                </Title>
            </InnerWrapper>

            <SorobanBlocks>
                <Block $visible={visible} $delay={0.1}>
                    <BlockWithIcon>
                        <SwapBlockIcon />
                        <BlockDesc>
                            <b>Swap instantly</b> with deep on-chain liquidity from Aquarius AMMs.
                        </BlockDesc>
                    </BlockWithIcon>
                    <BlankRouterLink
                        to={AppRoutes.section.swap.to.index({
                            source: getAssetString(createLumen()),
                            destination: getAquaAssetData().aquaAssetString,
                        })}
                    >
                        <SorobanButton withGradient secondary isBig isRounded>
                            Swap now <ArrowAlt16Styled />
                        </SorobanButton>
                    </BlankRouterLink>
                </Block>

                <Block $visible={visible} $delay={0.25}>
                    <BlockWithIcon>
                        <PoolsBlockIcon />
                        <BlockDesc>
                            <b>Provide liquidity</b> and get rewarded while powering Stellar
                            markets.
                        </BlockDesc>
                    </BlockWithIcon>
                    <BlankRouterLink to={AppRoutes.section.amm.link.index}>
                        <SorobanButton withGradient secondary isBig isRounded>
                            View Pools <ArrowAlt16Styled />
                        </SorobanButton>
                    </BlankRouterLink>
                </Block>
            </SorobanBlocks>
        </Wrapper>
    );
};

export default AquaSoroban;
