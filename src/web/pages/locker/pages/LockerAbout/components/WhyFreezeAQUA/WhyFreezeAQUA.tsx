import * as React from 'react';

import { useScrollAnimation } from 'hooks/useScrollAnimation';

import Image1 from 'assets/locker/why-freeze-aqua-1.svg';
import Image2 from 'assets/locker/why-freeze-aqua-2.svg';
import Image3 from 'assets/locker/why-freeze-aqua-3.svg';

import {
    Container,
    Title,
    Content,
    Column,
    TextWrap,
    ColumnTitle,
    ColumnText,
} from './WhyFreezeAQUA.styled';

const WhyFreezeAQUA: React.FC = () => {
    const { ref, visible } = useScrollAnimation(0.2, true);

    return (
        <Container ref={ref as React.RefObject<HTMLDivElement>} $visible={visible}>
            <Title $visible={visible}>Why freeze AQUA?</Title>

            <Content>
                <Column $visible={visible} $delay={0}>
                    <Image1 />
                    <TextWrap>
                        <ColumnTitle>Boosted Liquidity Rewards</ColumnTitle>
                        <ColumnText>
                            ICE boosts your AQUA rewards when providing liquidity on both SDEX and
                            AMM markets. The more ICE you hold, the higher your boost — up to 250%
                            of the normal rewards. Earn more from the same position just by freezing
                            AQUA.
                        </ColumnText>
                    </TextWrap>
                </Column>

                <Column $visible={visible} $delay={0.15}>
                    <Image3 />
                    <TextWrap>
                        <ColumnTitle>Unlock voting</ColumnTitle>
                        <ColumnText>
                            Use ICE to participate in Aquarius governance and liquidity voting. The
                            longer the lock period of ICE, the more voting power you gain.
                        </ColumnText>
                    </TextWrap>
                </Column>

                <Column $visible={visible} $delay={0.3}>
                    <Image2 />
                    <TextWrap>
                        <ColumnTitle>Earn for Voting</ColumnTitle>
                        <ColumnText>
                            Voting with ICE lets you earn additional incentives through bribes —
                            including protocol-funded ones tied to market activity. You can also
                            delegate your ICE to trusted community members and earn passively while
                            they vote on your behalf.
                        </ColumnText>
                    </TextWrap>
                </Column>
            </Content>
        </Container>
    );
};

export default WhyFreezeAQUA;
