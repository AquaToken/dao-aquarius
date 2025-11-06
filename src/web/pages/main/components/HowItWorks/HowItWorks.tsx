import * as React from 'react';

import { useScrollAnimation } from 'hooks/useScrollAnimation';

import HowItWorksIcon from 'assets/main-page/how-it-works.svg';

import {
    Wrapper,
    BlocksWrapper,
    TitleBlock,
    Title,
    Description,
    BlockInteractive,
    IconBlock,
    InteractiveItem,
    InteractiveTitle,
} from './HowItWorks.styled';

const HowItWorks: React.FC = () => {
    const { ref, visible } = useScrollAnimation(0.25, true);

    return (
        <Wrapper ref={ref as React.RefObject<HTMLDivElement>} $visible={visible} id="how-it-works">
            <BlocksWrapper>
                <TitleBlock $visible={visible}>
                    <Title $visible={visible}>How it works</Title>
                    <Description>
                        Aquarius incentives are designed to drive deep liquidity and sustainable
                        DeFi growth.
                    </Description>
                </TitleBlock>

                <BlockInteractive $visible={visible}>
                    <InteractiveItem $visible={visible} $delay={0.1}>
                        <InteractiveTitle>Traders</InteractiveTitle>
                        <Description>
                            Swap tokens seamlessly through Aquarius AMMs with low fees and fast
                            on-chain execution.
                        </Description>
                    </InteractiveItem>

                    <InteractiveItem $visible={visible} $delay={0.25}>
                        <InteractiveTitle>Voters</InteractiveTitle>
                        <Description>
                            Lock AQUA into ICE to vote on pools and direct emissions. Earn AQUA
                            rewards every day for voting!
                        </Description>
                    </InteractiveItem>

                    <InteractiveItem $visible={visible} $delay={0.4}>
                        <InteractiveTitle>Liquidity Providers</InteractiveTitle>
                        <Description>
                            Provide liquidity to AMM pools and earn AQUA rewards, trading fees, and
                            occasional bonus tokens.
                        </Description>
                    </InteractiveItem>
                </BlockInteractive>

                <IconBlock $visible={visible}>
                    <HowItWorksIcon />
                </IconBlock>
            </BlocksWrapper>
        </Wrapper>
    );
};

export default HowItWorks;
