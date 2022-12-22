import * as React from 'react';
import { useState } from 'react';
import { PairingTypes } from '@walletconnect/types';
import { ModalDescription, ModalProps, ModalTitle } from '../atoms/ModalAtoms';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../styles';
import IconCloseSmall from '../../assets/img/icon-close-small.svg';
import IconPlus from '../../assets/img/icon-plus.svg';
import IconQR from '../../assets/img/icon-qr.svg';
import IconDeepLink from '../../assets/img/icon-deep-link.svg';
import IconArrowRight from '../../assets/img/icon-arrow-right-purple.svg';
import { flexAllCenter, respondDown } from '../../mixins';
import { getAppFromDeepLinkList, saveAppToLS } from '../../services/wallet-connect.service';

type PairingModalParams = {
    pairings: PairingTypes.Struct[];
    deletePairing: (topic: string) => Promise<void>;
    connect: (pairing?: PairingTypes.Struct) => Promise<void>;
};

const ModalBlock = styled.div`
    width: 52.3rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const PairingBlock = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: ${COLORS.lightGray};
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
    background-color: ${COLORS.lightGray};
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
    color: ${COLORS.paragraphText};
`;

const AppName = styled.div`
    position: relative;
    width: min-content;
    height: 2.8rem;
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
    background-color: ${COLORS.tooltip};
    border-radius: 0.5rem;
    white-space: nowrap;

    ${respondDown(Breakpoints.md)`
        top: 50%;
        transform: translate(0, -50%);
    `}
`;

const AppDescription = styled.span`
    color: ${COLORS.grayText};
    word-break: break-word;
    padding-right: 1.6rem;
`;

const ConnectButton = styled.div`
    display: none;
    color: ${COLORS.purple};
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
    color: ${COLORS.purple};
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

const PairingModal = ({ params }: ModalProps<PairingModalParams>): JSX.Element => {
    const { pairings, deletePairing, connect } = params;

    const [currentPairings, setCurrentPairings] = useState(pairings);

    const handleDeletePairing = (
        event: MouseEvent | React.MouseEvent<HTMLDivElement>,
        topic: string,
    ): void => {
        event.stopPropagation();
        deletePairing(topic).then(() => {
            setCurrentPairings(currentPairings.filter((pairing) => pairing.topic !== topic));
        });
    };

    return (
        <ModalBlock>
            <ModalTitle>Logged in before?</ModalTitle>
            <ModalDescription>Restore your connection or create a new one.</ModalDescription>
            <NewConnectionButtonMobile onClick={() => connect()}>
                <span>Add new connection</span>
                <NewConnectionButtonIcon />
            </NewConnectionButtonMobile>
            {currentPairings.map((pairing, index) => {
                const app = getAppFromDeepLinkList(pairing.topic);
                const metadata = pairing.peerMetadata;
                return (
                    <PairingBlock
                        key={pairing.topic}
                        onClick={() => {
                            if (app) {
                                saveAppToLS(app.name, app.uri);
                                window.open(app.uri, '_blank');
                            }
                            connect(pairing);
                        }}
                    >
                        <DeleteButtonMobile onClick={(e) => handleDeletePairing(e, pairing.topic)}>
                            <IconCloseSmall />
                        </DeleteButtonMobile>
                        <AppIconWeb src={metadata.icons[0]} alt="" />

                        <AppInfoBlock>
                            <AppNameWrap>
                                <AppIconMobileWrap>
                                    <AppIconMobile src={metadata.icons[0]} alt="" />
                                    <LoginFlowIconWrap>
                                        {Boolean(app) ? <IconDeepLink /> : <IconQR />}
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
                                <IconArrowRight />
                            </ConnectButton>
                        </AppInfoBlock>

                        <DeleteButtonWeb onClick={(e) => handleDeletePairing(e, pairing.topic)} />
                    </PairingBlock>
                );
            })}
            <NewConnectionButtonWeb onClick={() => connect()}>
                <span>Add new connection</span>
                <NewConnectionButtonIcon />
            </NewConnectionButtonWeb>
        </ModalBlock>
    );
};

export default PairingModal;
