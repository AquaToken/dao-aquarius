import styled from 'styled-components';

import { flexAllCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import { DotsLoader } from 'basics/loaders';

const Wrapper = styled.section`
    ${flexAllCenter};
    flex-direction: column;
    margin-top: 11rem;

    ${respondDown(Breakpoints.md)`
        font-size: 6rem;
        margin-top: 6rem;
    `}

    ${respondDown(Breakpoints.xs)`
        font-size: 3.2rem;
        margin-top: 3rem;
    `}
`;

const DexTitle = styled.div`
    font-weight: bold;
    font-size: 7rem;
    color: ${COLORS.textPrimary};
    line-height: 100%;

    ${respondDown(Breakpoints.md)`
        font-size: 5.6rem;
    `}

    ${respondDown(Breakpoints.sm)`
        font-size: 3.2rem;
    `}

    ${respondDown(Breakpoints.xs)`
        font-size: 2.4rem;
        text-align: center;
    `}
`;

const DexBlocks = styled.div`
    display: flex;
    width: 100%;
    gap: 6rem;
    margin-top: 4.8rem;

    ${respondDown(Breakpoints.md)`
        margin-top: 2.4rem;
        gap: 4rem;
    `}

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        gap: 2.4rem;
    `}

    ${respondDown(Breakpoints.sm)`
        margin-top: 0;
    `}
`;

const Block = styled.div`
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    flex: 1;
    width: 50%;

    ${respondDown(Breakpoints.sm)`
        width: 100%;
    `}
`;

const StatsBlock = styled(Block)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
    flex: 1;
    width: 50%;
    gap: 6.4rem;

    ${respondDown(Breakpoints.md)`
        gap: 3.2rem;
    `}

    ${respondDown(Breakpoints.sm)`
        width: 100%;
        flex-direction: row;
        align-items: start;
        gap: 1.6rem;
    `}

    ${respondDown(Breakpoints.xs)`
        flex-direction: column;
        align-items: center;
    `}
`;

const StatWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
`;

const StatsTitle = styled.div`
    font-weight: bold;
    font-size: 7rem;
    line-height: 100%;
    color: ${COLORS.textPrimary};

    background: linear-gradient(90deg, ${COLORS.purple500}, ${COLORS.blue550});
    background-clip: text;
    -webkit-background-clip: text;
    -moz-background-clip: text;

    color: transparent;
    -webkit-text-fill-color: transparent;
    -moz-text-fill-color: transparent;

    ${respondDown(Breakpoints.md)`
        font-size: 3.2rem;
    `}

    ${respondDown(Breakpoints.sm)`
        font-size: 3.2rem;
    `}
`;

const StatsDesc = styled.div`
    font-size: 1.8rem;
    font-weight: 500;
    line-height: 180%;
    color: ${COLORS.gray550};
    margin-top: 0.8rem;

    ${respondDown(Breakpoints.md)`
        margin-top: 0.8rem;
    `}

    ${respondDown(Breakpoints.sm)`
        margin-top: 0;
    `}

    ${respondDown(Breakpoints.xs)`
        font-size: 1.6rem;
        line-height: 2.4rem;
    `}
`;

interface Props {
    isLoading: boolean;
    volumeInUsd: string;
    tvlInUsd: string;
}

const DexStats = ({ isLoading, volumeInUsd, tvlInUsd }: Props) => (
    <Wrapper id="dex-stats">
        <DexBlocks>
            <Block>
                <DexTitle>The Largest DEX on Stellar</DexTitle>
            </Block>
            <StatsBlock>
                <StatWrapper>
                    <StatsTitle>{isLoading ? <DotsLoader /> : tvlInUsd}</StatsTitle>
                    <StatsDesc>Total Locked in Liquidity</StatsDesc>
                </StatWrapper>
                <StatWrapper>
                    <StatsTitle>{isLoading ? <DotsLoader /> : volumeInUsd}</StatsTitle>
                    <StatsDesc>Total Swap Volume</StatsDesc>
                </StatWrapper>
            </StatsBlock>
        </DexBlocks>
    </Wrapper>
);

export default DexStats;
