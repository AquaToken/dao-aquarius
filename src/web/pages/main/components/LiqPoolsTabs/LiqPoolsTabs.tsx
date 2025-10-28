import { useState } from 'react';

import { useScrollAnimation } from 'hooks/useScrollAnimation';

import {
    Wrapper,
    TitleBlocks,
    Block,
    CheckboxesBlock,
    CheckBoxRow,
    IconCheck,
    TabsBlock,
    Tabs,
    TabBtn,
    Underline,
    UnderlineBack,
    Badge,
    ContentTitle,
    Title,
    TabKey,
} from './LiqPoolsTabs.styled';

import { HeroTopLeftStyled, HeroBottomRightStyled } from '../HeroBlock/HeroBlock.styled';

const LiqPoolsTabs = () => {
    const [active, setActive] = useState<TabKey>('stable');
    const { ref, visible } = useScrollAnimation(0.2, true);

    return (
        <Wrapper
            ref={ref as React.RefObject<HTMLDivElement>}
            $visible={visible}
            id="liquidity-pools"
        >
            <HeroTopLeftStyled />
            <HeroBottomRightStyled />

            <TitleBlocks $visible={visible}>
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

            <TabsBlock $visible={visible}>
                <Tabs>
                    <TabBtn active={active === 'stable'} onClick={() => setActive('stable')}>
                        Stable Pools
                    </TabBtn>
                    <TabBtn active={active === 'volatile'} onClick={() => setActive('volatile')}>
                        Volatile Pools
                    </TabBtn>

                    <Underline active={active} />
                    <UnderlineBack />
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
