import * as React from 'react';

import { useScrollAnimation } from 'hooks/useScrollAnimation';

import { DotsLoader } from 'basics/loaders';

import {
    Wrapper,
    DexTitle,
    DexBlocks,
    Block,
    StatsBlock,
    StatWrapper,
    StatsTitle,
    StatsDesc,
} from './DexStats.styled';

interface Props {
    isLoading: boolean;
    volumeInUsd: string;
    tvlInUsd: string;
}

const DexStats: React.FC<Props> = ({ isLoading, volumeInUsd, tvlInUsd }) => {
    const { ref, visible } = useScrollAnimation(0.25, true);

    return (
        <Wrapper ref={ref as React.RefObject<HTMLDivElement>} $visible={visible} id="dex-stats">
            <DexBlocks>
                <Block>
                    <DexTitle $visible={visible}>The Largest DEX on Stellar</DexTitle>
                </Block>

                <StatsBlock>
                    <StatWrapper $visible={visible} $delay={0.15}>
                        <StatsTitle>{isLoading ? <DotsLoader /> : tvlInUsd}</StatsTitle>
                        <StatsDesc>Total Locked in Liquidity</StatsDesc>
                    </StatWrapper>

                    <StatWrapper $visible={visible} $delay={0.3}>
                        <StatsTitle>{isLoading ? <DotsLoader /> : volumeInUsd}</StatsTitle>
                        <StatsDesc>Total Swap Volume</StatsDesc>
                    </StatWrapper>
                </StatsBlock>
            </DexBlocks>
        </Wrapper>
    );
};

export default DexStats;
