import * as React from 'react';

import { MainRoutes } from 'constants/routes';

import { useScrollAnimation } from 'hooks/useScrollAnimation';

import AquaLogo from 'assets/aqua/aqua-logo.svg';
import IceLogo from 'assets/tokens/ice-logo.svg';

import {
    Wrapper,
    BlocksWrapper,
    IconBlock,
    TokensBlock,
    StyledTokenSystemIcon,
    Title,
    Description,
    LinkButton,
    LinkContent,
    LogoWrapper,
    DescWrapper,
    LinkTitle,
    LinkTitleXs,
    LinkDesc,
    ArrowAlt16Styled,
} from './TokenSystem.styled';

const TokenSystem: React.FC = () => {
    const { ref, visible } = useScrollAnimation(0.25, true);

    return (
        <Wrapper ref={ref as React.RefObject<HTMLDivElement>} $visible={visible} id="token-system">
            <BlocksWrapper>
                <IconBlock $visible={visible}>
                    <StyledTokenSystemIcon />
                </IconBlock>

                <TokensBlock $visible={visible}>
                    <Title $visible={visible}>Token system</Title>
                    <Description>
                        Earn AQUA by providing liquidity. Lock AQUA into ICE to access voting, earn
                        voting rewards, boost liquidity rewards, and participate in governance.
                    </Description>

                    <LinkButton to={MainRoutes.token}>
                        <LinkContent>
                            <LogoWrapper>
                                <AquaLogo />
                                <LinkTitleXs>AQUA</LinkTitleXs>
                            </LogoWrapper>
                            <DescWrapper>
                                <LinkTitle>AQUA</LinkTitle>
                                <LinkDesc>
                                    Utility token for liquidity rewards and ICE conversion.
                                </LinkDesc>
                            </DescWrapper>
                            <ArrowAlt16Styled />
                        </LinkContent>
                    </LinkButton>

                    <LinkButton to={MainRoutes.locker}>
                        <LinkContent>
                            <LogoWrapper>
                                <IceLogo />
                                <LinkTitleXs>ICE</LinkTitleXs>
                            </LogoWrapper>
                            <DescWrapper>
                                <LinkTitle>ICE</LinkTitle>
                                <LinkDesc>
                                    Non-transferable token for voting and reward boosts.
                                </LinkDesc>
                            </DescWrapper>
                            <ArrowAlt16Styled />
                        </LinkContent>
                    </LinkButton>
                </TokensBlock>
            </BlocksWrapper>
        </Wrapper>
    );
};

export default TokenSystem;
