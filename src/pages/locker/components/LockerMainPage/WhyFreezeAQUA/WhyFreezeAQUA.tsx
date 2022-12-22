import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../../common/styles';
import { respondDown } from '../../../../../common/mixins';
import Image1 from '../../../../../common/assets/img/why-freeze-aqua-1.svg';
import Image2 from '../../../../../common/assets/img/why-freeze-aqua-2.svg';
import Image3 from '../../../../../common/assets/img/why-freeze-aqua-3.svg';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    padding: 0 4rem;
    margin-top: 10rem;
    margin-bottom: 18rem;

    ${respondDown(Breakpoints.md)`
        padding: 4rem 1.6rem;
        margin-top: 0;
        margin-bottom: 0;
    `}
`;

const Content = styled.div`
    display: flex;
    gap: 6rem;

    ${respondDown(Breakpoints.md)`
        gap: 0;
        flex-direction: column;
    `}
`;

const Column = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;

    svg {
        min-height: 13.8rem;
    }

    ${respondDown(Breakpoints.md)`
        margin-bottom: 8rem;
    `}
`;

const Title = styled.span`
    font-size: 3.5rem;
    line-height: 4.1rem;
    color: ${COLORS.buttonBackground};
    margin-bottom: 7rem;

    ${respondDown(Breakpoints.md)`
        font-size: 2.5rem;
        margin-bottom: 3rem;
    `}
`;

const ColumnTitle = styled.span`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
    margin-top: 5.5rem;
    margin-bottom: 2.3rem;

    ${respondDown(Breakpoints.md)`
        margin-top: 2rem;
    `}
`;

const ColumnText = styled.span`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
`;

const WhyFreezeAQUA = (): JSX.Element => {
    return (
        <Container>
            <Title>Why freeze AQUA?</Title>
            <Content>
                <Column>
                    <Image1 />
                    <ColumnTitle>Increased Liquidity Rewards</ColumnTitle>
                    <ColumnText>
                        The core benefit of ICE is boosted AQUA reward yields when taking part with
                        SDEX & AMM liquidity rewarded markets. The higher a user’s ICE balance, the
                        higher their liquidity reward boost!
                    </ColumnText>
                </Column>
                <Column>
                    <Image2 />
                    <ColumnTitle>Voting Flexibility</ColumnTitle>
                    <ColumnText>
                        There are no hard decisions on whether to vote for your favorite markets,
                        participate in governance, or downvoting other market pairs. ICE allows full
                        flexibility between these key voting areas, meaning you can participate with
                        them simultaneously.
                    </ColumnText>
                </Column>
                <Column>
                    <Image3 />
                    <ColumnTitle>Increased Voting Power</ColumnTitle>
                    <ColumnText>
                        Those who freeze into ICE can gain vastly increased voting power! Up to ten
                        times the voting weight compared to AQUA can be achieved when freezing for 3
                        years or more. This gives you more say in governance & liquidity voting.
                    </ColumnText>
                </Column>
            </Content>
        </Container>
    );
};

export default WhyFreezeAQUA;
