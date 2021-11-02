import * as React from 'react';
import { ModalDescription, ModalTitle } from '../atoms/ModalAtoms';
import styled from 'styled-components';
import { flexRowSpaceBetween } from '../../mixins';
import { COLORS } from '../../styles';
import ExternalLink from '../../basics/ExternalLink';
import ArrowRight from '../../assets/img/icon-arrow-right.svg';
import LobstrLogo from '../../assets/img/lobstr-name-logo.svg';
import StellarXLogo from '../../assets/img/stellarx-logo.svg';
import StellarTermLogo from '../../assets/img/stellarterm-logo.svg';
import AccountViewer from '../../../AquaGovernance/components/VoteProposalPage/AccountViewer/AccountViewer';
import CopyButton from '../../basics/CopyButton';

const Container = styled.div`
    width: 67.2rem;
`;
const TrustedPlatformsBlock = styled(Container)`
    margin-top: 5.6rem;
`;

const AssetInfo = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 1.4rem;
`;

const GrayText = styled.div`
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.paragraphText};
`;

const BoldText = styled.div`
    font-weight: 700;
    font-size: 1.6rem;
    line-height: 1.9rem;
    margin: 0.5rem 0 0 0;
    color: ${COLORS.titleText};
`;

const InfoRow = styled.div`
    padding: 2rem 0 2.3rem;
    border-bottom: solid 1px rgba(35, 2, 77, 0.1);
`;

const Text = styled.div`
    color: ${COLORS.descriptionText};
    font-size: 1.6rem;
    line-height: 2.9rem;
    margin: 0.8rem 0;
`;

const PlatfomLink = styled.a`
    display: flex;
    align-items: center;
    &:not(:last-child) {
        margin-bottom: 2rem;
    }
    background: ${COLORS.lightGray};
    border-radius: 0.5rem;
    padding: 3rem 2rem 3rem 4rem;

    text-decoration: none;
    transition: 0.2s;
    &:hover {
        background: ${COLORS.white};
        box-shadow: 0 2rem 3rem rgb(0 6 54 / 6%);
    }
`;

const LinkContent = styled.div`
    margin-left: 9.5rem;
    flex: 1;
`;

const LinkTitle = styled(BoldText)`
    margin: 0 0 0.6rem 0;
`;

const LinkDescription = styled(GrayText)`
    line-height: 2.9rem;
`;

const GetAquaModal = (): JSX.Element => {
    return (
        <>
            <Container>
                <ModalTitle>Get aqua token</ModalTitle>
                <ModalDescription>
                    AQUA is the utility token of Aquarius project. You may be eligible to claim free
                    AQUA through the ongoing airdrop program. Currently AQUA is only available on
                    the Stellar DEX.
                </ModalDescription>
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
                            <CopyButton
                                text={'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA'}
                            >
                                <AccountViewer
                                    pubKey={
                                        'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA'
                                    }
                                />
                            </CopyButton>
                        </BoldText>
                    </div>
                </AssetInfo>
                <InfoRow>
                    <ExternalLink
                        href="https://stellar.expert/explorer/public/asset/AQUA-GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA-1"
                        target="_blank"
                    >
                        View on Network Explorer
                    </ExternalLink>
                    <Text>
                        Make sure the home domain is &quot;aqua.network&quot; when you add AQUA.
                    </Text>
                </InfoRow>
                <InfoRow>
                    <Text>
                        If you used Stellar DEX previously you may be eligible to claim some AQUA.
                    </Text>
                    <ExternalLink href="https://airdrop.aqua.network/" target="_blank">
                        Learn more
                    </ExternalLink>
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
                    <LobstrLogo />
                    <LinkContent>
                        <LinkTitle>Lobstr.co</LinkTitle>
                        <LinkDescription>
                            Trading platform built on the Stellar network.
                        </LinkDescription>
                    </LinkContent>
                    <ArrowRight />
                </PlatfomLink>
                <PlatfomLink
                    href="https://www.stellarx.com/markets/native/AQUA:GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA"
                    target="_blank"
                >
                    <StellarXLogo />
                    <LinkContent>
                        <LinkTitle>Stellarx.com</LinkTitle>
                        <LinkDescription>
                            Trading platform built on the Stellar network.
                        </LinkDescription>
                    </LinkContent>
                    <ArrowRight />
                </PlatfomLink>
                <PlatfomLink
                    href="https://stellarterm.com/exchange/AQUA-GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA/XLM-native"
                    target="_blank"
                >
                    <StellarTermLogo />
                    <LinkContent>
                        <LinkTitle>Stellarterm.com</LinkTitle>
                        <LinkDescription>
                            Light trading client for the Stellar network.
                        </LinkDescription>
                    </LinkContent>
                    <ArrowRight />
                </PlatfomLink>
            </TrustedPlatformsBlock>
        </>
    );
};

export default GetAquaModal;