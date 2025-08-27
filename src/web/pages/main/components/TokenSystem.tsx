import styled from 'styled-components';

import TokenSystemIcon from 'assets/main-page/token-system.svg';
import AquaLogo from 'assets/aqua-logo-small.svg';
import IceLogo from 'assets/ice-logo.svg';

import { flexAllCenter, respondDown } from 'web/mixins';

import { Breakpoints, COLORS } from 'web/styles';
import { BlankRouterLink } from 'basics/links';
import { MainRoutes } from 'constants/routes';

const Wrapper = styled.section`
    ${flexAllCenter};
    flex-direction: column;
    margin-top: 11rem;

    ${respondDown(Breakpoints.md)`
        margin-top: 6rem;
        font-size: 6rem;
    `}

    ${respondDown(Breakpoints.sm)`
        margin-top: 0rem;
    `}

    ${respondDown(Breakpoints.xs)`
        margin-top: 1.6rem;
    `}
`;

const Title = styled.div`
    font-weight: bold;
    font-size: 7rem;
    color: ${COLORS.titleText};
    line-height: 100%;

    ${respondDown(Breakpoints.md)`
        font-size: 5.6rem;
    `}

    ${respondDown(Breakpoints.sm)`
        font-size: 3.2rem;
    `}

    ${respondDown(Breakpoints.xs)`
        font-size: 2.4rem;
    `}
`;

const BlocksWrapper = styled.div`
    display: flex;
    width: 100%;
    gap: 6rem;

    ${respondDown(Breakpoints.md)`
        gap: 4rem;
    `}

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        gap: 0;
    `}
`;

const IconBlock = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 50%;
    position: relative;

    ${respondDown(Breakpoints.sm)`
        justify-content: center;
        align-items: center;
        width: 100%;
    `}
`;

const TokensBlock = styled.div`
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    max-height: 58rem;
    flex: 1;
    width: 50%;
    gap: 2.4rem;

    ${respondDown(Breakpoints.sm)`
        width: 100%;
        gap: 1.6rem;
    `}

    ${respondDown(Breakpoints.xs)`
        width: 100%;
    `}
`;

const Description = styled.div`
    font-size: 1.6rem;
    font-weight: 500;
    line-height: 180%;
    color: #4d4f68;
    margin-top: 0.8rem;

    ${respondDown(Breakpoints.md)`
        margin-top: 0.8rem;
    `}

    ${respondDown(Breakpoints.sm)`
        margin-top: 0;
    `}

    ${respondDown(Breakpoints.xs)`
        font-size: 1.4rem;
    `}
`;

const StyledTokenSystemIcon = styled(TokenSystemIcon)`
    position: absolute;
    top: -100px;
    left: -100px;
    width: 77.8rem;
    height: 69.1rem;

    ${respondDown(Breakpoints.md)`
        width: 56.5rem;
        height: 50.2rem;
        top: 0;
        left: -60px;
        z-index: 1;
    `}

    ${respondDown(Breakpoints.sm)`
        position: initial;
        width: 47.2rem;
        height: 42rem;
    `}

    ${respondDown(Breakpoints.xs)`
        position: initial;
        width: auto;
        height: 26.9rem;

    `}
`;

const LinkButton = styled(BlankRouterLink)`
    background-color: ${COLORS.lightGray};
    border-radius: 48px;
    padding: 3.2rem 4rem;
    width: 100%;
    z-index: 2;

    &:hover {
        background: ${COLORS.white};
        box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    }

    ${respondDown(Breakpoints.md)`
        padding: 2.4rem 3.2rem;
    `}

    ${respondDown(Breakpoints.sm)`
        border-radius: 32px;
        padding: 1.6rem 2.4rem;
    `}
`;

const LinkContent = styled.div`
    display: flex;
    align-items: center;
    gap: 2.4rem;

    svg {
        width: 5rem;
        height: 5rem;
    }

    ${respondDown(Breakpoints.xs)`
        flex-direction: column;
        gap: 0.8rem;
    `}
`;

const LogoWrapper = styled.div`
    display: flex;
    justify-content: start;
    align-items: center;

    ${respondDown(Breakpoints.xs)`
        width: 100%;
        gap: 0.8rem;
    `}
`;

const DescWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const LinkTitle = styled.div`
    font-weight: bold;
    font-size: 2.4rem;
    line-height: 3.6rem;
    color: ${COLORS.titleText};

    ${respondDown(Breakpoints.xs)`
        display: none;
    `}
`;

const LinkTitleXs = styled(LinkTitle)`
    display: none;

    ${respondDown(Breakpoints.xs)`
        display: block;
    `}
`;

const LinkDesc = styled.div`
    font-weight: 500;
    font-size: 1.6rem;
    line-height: 180%;
`;

const TokenSystem = () => (
    <Wrapper id="token-system">
        <BlocksWrapper>
            <IconBlock>
                <StyledTokenSystemIcon />
            </IconBlock>
            <TokensBlock>
                <Title>Token system</Title>
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
                    </LinkContent>
                </LinkButton>
            </TokensBlock>
        </BlocksWrapper>
    </Wrapper>
);

export default TokenSystem;
