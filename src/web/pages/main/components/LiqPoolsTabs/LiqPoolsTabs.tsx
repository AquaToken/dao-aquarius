import { useEffect, useRef, useState } from 'react';

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
    TabBtnLabel,
    Underline,
    UnderlineBack,
    Badge,
    ContentTitle,
    Title,
    TabKey,
} from './LiqPoolsTabs.styled';

import { HeroTopLeftStyled, HeroBottomRightStyled } from '../HeroBlock/HeroBlock.styled';

const TABS: { key: TabKey; label: string; description: string }[] = [
    {
        key: 'stable',
        label: 'Stable Pools',
        description:
            'Designed for stablecoins or 1:1-pegged assets, these pools aim to maintain tight price alignment.',
    },
    {
        key: 'volatile',
        label: 'Volatile Pools',
        description:
            'Designed for non-pegged assets, these pools use the constant product formula to balance prices.',
    },
    {
        key: 'concentrated',
        label: 'Concentrated Pools',
        description:
            'Designed to concentrate liquidity within a chosen price range for higher capital efficiency.',
    },
];

const LiqPoolsTabs = () => {
    const [active, setActive] = useState<TabKey>(TABS[0].key);
    const { ref, visible } = useScrollAnimation(0.2, true);
    const activeTabIndex = TABS.findIndex(({ key }) => key === active);
    const activeTab = TABS[activeTabIndex] || TABS[0];
    const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const labelRefs = useRef<Array<HTMLSpanElement | null>>([]);
    const [underline, setUnderline] = useState({ left: 0, width: 0 });

    useEffect(() => {
        const updateUnderline = () => {
            const button = buttonRefs.current[activeTabIndex];
            const label = labelRefs.current[activeTabIndex];

            if (!button || !label) {
                return;
            }

            const width = label.offsetWidth;
            const left = button.offsetLeft + (button.offsetWidth - width) / 2;

            setUnderline({ left, width });
        };

        updateUnderline();
        window.addEventListener('resize', updateUnderline);

        return () => {
            window.removeEventListener('resize', updateUnderline);
        };
    }, [activeTabIndex]);

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
                    {TABS.map(({ key, label }, index) => (
                        <TabBtn
                            key={key}
                            active={active === key}
                            onClick={() => setActive(key)}
                            ref={element => {
                                buttonRefs.current[index] = element;
                            }}
                        >
                            <TabBtnLabel
                                ref={element => {
                                    labelRefs.current[index] = element;
                                }}
                            >
                                {label}
                            </TabBtnLabel>
                        </TabBtn>
                    ))}

                    <Underline $left={underline.left} $width={underline.width} />
                    <UnderlineBack />
                </Tabs>

                <div>
                    <Badge tone={activeTab.key}>{activeTab.key}</Badge>
                    <ContentTitle>{activeTab.description}</ContentTitle>
                </div>
            </TabsBlock>
        </Wrapper>
    );
};

export default LiqPoolsTabs;
