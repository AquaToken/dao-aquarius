import styled from 'styled-components';

import SorobanStars from 'assets/main-page/soroban-stars.svg';
import SwapBlockIcon from 'assets/main-page/swap-block.svg';
import PoolsBlockIcon from 'assets/main-page/pools-block.svg';
import ArrowAlt16 from 'assets/arrows/arrow-alt-16.svg';

import { flexAllCenter, respondDown } from 'web/mixins';

import { Breakpoints, COLORS } from 'web/styles';
import { Button } from 'basics/buttons';
import { MainRoutes } from 'constants/routes';
import { BlankRouterLink } from 'basics/links';

const Wrapper = styled.section`
    ${flexAllCenter};
    flex-direction: column;
    margin-top: 11rem;

    ${respondDown(Breakpoints.sm)`
       margin-top: 6.4rem;
    `}

    ${respondDown(Breakpoints.xs)`
       margin-top: 4.8rem;
    `}
`;

const InnerWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 79rem;
    text-align: center;
`;

const Title = styled.span`
    font-size: 3.5rem;
    line-height: 5.2rem;
    color: ${COLORS.titleText};

    ${respondDown(Breakpoints.sm)`
        font-size: 2.4rem;
        line-height: 100%;
    `}
`;

const TitleBold = styled(Title)`
    font-weight: 700;
    color: ${COLORS.purple};
`;

const SorobanStarsStyled = styled(SorobanStars)`
    margin-bottom: 2.4rem;
`;

const SorobanBlocks = styled.div`
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
        gap: 1.6rem;
    `}
`;

const Block = styled.div`
    background-color: ${COLORS.lightGray};
    display: flex;
    justify-content: space-between;
    flex: 1;
    flex-direction: column;
    border-radius: 4.8rem;
    padding: 4.8rem;
    width: 50%;

    ${respondDown(Breakpoints.sm)`
        padding: 3.2rem;
        width: 100%;
    `}
`;

const BlockWithIcon = styled.div`
    ${respondDown(Breakpoints.sm)`
        display: flex;
        align-items: center;
        gap: 1.6rem;

        svg {
            flex: 0 0 auto;
        }
    `}

    ${respondDown(Breakpoints.xs)`
        flex-direction: column;
        align-items: start;
    `}
`;

const BlockDesc = styled.div`
    font-size: 2.4rem;
    line-height: 3.6rem;
    color: ${COLORS.titleText};
    margin-top: 1.6rem;

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

const SorobanButton = styled(Button)`
    margin-top: 4rem;
    padding: 0 2.4rem;

    ${respondDown(Breakpoints.sm)`
        margin-top: 3.2rem;
    `}

    ${respondDown(Breakpoints.xs)`
        width: 100%;
    `}
`;

const ArrowAlt16Styled = styled(ArrowAlt16)`
    margin-left: 0.8rem;
    color: ${COLORS.titleText};
`;

const AquaSoroban = () => (
    <Wrapper id="aqua-soroban">
        <InnerWrapper>
            <SorobanStarsStyled />
            <Title>
                Aquarius AMMs <TitleBold>run on Soroban smart contracts</TitleBold> — powering a new
                generation of DeFi on Stellar.
            </Title>
        </InnerWrapper>

        <SorobanBlocks>
            <Block>
                <BlockWithIcon>
                    <SwapBlockIcon />

                    <BlockDesc>
                        <b>Swap instantly</b> with deep on-chain liquidity from Aquarius AMMs.
                    </BlockDesc>
                </BlockWithIcon>
                <BlankRouterLink to={MainRoutes.swap}>
                    <SorobanButton withGradient secondary isBig isRounded>
                        Swap now <ArrowAlt16Styled />
                    </SorobanButton>
                </BlankRouterLink>
            </Block>
            <Block>
                <BlockWithIcon>
                    <PoolsBlockIcon />

                    <BlockDesc>
                        <b>Provide liquidity</b> and get rewarded while powering Stellar markets.
                    </BlockDesc>
                </BlockWithIcon>
                <BlankRouterLink to={MainRoutes.amm}>
                    <SorobanButton withGradient secondary isBig isRounded>
                        View Pools <ArrowAlt16Styled />
                    </SorobanButton>
                </BlankRouterLink>
            </Block>
        </SorobanBlocks>
    </Wrapper>
);

export default AquaSoroban;
