import styled from 'styled-components';

import { AQUA_DOCS_URL } from 'constants/urls';

import { flexAllCenter, fullWidthSectionStyles, respondDown } from 'web/mixins';
import { Breakpoints, COLORS, PAGE_PADDINGS } from 'web/styles';

import ArrowAlt16 from 'assets/arrows/arrow-alt-16.svg';
import AquaBuildersIcon from 'assets/main-page/aqua-builders.svg';
import IconCheck16 from 'assets/small-icons/check/icon-check-16.svg';

import { Button } from 'basics/buttons';
import { BlankExternalLink } from 'basics/links';

const Wrapper = styled.section`
    ${flexAllCenter};
    ${fullWidthSectionStyles};
    width: 100%;
    background-color: ${COLORS.gray50};
    margin-top: 11rem;
    padding: 5.6rem;
    border-radius: 4.8rem;

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
        padding: 3.2rem ${PAGE_PADDINGS}rem;
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
    color: ${COLORS.textPrimary};

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
    color: ${COLORS.gray550};
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
    color: ${COLORS.purple500};
    margin-right: 0.6rem;
`;

const DocsButton = styled(Button)`
    margin-top: 1.6rem;
    border-radius: 46px;

    ${respondDown(Breakpoints.sm)`
        padding: 0 2.4rem;
        height: 4rem;
    `}

    ${respondDown(Breakpoints.xs)`
        width: 100%;
    `}
`;

const ArrowAlt16Styled = styled(ArrowAlt16)`
    margin-left: 0.8rem;
    color: ${COLORS.white};
`;

const BENEFITS = ['Wallet swaps', 'Trading automation', 'Liquidity aggregation'];

const AquaForBuilders = () => (
    <Wrapper id="aqua-for-builders">
        <ShortWrapper>
            <AquaBuildersIcon />
            <Title>Build on Aquarius</Title>
            <Description>
                Tap into Aquarius liquidity and swap contracts to power your project.
            </Description>

            <Benefits>
                {BENEFITS.map(benefit => (
                    <BenefitsItem key={benefit}>
                        <IconCheck />
                        {benefit}
                    </BenefitsItem>
                ))}
            </Benefits>

            <BlankExternalLink href={AQUA_DOCS_URL}>
                <DocsButton withGradient isBig isRounded>
                    View docs <ArrowAlt16Styled />
                </DocsButton>
            </BlankExternalLink>
        </ShortWrapper>
    </Wrapper>
);

export default AquaForBuilders;
