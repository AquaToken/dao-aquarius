import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { respondDown } from '../../../../common/mixins';
import About1 from '../../../../common/assets/img/about-image-1.svg';
import About2 from '../../../../common/assets/img/about-image-2.svg';
import About3 from '../../../../common/assets/img/about-image-3.svg';

const Container = styled.section`
    display: flex;
    justify-content: center;
    flex: auto;
    position: relative;
    min-height: 0;
    padding-top: 17rem;
    margin-bottom: 21rem;

    ${respondDown(Breakpoints.md)`
        padding-top: 6rem;
        margin-bottom: 3rem;
    `}
`;

const Wrapper = styled.div`
    margin-left: 21rem;
    max-width: 110rem;
    padding: 0 10rem;

    ${respondDown(Breakpoints.md)`
        padding: 0 1.6rem;
        max-width: 55rem;
        margin-left: 0;
    `}
`;

const Title = styled.div`
    font-size: 3.5rem;
    line-height: 4.1rem;
    color: ${COLORS.titleText};
    margin-bottom: 3rem;

    ${respondDown(Breakpoints.md)`
        font-size: 2.9rem;
        line-height: 3.4rem;
        margin-bottom: 1.6rem;
    `}
`;

const Description = styled.div`
    max-width: 69rem;
    margin-bottom: 12rem;
    color: ${COLORS.darkGrayText};
    font-size: 1.6rem;
    line-height: 3rem;

    ${respondDown(Breakpoints.md)`
        font-size: 1.4rem;
        line-height: 2.5rem;
        margin-bottom: 4rem;
    `}
`;

const ContentBlock = styled.div`
    display: grid;
    grid-template-rows: 2.3rem 1fr;
    grid-template-columns: 15rem 1fr;
    grid-column-gap: 6rem;
    grid-row-gap: 1.2rem;
    grid-template-areas:
        'image title'
        'image text';

    &:not(:last-child) {
        margin-bottom: 13rem;
    }

    svg {
        grid-area: image;
    }

    ${respondDown(Breakpoints.md)`
        &:not(:last-child) {
            margin-bottom: 4rem;
        }
    `}

    ${respondDown(Breakpoints.sm)`
        grid-template-areas:
            "image title"
            "text text";
        grid-template-rows: 7.2rem 1fr;
        grid-template-columns: 10rem 1fr;
        grid-column-gap: 2.1rem;
        grid-row-gap: 1.6rem;
        
        svg {
            height: 7.2rem;
        }
    `}
`;

const ContentTitle = styled.div`
    grid-area: title;
    font-size: 2rem;
    line-height: 2.3rem;
    color: ${COLORS.titleText};
    align-self: center;
`;

const ContentText = styled.div`
    grid-area: text;
    font-size: 1.6rem;
    line-height: 3rem;
    color: ${COLORS.darkGrayText};
    max-width: 60rem;

    ${respondDown(Breakpoints.md)`
        font-size: 1.4rem;
        line-height: 2.5rem;
    `}
`;

const About = () => {
    return (
        <Container>
            <Wrapper>
                <Title>What is Aquarius?</Title>
                <Description>
                    Aquarius is designed to supercharge trading on Stellar, bring more liquidity and
                    give control over how it is distributed across various market pairs. It adds
                    incentives for SDEX traders ("market maker rewards") and rewards for AMM
                    liquidity providers. Aquarius allows community to set rewards for selected
                    markets through on-chain voting.
                </Description>

                <Title>What is AQUA token?</Title>
                <Description>
                    AQUA is the currency for rewards and on-chain voting in Aquarius. AQUA holders
                    can vote for market pairs that need more liquidity and select trusted assets.
                    Traders and LPs earn AQUA on selected market pairs. AQUA will play an important
                    role in projects built on Stellar. Majority of AQUA tokens will be distributed
                    to network participants and market makers. Contact email for institutional
                    investors - tokens@aqua.network.
                </Description>

                <ContentBlock>
                    <About1 />
                    <ContentTitle>Incentives for liquidity providers</ContentTitle>
                    <ContentText>
                        The core use case of the AQUA token is to increase liquidity on Stellar.
                        This will be achieved by incentivizing market makers on SDEX and AMM LPs.
                    </ContentText>
                </ContentBlock>
                <ContentBlock>
                    <About2 />
                    <ContentTitle>Governance for token holders</ContentTitle>
                    <ContentText>
                        Token holders will vote for market pairs requiring liquidity to allocate
                        rewards. AQUA is also an utility token to govern the Aquarius protocol
                        through on-chain DAO voting.
                    </ContentText>
                </ContentBlock>
                <ContentBlock>
                    <About3 />
                    <ContentTitle>Ecosystem benefits</ContentTitle>
                    <ContentText>
                        AQUA tokens will be integrated in other projects built on Stellar and may
                        provide holders with additional benefits within the Stellar ecosystem.
                    </ContentText>
                </ContentBlock>
            </Wrapper>
        </Container>
    );
};

export default About;
