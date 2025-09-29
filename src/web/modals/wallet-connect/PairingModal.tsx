import * as WalletConnect from '@walletconnect/types';
import { useState } from 'react';
import * as React from 'react';
import styled from 'styled-components';

import { getWalletFromDeepLinkHistory, saveCurrentWallet } from 'helpers/wallet-connect-helpers';

import { ModalProps } from 'types/modal';

import IconArrowRight from 'assets/icons/arrows/arrow-right-16.svg';
import IconCloseSmall from 'assets/icons/nav/icon-close-alt-16.svg';
import IconPlus from 'assets/icons/nav/icon-plus-16.svg';
import IconDeepLink from 'assets/icons/small-icons/icon-deep-link-10.svg';
import IconQR from 'assets/icons/small-icons/icon-qr-8.svg';

import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import { flexAllCenter, respondDown } from '../../mixins';
import { Breakpoints, COLORS } from '../../styles';

type PairingModalParams = {
    pairings: WalletConnect.PairingTypes.Struct[];
    deletePairing: (topic: string) => Promise<void>;
    connect: (pairing?: WalletConnect.PairingTypes.Struct) => Promise<void>;
};

const PairingBlock = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: ${COLORS.gray50};
    border-radius: 0.5rem;
    padding: 2.1rem 2.4rem;
    cursor: pointer;
    position: relative;

    &:not(:last-child) {
        margin-bottom: 1.6rem;
    }

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        align-items: start;
        justify-content: center;
    `}
`;

const AppIconWeb = styled.img`
    height: 4.8rem;
    width: 4.8rem;
    margin-right: 3.1rem;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const AppIconMobileWrap = styled.div`
    display: none;
    position: relative;

    ${respondDown(Breakpoints.md)`
          display: inline;
     `}
`;

const AppIconMobile = styled.img`
    height: 2.4rem;
    width: 2.4rem;
    margin-right: 0.8rem;
`;

const LoginFlowIconWrap = styled.div`
    position: absolute;
    height: 1.6rem;
    width: 1.6rem;
    border-radius: 50%;
    background-color: ${COLORS.gray50};
    ${flexAllCenter};
    bottom: 0;
    right: 0;
`;

const AppInfoBlock = styled.div`
    display: flex;
    flex-direction: column;
`;

const AppNameWrap = styled.div`
    display: flex;
    width: min-content;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textTertiary};
`;

const AppName = styled.div`
    position: relative;
    width: min-content;
    height: 2.8rem;
    white-space: nowrap;
`;

const LatestAdded = styled.div`
    position: absolute;
    left: calc(100% + 0.5rem);
    top: -0.5rem;
    height: 1.8rem;
    padding: 0 0.6rem;
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.1rem;
    line-height: 2rem;
    text-transform: uppercase;
    text-align: center;
    color: ${COLORS.white};
    background-color: ${COLORS.purple400};
    border-radius: 0.5rem;
    white-space: nowrap;

    ${respondDown(Breakpoints.md)`
        top: 50%;
        transform: translate(0, -50%);
    `}
`;

const AppDescription = styled.span`
    color: ${COLORS.textGray};
    word-break: break-word;
    padding-right: 1.6rem;
`;

const ConnectButton = styled.div`
    display: none;
    color: ${COLORS.purple500};
    font-weight: 400;
    font-size: 1.4rem;
    line-height: 2rem;
    margin-top: 1.6rem;
    align-items: center;

    svg {
        margin-left: 0.8rem;
    }

    ${respondDown(Breakpoints.md)`
         display: flex;
    `}
`;

const DeleteButtonWeb = styled(IconCloseSmall)`
    margin-left: auto;
    cursor: pointer;
    min-width: 1.6rem;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const DeleteButtonMobile = styled.div`
    margin-left: auto;
    cursor: pointer;
    height: 3rem;
    width: 3rem;
    ${flexAllCenter};
    position: absolute;
    top: 1.4rem;
    right: 1.7rem;
    display: none;

    ${respondDown(Breakpoints.md)`
        display: flex;
    `}
`;

const NewConnectionButton = styled.div`
    align-items: center;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.purple500};
    cursor: pointer;
`;

const NewConnectionButtonWeb = styled(NewConnectionButton)`
    display: flex;
    margin-top: 3.2rem;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const NewConnectionButtonMobile = styled(NewConnectionButton)`
    display: none;
    margin-top: 1.6rem;
    margin-bottom: 2.4rem;

    ${respondDown(Breakpoints.md)`
        display: flex;
    `}
`;

const NewConnectionButtonIcon = styled(IconPlus)`
    margin-left: 0.8rem;
`;

const IconArrowRightStyled = styled(IconArrowRight)`
    path {
        fill: ${COLORS.purple400};
    }
`;

const PairingModal = ({ params }: ModalProps<PairingModalParams>): React.ReactNode => {
    const { pairings, deletePairing, connect } = params;

    const [currentPairings, setCurrentPairings] = useState(pairings);

    const handleDeletePairing = (event: MouseEvent | React.MouseEvent, topic: string): void => {
        event.stopPropagation();
        deletePairing(topic).then(() => {
            setCurrentPairings(currentPairings.filter(pairing => pairing.topic !== topic));
        });
    };

    return (
        <ModalWrapper>
            <ModalTitle>Logged in before?</ModalTitle>
            <ModalDescription>Restore your connection or create a new one.</ModalDescription>
            <NewConnectionButtonMobile onClick={() => connect()}>
                <span>Add new connection</span>
                <NewConnectionButtonIcon />
            </NewConnectionButtonMobile>
            {currentPairings.map((pairing, index) => {
                const wallet = getWalletFromDeepLinkHistory(pairing.topic);
                const metadata = pairing.peerMetadata;
                return (
                    <PairingBlock
                        key={pairing.topic}
                        onClick={async () => {
                            if (wallet) {
                                saveCurrentWallet(wallet.name, wallet.uri);
                                window.open(wallet.uri, '_blank');
                            }
                            await connect(pairing);
                        }}
                    >
                        <DeleteButtonMobile
                            onClick={(e: React.MouseEvent) => handleDeletePairing(e, pairing.topic)}
                        >
                            <IconCloseSmall />
                        </DeleteButtonMobile>
                        <AppIconWeb src={metadata.icons[0]} alt="" />

                        <AppInfoBlock>
                            <AppNameWrap>
                                <AppIconMobileWrap>
                                    <AppIconMobile src={metadata.icons[0]} alt="" />
                                    <LoginFlowIconWrap>
                                        {wallet ? <IconDeepLink /> : <IconQR />}
                                    </LoginFlowIconWrap>
                                </AppIconMobileWrap>

                                <AppName>
                                    <span>{metadata.name}</span>
                                    {currentPairings.length > 1 && index === 0 && (
                                        <LatestAdded>latest added</LatestAdded>
                                    )}
                                </AppName>
                            </AppNameWrap>
                            <AppDescription>{metadata.description}</AppDescription>
                            <ConnectButton>
                                <span>Connect</span>
                                <IconArrowRightStyled />
                            </ConnectButton>
                        </AppInfoBlock>

                        <DeleteButtonWeb
                            onClick={(e: React.MouseEvent) => handleDeletePairing(e, pairing.topic)}
                        />
                    </PairingBlock>
                );
            })}
            <NewConnectionButtonWeb onClick={() => connect()}>
                <span>Add new connection</span>
                <NewConnectionButtonIcon />
            </NewConnectionButtonWeb>
        </ModalWrapper>
    );
};

export default PairingModal;
