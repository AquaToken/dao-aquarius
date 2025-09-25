import { useState } from 'react';
import styled from 'styled-components';

import { fullWidthSectionStyles, respondDown } from 'web/mixins';
import { Breakpoints, COLORS, MAX_WIDTHS, PAGE_PADDINGS } from 'web/styles';

import HeroBackground from 'assets/main-page/hero-background.png';
import IconCheck16 from 'assets/small-icons/check/icon-check-16.svg';

import { HeroBottomRightStyled, HeroTopLeftStyled } from './HeroBlock';

type TabKey = 'stable' | 'volatile';

const Wrapper = styled.section`
    ${fullWidthSectionStyles};
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
    `}

    ${respondDown(Breakpoints.sm)`
        margin-top: 6rem;
    `}

    ${respondDown(Breakpoints.xs)`
        margin-top: 4rem;
        border-radius: 0;
        padding: 6rem ${PAGE_PADDINGS}rem;
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
    color: ${({ active }) => (active ? COLORS.purple200 : COLORS.white)};

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
    background: ${COLORS.purple200};
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

    color: ${({ tone }) => (tone === 'stable' ? COLORS.blue300 : COLORS.orange300)};
    border: 2px solid ${({ tone }) => (tone === 'stable' ? COLORS.blue300 : COLORS.orange300)};

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

const LiqPoolsTabs = () => {
    const [active, setActive] = useState<TabKey>('stable');

    return (
        <Wrapper id="liquidity-pools">
            <HeroTopLeftStyled />
            <HeroBottomRightStyled />
            <TitleBlocks>
                <Block>
                    <Title>
                        Liquidity pools are the <b>foundation of Aquarius</b>
                    </Title>
                </Block>
                <CheckboxesBlock>
                    <CheckBoxRow>
                        <IconCheck />
                        Supports both 2-asset and 3-asset pools, enabling flexible multi-asset
                        strategies
                    </CheckBoxRow>
                    <CheckBoxRow>
                        <IconCheck />
                        Works with standard Stellar assets as well as new Soroban-based tokens
                    </CheckBoxRow>
                </CheckboxesBlock>
            </TitleBlocks>
            <TabsBlock>
                <Tabs>
                    <TabBtn active={active === 'stable'} onClick={() => setActive('stable')}>
                        Stable Pools
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
                            : 'Designed for non-pegged assets, these pools use the constant product formula to balance prices.'}
                    </ContentTitle>
                </div>
            </TabsBlock>
        </Wrapper>
    );
};

export default LiqPoolsTabs;
