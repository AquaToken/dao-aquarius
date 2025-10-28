import * as React from 'react';

import { AQUA_DOCS_URL } from 'constants/urls';

import { useScrollAnimation } from 'hooks/useScrollAnimation';

import AquaBuildersIcon from 'assets/main-page/aqua-builders.svg';

import { BlankExternalLink } from 'basics/links';

import {
    Wrapper,
    ShortWrapper,
    Title,
    Description,
    Benefits,
    BenefitsItem,
    IconCheck,
    DocsButton,
    ArrowAlt16Styled,
} from './AquaForBuilders.styled';

const BENEFITS = ['Wallet swaps', 'Trading automation', 'Liquidity aggregation'];

const AquaForBuilders: React.FC = () => {
    const { ref, visible } = useScrollAnimation(0.4, true);

    return (
        <Wrapper
            ref={ref as React.RefObject<HTMLDivElement>}
            $visible={visible}
            id="aqua-for-builders"
        >
            <ShortWrapper $visible={visible}>
                <AquaBuildersIcon />
                <Title $visible={visible}>Build on Aquarius</Title>
                <Description $visible={visible}>
                    Tap into Aquarius liquidity and swap contracts to power your project.
                </Description>

                <Benefits $visible={visible}>
                    {BENEFITS.map(benefit => (
                        <BenefitsItem key={benefit}>
                            <IconCheck />
                            {benefit}
                        </BenefitsItem>
                    ))}
                </Benefits>

                <BlankExternalLink href={AQUA_DOCS_URL}>
                    <DocsButton withGradient isBig isRounded $visible={visible}>
                        View docs <ArrowAlt16Styled />
                    </DocsButton>
                </BlankExternalLink>
            </ShortWrapper>
        </Wrapper>
    );
};

export default AquaForBuilders;
