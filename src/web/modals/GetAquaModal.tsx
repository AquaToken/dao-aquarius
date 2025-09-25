import * as React from 'react';
import styled from 'styled-components';

import ArrowRight from 'assets/icon-arrow-right.svg';
import LobstrLogo from 'assets/lobstr-name-logo.svg';
import StellarTermLogo from 'assets/stellarterm-logo.svg';
import StellarXLogo from 'assets/stellarx-logo.svg';

import CopyButton from 'basics/buttons/CopyButton';
import { ExternalLink } from 'basics/links';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import PublicKeyWithIcon from 'components/PublicKeyWithIcon';

import { flexRowSpaceBetween, respondDown } from '../mixins';
import { Breakpoints, COLORS } from '../styles';

const Container = styled.div`
    width: 100%;
`;

const TrustedPlatformsBlock = styled(Container)`
    margin-top: 5.6rem;
`;

const AssetInfo = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 1.4rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        
        & > div {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.6rem;
        }
    `}
`;

const GrayText = styled.div`
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.textTertiary};
`;

const BoldText = styled.div`
    font-weight: 700;
    font-size: 1.6rem;
    line-height: 1.9rem;
    margin: 0.5rem 0 0 0;
    color: ${COLORS.textPrimary};

    ${respondDown(Breakpoints.md)`
          margin: 0;
    `}
`;

const InfoRow = styled.div`
    padding: 2rem 0 2.3rem;
    border-bottom: solid 1px rgba(35, 2, 77, 0.1);
`;

const Text = styled.div`
    color: ${COLORS.textSecondary};
    font-size: 1.6rem;
    line-height: 2.9rem;
    margin: 0.8rem 0;
`;

const PlatfomLink = styled.a`
    display: flex;
    align-items: center;
    justify-content: space-between;
    &:not(:last-child) {
        margin-bottom: 2rem;
    }
    background: ${COLORS.gray50};
    border-radius: 0.5rem;
    padding: 3rem 2rem 3rem 4rem;

    text-decoration: none;
    transition: 0.2s;
    &:hover {
        background: ${COLORS.white};
        box-shadow: 0 2rem 3rem rgb(0 6 54 / 6%);
    }
`;

const LinkBody = styled.div`
    display: flex;
    align-items: center;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        align-items: start;
        margin-right: 1.6rem;
    `}
`;

const LinkContent = styled.div`
    margin-left: 9.5rem;
    flex: 1;

    ${respondDown(Breakpoints.md)`
        margin-left: 0;
        margin-top: 1.6rem;
    `}
`;

const LinkTitle = styled(BoldText)`
    margin: 0 0 0.6rem 0;
`;

const LinkDescription = styled(GrayText)`
    line-height: 2.9rem;
`;

const GetAquaModal = (): React.ReactNode => (
    <ModalWrapper $isWide>
        <Container>
            <ModalTitle>Get AQUA token</ModalTitle>
            <ModalDescription>AQUA is the utility token of Aquarius project.</ModalDescription>
            <AssetInfo>
                <div>
                    <GrayText>Asset code</GrayText>
                    <BoldText>AQUA</BoldText>
                </div>
                <div>
                    <GrayText>Home domain</GrayText>
                    <BoldText>aqua.network</BoldText>
                </div>
                <div>
                    <GrayText>Issuer address</GrayText>
                    <BoldText>
                        {/* TODO: get aqua issuer here from env api */}
                        <CopyButton text="GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA">
                            <PublicKeyWithIcon pubKey="GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA" />
                        </CopyButton>
                    </BoldText>
                </div>
            </AssetInfo>
            <InfoRow>
                <ExternalLink href="https://stellar.expert/explorer/public/asset/AQUA-GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA-1">
                    View on Network Explorer
                </ExternalLink>
                <Text>
                    Make sure the home domain is &quot;aqua.network&quot; when you add AQUA.
                </Text>
            </InfoRow>
        </Container>
        <TrustedPlatformsBlock>
            <ModalTitle>Get on trusted platforms</ModalTitle>
            <ModalDescription>
                We suggest using trusted platforms for greater security
            </ModalDescription>
            <PlatfomLink
                href="https://lobstr.co/trade/AQUA:GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA"
                target="_blank"
            >
                <LinkBody>
                    <LobstrLogo />
                    <LinkContent>
                        <LinkTitle>Lobstr.co</LinkTitle>
                        <LinkDescription>
                            Trading platform built on the Stellar network.
                        </LinkDescription>
                    </LinkContent>
                </LinkBody>

                <ArrowRight />
            </PlatfomLink>
            <PlatfomLink
                href="https://www.stellarx.com/markets/native/AQUA:GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA"
                target="_blank"
            >
                <LinkBody>
                    <StellarXLogo />
                    <LinkContent>
                        <LinkTitle>Stellarx.com</LinkTitle>
                        <LinkDescription>
                            Trading platform built on the Stellar network.
                        </LinkDescription>
                    </LinkContent>
                </LinkBody>
                <ArrowRight />
            </PlatfomLink>
            <PlatfomLink
                href="https://stellarterm.com/exchange/AQUA-GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA/XLM-native"
                target="_blank"
            >
                <LinkBody>
                    <StellarTermLogo />
                    <LinkContent>
                        <LinkTitle>Stellarterm.com</LinkTitle>
                        <LinkDescription>
                            Light trading client for the Stellar network.
                        </LinkDescription>
                    </LinkContent>
                </LinkBody>
                <ArrowRight />
            </PlatfomLink>
        </TrustedPlatformsBlock>
    </ModalWrapper>
);

export default GetAquaModal;
