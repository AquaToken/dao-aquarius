import * as React from 'react';
import { useState } from 'react';
import { PairingTypes } from '@walletconnect/types';
import { ModalDescription, ModalProps, ModalTitle } from '../atoms/ModalAtoms';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../styles';
import IconCloseSmall from '../../assets/img/icon-close-small.svg';
import IconPlus from '../../assets/img/icon-plus.svg';
import { flexAllCenter, respondDown } from '../../mixins';
import { getAppFromDeepLinkList, saveAppToLS } from '../../services/wallet-connect.service';

type PairingModalParams = {
    pairings: PairingTypes.Settled[];
    deletePairing: (topic: string) => Promise<void>;
    connect: (pairing?: PairingTypes.Settled) => Promise<void>;
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

const AppIcon = styled.img`
    height: 4.8rem;
    width: 4.8rem;
    margin-right: 3.1rem;

    ${respondDown(Breakpoints.md)`
        margin-bottom: 1.2rem;
    `}
`;

const AppInfoBlock = styled.div`
    display: flex;
    flex-direction: column;
`;

const AppName = styled.div`
    width: min-content;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
    position: relative;
`;

const LatestAdded = styled.div`
    position: absolute;
    left: calc(100% + 0.5rem);
    top: -0.2rem;
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
`;

const AppDescription = styled.span`
    color: ${COLORS.grayText};
`;

const DeleteButtonWeb = styled(IconCloseSmall)`
    margin-left: auto;
    cursor: pointer;

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
    display: flex;
    align-items: center;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.purple};
    cursor: pointer;
    margin-top: 3.2rem;
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
            {currentPairings.map((pairing, index) => {
                const app = getAppFromDeepLinkList(pairing.topic);
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
                        <AppIcon src={pairing.state.metadata.icons[0]} alt="" />

                        <AppInfoBlock>
                            <AppName>
                                {pairing.state.metadata.name}
                                {currentPairings.length > 1 && index === 0 && (
                                    <LatestAdded>latest added</LatestAdded>
                                )}
                                {Boolean(app) && <LatestAdded>Deep link</LatestAdded>}
                            </AppName>
                            <AppDescription>{pairing.state.metadata.description}</AppDescription>
                        </AppInfoBlock>

                        <DeleteButtonWeb onClick={(e) => handleDeletePairing(e, pairing.topic)} />
                    </PairingBlock>
                );
            })}

            <NewConnectionButton onClick={() => connect()}>
                <span>Add new connection</span>
                <NewConnectionButtonIcon />
            </NewConnectionButton>
        </ModalBlock>
    );
};

export default PairingModal;
