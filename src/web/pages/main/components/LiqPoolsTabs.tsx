import styled from 'styled-components';

import HeroBackground from 'assets/main-page/hero-background.png';
import IconCheck16 from 'assets/small-icons/check/icon-check-16.svg';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS, MAX_WIDTHS } from 'web/styles';
import { HeroBottomRightStyled, HeroTopLeftStyled } from './HeroBlock';
import { useState } from 'react';

type TabKey = 'stable' | 'volatile';

const Wrapper = styled.section`
    width: calc(100% - 4.8rem);
    max-width: ${MAX_WIDTHS.common};
    position: relative;
    overflow: hidden;
    background: url(${HeroBackground}) no-repeat center center / cover;
    color: ${COLORS.white};
    border-radius: 48px;
    padding: 6rem;
    display: flex;
    flex-direction: column;
    margin-top: 11rem;

    /* hide icons to back of content */
    svg {
        z-index: 0;
    }

    & > div {
        z-index: 1;
    }

    ${respondDown(Breakpoints.md)`
        padding: 4rem;
        margin-top: 9rem;
        width: calc(100% - 3.2rem);
    `}

    ${respondDown(Breakpoints.sm)`
        margin-top: 6rem;
    `}

    ${respondDown(Breakpoints.xs)`
        margin-top: 4rem;
        border-radius: 0;
        padding: 3.2rem 0.8rem;
        width: 100%;
    `}
`;

const TitleBlocks = styled.div`
    display: flex;
    align-items: center;
    gap: 6rem;
    width: 100%;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        gap: 2rem;
    `}

    ${respondDown(Breakpoints.sm)`
        gap: 1.6rem;
    `}
`;

const Title = styled.div`
    font-size: 3.5rem;
    line-height: 5.4rem;

    ${respondDown(Breakpoints.sm)`
        font-size: 3rem;
        line-height: 5.2rem;
    `}

    ${respondDown(Breakpoints.xs)`
        font-size: 2.4rem;
        line-height: 3.6rem;
    `}
`;

const Block = styled.div`
    display: flex;
    width: calc(50% - 3rem);

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const CheckboxesBlock = styled(Block)`
    flex-direction: column;
    gap: 0.8rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
        
    `}
`;

const CheckBoxRow = styled.div`
    display: flex;
    align-items: center;
    font-size: 1.6rem;
    line-height: 180%;
    gap: 0.8rem;

    ${respondDown(Breakpoints.xs)`
        line-height: 150%;
    `}
`;

const IconCheck = styled(IconCheck16)`
    color: ${COLORS.white};
`;

const TabsBlock = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 9rem;

    ${respondDown(Breakpoints.md)`
        margin-top: 7rem;
    `}

    ${respondDown(Breakpoints.sm)`
        margin-top: 6rem;
    `}

    ${respondDown(Breakpoints.xs)`
        margin-top: 4rem;
    `}
`;

const Tabs = styled.div`
    display: flex;
    gap: 4rem;
    position: relative;
    padding-bottom: 1rem;
    width: fit-content;
`;

const TabBtn = styled.button<{ active?: boolean }>`
    position: relative;
    appearance: none;
    background: transparent;
    border: 0;
    font-size: 1.8rem;
    line-height: 180%;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    opacity: ${({ active }) => (active ? 1 : 0.5)};
    color: ${({ active }) => (active ? '#BF63FF' : COLORS.white)};

    &:hover {
        transform: scale(1.1);
    }

    ${respondDown(Breakpoints.xs)`
        font-size: 1.4rem;
    `}
`;

const Underline = styled.div<{ active: TabKey }>`
    position: absolute;
    left: ${props => (props.active === 'stable' ? 0 : 'inherit')};
    right: ${props => (props.active === 'volatile' ? 0 : 'inherit')};
    bottom: 0;
    height: 0.4rem;
    width: calc(50% - 2rem);
    background: #bf63ff;
`;

const UnderlineBack = styled.div<{ active: TabKey }>`
    position: absolute;
    left: ${props => (props.active === 'stable' ? 0 : 'inherit')};
    right: ${props => (props.active === 'volatile' ? 0 : 'inherit')};
    bottom: 0;
    height: 0.4rem;
    width: 100%;
    background: ${COLORS.white};
    opacity: 0.2;
    transition: transform 0.25s ease;
    z-index: 0;
`;

const Badge = styled.span<{ tone?: 'stable' | 'volatile' }>`
    text-transform: uppercase;
    display: inline-block;
    margin-top: 4.6rem;
    margin-bottom: 0.6rem;
    padding: 0.4rem 0.8rem;
    font-size: 1.2rem;
    border-radius: 0.7rem;
    font-weight: 700;

    color: ${({ tone }) => (tone === 'stable' ? COLORS.stablePool : COLORS.constantPool)};
    border: 2px solid ${({ tone }) => (tone === 'stable' ? COLORS.stablePool : COLORS.constantPool)};

    ${respondDown(Breakpoints.sm)`
        margin-top: 3.2rem;
    `}
`;

const ContentTitle = styled.div`
    font-size: 3.5rem;
    line-height: 5.4rem;

    ${respondDown(Breakpoints.sm)`
        font-size: 3rem;
        line-height: 5.2rem;
    `}

    ${respondDown(Breakpoints.xs)`
        font-size: 2.4rem;
        line-height: 3.6rem;
    `}
`;

const TabsHeader = styled.div`
    display: grid;
    gap: 4px;
`;

const LiqPoolsTabs = () => {
    const [active, setActive] = useState<TabKey>('stable');

    return (
        <Wrapper id="liquidity-pools">
            <HeroTopLeftStyled />
            <HeroBottomRightStyled />
            <TitleBlocks>
                <Block>
                    <Title>
                        Liquidity pools are the <b>foundation of Aquarius AMMs</b>
                    </Title>
                </Block>
                <CheckboxesBlock>
                    <CheckBoxRow>
                        <IconCheck />
                        Supported 2- and 3-asset pools to enabling multi-asset strategies
                    </CheckBoxRow>
                    <CheckBoxRow>
                        <IconCheck />
                        Standard Stellar and novel Soroban assets are supported
                    </CheckBoxRow>
                </CheckboxesBlock>
            </TitleBlocks>
            <TabsBlock>
                <Tabs>
                    <TabBtn active={active === 'stable'} onClick={() => setActive('stable')}>
                        Stable Swap
                    </TabBtn>

                    <TabBtn active={active === 'volatile'} onClick={() => setActive('volatile')}>
                        Volatile Pools
                    </TabBtn>

                    <Underline active={active} />
                    <UnderlineBack active={active} />
                </Tabs>
                <div>
                    <Badge tone={active}>{active}</Badge>
                    <ContentTitle>
                        {active === 'stable'
                            ? 'Designed for stablecoins or 1:1-pegged assets, these pools aim to maintain tight price alignment.'
                            : 'Classic AMM pools designed for volatile assets. Prices are determined by the constant product formula, dynamically adjusting based on supply and demand during swaps.'}
                    </ContentTitle>
                </div>
            </TabsBlock>
        </Wrapper>
    );
};

export default LiqPoolsTabs;
