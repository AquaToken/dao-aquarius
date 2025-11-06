import * as React from 'react';

import { useScrollAnimation } from 'hooks/useScrollAnimation';

import BoostRewardsIcon from 'assets/main-page/boost-rewards.svg';
import EarnByMarketIcon from 'assets/main-page/earn-by-market.svg';
import EarnMoreIcon from 'assets/main-page/earn-more.svg';

import { DotsLoader } from 'basics/loaders';

import {
    Wrapper,
    WhyBlocks,
    Block,
    WhyTitle,
    HideOnSm,
    InfoBlock,
    InfoWrapper,
    DescBlock,
    DescTitle,
    Description,
    ShowOnSm,
    WhyStats,
    StatsTitle,
    DescriptionStats,
} from './WhyProvideLiq.styled';

interface Props {
    monthlyDistributed: string;
    isLoading?: boolean;
}

const WhyProvideLiq: React.FC<Props> = ({ monthlyDistributed, isLoading }) => {
    const { ref, visible } = useScrollAnimation(0.25, true);

    const whyStatsContent = (
        <WhyStats $visible={visible}>
            <StatsTitle>{isLoading ? <DotsLoader /> : monthlyDistributed}</StatsTitle>
            <DescriptionStats>
                Monthly AQUA rewards shared among liquidity providers.
            </DescriptionStats>
        </WhyStats>
    );

    return (
        <Wrapper
            ref={ref as React.RefObject<HTMLDivElement>}
            $visible={visible}
            id="why-provide-liquidity"
        >
            <WhyBlocks>
                <Block>
                    <WhyTitle $visible={visible}>Why Provide Liquidity?</WhyTitle>
                    <HideOnSm>{whyStatsContent}</HideOnSm>
                </Block>

                <InfoBlock $visible={visible}>
                    <InfoWrapper $visible={visible} $delay={0.1}>
                        <EarnMoreIcon />
                        <DescBlock>
                            <DescTitle>Earn more than swap fees</DescTitle>
                            <Description>
                                LPs receive additional rewards in AQUA — distributed in real time
                                based on pool activity and community votes.
                            </Description>
                        </DescBlock>
                    </InfoWrapper>

                    <InfoWrapper $visible={visible} $delay={0.25}>
                        <BoostRewardsIcon />
                        <DescBlock>
                            <DescTitle>Boost your rewards with ICE</DescTitle>
                            <Description>
                                Lock AQUA to mint ICE and increase your LP earnings by up to 250%.
                            </Description>
                        </DescBlock>
                    </InfoWrapper>

                    <InfoWrapper $visible={visible} $delay={0.4}>
                        <EarnByMarketIcon />
                        <DescBlock>
                            <DescTitle>Earn by market making on SDEX</DescTitle>
                            <Description>
                                Place limit orders on Stellar DEX and earn AQUA incentives —
                                liquidity provision isn’t limited to AMMs.
                            </Description>
                        </DescBlock>
                    </InfoWrapper>
                </InfoBlock>

                <ShowOnSm>{whyStatsContent}</ShowOnSm>
            </WhyBlocks>
        </Wrapper>
    );
};

export default WhyProvideLiq;
