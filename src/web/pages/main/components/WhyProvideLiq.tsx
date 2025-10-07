import * as React from 'react';
import styled, { css } from 'styled-components';

import { useScrollAnimation } from 'hooks/useScrollAnimation';

import {
    containerScrollAnimation,
    slideUpSoftAnimation,
    fadeAppearAnimation,
} from 'web/animations';
import { flexAllCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import BoostRewardsIcon from 'assets/main-page/boost-rewards.svg';
import EarnByMarketIcon from 'assets/main-page/earn-by-market.svg';
import EarnMoreIcon from 'assets/main-page/earn-more.svg';

import { DotsLoader } from 'basics/loaders';

/* -------------------------------------------------------------------------- */
/*                                   Styled                                   */
/* -------------------------------------------------------------------------- */

const Wrapper = styled.section<{ $visible: boolean }>`
    ${flexAllCenter};
    flex-direction: column;
    margin-top: 11rem;
    ${containerScrollAnimation};

    ${respondDown(Breakpoints.lg)`
      font-size: 10rem;
  `}

    ${respondDown(Breakpoints.md)`
      font-size: 7rem;
      margin-top: 6rem;
  `}

  ${respondDown(Breakpoints.xs)`
      font-size: 4rem;
      margin-top: 4rem;
  `}
`;

const WhyTitle = styled.div<{ $visible: boolean }>`
    font-weight: bold;
    font-size: 7rem;
    color: ${COLORS.textPrimary};
    line-height: 100%;
    opacity: 0;

    ${({ $visible }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: 0.1s;
        `}

    ${respondDown(Breakpoints.md)`
      font-size: 5.6rem;
  `}

  ${respondDown(Breakpoints.sm)`
      font-size: 3.2rem;
  `}
`;

const WhyStats = styled.div<{ $visible: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    opacity: 0;

    ${({ $visible }) =>
        $visible &&
        css`
            ${fadeAppearAnimation};
            animation-delay: 0.2s;
        `}

    ${respondDown(Breakpoints.sm)`
      justify-content: center;
      align-items: center;
  `}
`;

const WhyBlocks = styled.div`
    display: flex;
    width: 100%;
    gap: 6rem;

    ${respondDown(Breakpoints.md)`
      gap: 4rem;
  `}

    ${respondDown(Breakpoints.sm)`
      flex-direction: column;
      gap: 3.2rem;
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

const ShowOnSm = styled(Block)`
    display: none;

    ${respondDown(Breakpoints.sm)`
      display: flex;
      flex-direction: column;
      align-items: center;
  `}
`;

const InfoBlock = styled(Block)<{ $visible: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
    flex: 1;
    width: 50%;
    gap: 6.4rem;
    opacity: 0;

    ${({ $visible }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: 0.25s;
        `}

    ${respondDown(Breakpoints.md)`
      gap: 3.2rem;
  `}

  ${respondDown(Breakpoints.sm)`
      width: 100%;
      flex-direction: column;
  `}
`;

const InfoWrapper = styled.div<{ $delay: number; $visible: boolean }>`
    display: flex;
    gap: 1.6rem;
    width: 100%;
    opacity: 0;

    ${({ $visible, $delay }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: ${$delay}s;
        `}

    svg {
        flex: 0 0 auto;
        width: 10rem;
        height: 10rem;
    }

    ${respondDown(Breakpoints.sm)`
      align-items: center;

       svg {
          width: 6.8rem;
          height: 6.8rem;
      }
  `}
`;

const StatsTitle = styled.div`
    font-weight: bold;
    font-size: 3.5rem;
    line-height: 100%;
    color: ${COLORS.textPrimary};

    background: linear-gradient(90deg, ${COLORS.purple500}, ${COLORS.blue550});
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
`;

const DescBlock = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
`;

const DescTitle = styled.div`
    font-weight: bold;
    font-size: 2.4rem;
    line-height: 3.6rem;
    color: ${COLORS.textPrimary};

    ${respondDown(Breakpoints.xs)`
      font-size: 1.6rem;
      line-height: 2.4rem;
  `}
`;

const Description = styled.div`
    font-size: 1.6rem;
    font-weight: 500;
    line-height: 180%;
    color: ${COLORS.gray550};

    ${respondDown(Breakpoints.xs)`
      font-size: 1.6rem;
      line-height: 2.4rem;
  `}
`;

const DescriptionStats = styled(Description)`
    font-weight: bold;

    ${respondDown(Breakpoints.xs)`
      text-align: center;
  `}
`;

const HideOnSm = styled.div`
    ${respondDown(Breakpoints.sm)` 
      display: none; 
  `}
`;

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

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
