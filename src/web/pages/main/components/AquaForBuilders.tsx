import styled from 'styled-components';

import { commonSectionPaddings, flexAllCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import AquaBuildersIcon from 'assets/main-page/aqua-builders.svg';
import IconCheck16 from 'assets/small-icons/check/icon-check-16.svg';
import ExternalLink from 'basics/ExternalLink';

const Wrapper = styled.section`
    ${flexAllCenter};
    width: 100%;
    background-color: ${COLORS.lightGray};
    margin-top: 11rem;
    padding: 5.6rem;
    border-radius: 4.8rem;

    ${commonSectionPaddings};

    ${respondDown(Breakpoints.md)`
        margin-top: 10rem;
        padding: 3.6rem;
    `}

    ${respondDown(Breakpoints.sm)`
        margin-top: 6rem;
        padding: 4rem 3rem;
    `}

    ${respondDown(Breakpoints.xs)`
        border-radius: 0;
        margin-top: 4rem;
        padding: 3.2rem 0;
    `}
`;

const ShortWrapper = styled.div`
    max-width: 64rem;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Title = styled.div`
    font-weight: 700;
    font-size: 3.5rem;
    line-height: 5.2rem;
    margin-top: 3.2rem;
    color: ${COLORS.titleText};

    ${respondDown(Breakpoints.sm)`
        font-size: 2.4rem;
        line-height: 3.6rem;
    `}
`;

const Description = styled.div`
    font-weight: 500;
    font-size: 1.6rem;
    line-height: 180%;
    margin-top: 0.8rem;
    color: #4d4f68;
    text-align: center;

    ${respondDown(Breakpoints.xs)`
        font-size: 1.4rem;
    `};
`;

const Benefits = styled.div`
    margin-top: 2.4rem;
    display: flex;
    gap: 2.4rem;
    font-weight: 500;
    font-size: 1.6rem;
    line-height: 180%;

    ${respondDown(Breakpoints.xs)`
        flex-direction: column;
        font-size: 1.4rem;
        gap: 0.8rem;
    `};
`;

const BenefitsItem = styled.div`
    ${flexAllCenter};
`;

const IconCheck = styled(IconCheck16)`
    color: ${COLORS.purple};
    margin-right: 0.6rem;
`;

const ExternalLinkStyled = styled(ExternalLink)`
    margin-top: 2.4rem;
    font-size: 1.6rem;
`;

const BENEFITS = ['Self-custodial wallets', 'Trading bots', 'DEX aggregators'];

const AquaForBuilders = () => (
    <Wrapper>
        <ShortWrapper>
            <AquaBuildersIcon />
            <Title>Aquarius for Stellar builders</Title>
            <Description>
                Build with on-chain oracles, smart contracts, and programmable incentive
            </Description>

            <Benefits>
                {BENEFITS.map(benefit => (
                    <BenefitsItem key={benefit}>
                        <IconCheck />
                        {benefit}
                    </BenefitsItem>
                ))}
            </Benefits>

            <ExternalLinkStyled href="#">Learn more about building on Aquarius</ExternalLinkStyled>
        </ShortWrapper>
    </Wrapper>
);

export default AquaForBuilders;
