import * as React from 'react';
import { PairingTypes } from '@walletconnect/types';
import { ModalDescription, ModalProps, ModalTitle } from '../atoms/ModalAtoms';
import { useState } from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../styles';
import IconCloseSmall from '../../assets/img/icon-close-small.svg';
import IconPlus from '../../assets/img/icon-plus.svg';
import { respondDown } from '../../mixins';

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

    &:not(:last-child) {
        margin-bottom: 1.6rem;
    }

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        align-items: start;
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

const DeleteButton = styled(IconCloseSmall)`
    margin-left: auto;
    cursor: pointer;
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

    const handleDeletePairing = (event: MouseEvent, topic: string): void => {
        event.stopPropagation();
        deletePairing(topic).then(() => {
            setCurrentPairings(currentPairings.filter((pairing) => pairing.topic !== topic));
        });
    };

    return (
        <ModalBlock>
            <ModalTitle>Logged in before?</ModalTitle>
            <ModalDescription>Restore your connection or create a new one.</ModalDescription>
            {currentPairings.map((pairing, index) => (
                <PairingBlock key={pairing.topic} onClick={() => connect(pairing)}>
                    <AppIcon src={pairing.state.metadata.icons[0]} alt="" />

                    <AppInfoBlock>
                        <AppName>
                            {pairing.state.metadata.name}
                            {currentPairings.length > 1 && index === 0 && (
                                <LatestAdded>latest added</LatestAdded>
                            )}
                        </AppName>
                        <AppDescription>{pairing.state.metadata.description}</AppDescription>
                    </AppInfoBlock>

                    <DeleteButton onClick={(e) => handleDeletePairing(e, pairing.topic)} />
                </PairingBlock>
            ))}

            <NewConnectionButton onClick={() => connect()}>
                <span>Add new connection</span>
                <NewConnectionButtonIcon />
            </NewConnectionButton>
        </ModalBlock>
    );
};

export default PairingModal;
