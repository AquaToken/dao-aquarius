import * as React from 'react';
import { ModalDescription, ModalProps, ModalTitle } from '../atoms/ModalAtoms';
import AquaLogo from '../../assets/img/aqua-logo-small.svg';
import ArrowsIcon from '../../assets/img/icon-arrows-circle.svg';
import styled from 'styled-components';
import { flexAllCenter } from '../../mixins';
import { COLORS } from '../../styles';
import DotsLoader from '../../basics/DotsLoader';

const IconsBlock = styled.div`
    ${flexAllCenter};
    margin: 8rem 0 3.2rem;
`;

const Arrows = styled(ArrowsIcon)`
    margin: 0 4rem;
`;

const AppLogo = styled.img`
    height: 8.8rem;
    width: 8.8rem;
`;

const Connecting = styled.div`
    ${flexAllCenter};
    color: ${COLORS.grayText};
    margin-bottom: 4rem;
`;

const SessionRequestModal = ({
    params,
}: ModalProps<{ icon: string; name: string }>): JSX.Element => {
    const { icon, name } = params;
    return (
        <>
            <ModalTitle>Connecting</ModalTitle>
            <ModalDescription>
                The connection request was sent to {name}. Confirm the request
                <br />
                in the app and continue with Aqua Vote.
            </ModalDescription>
            <IconsBlock>
                <AquaLogo />
                <Arrows />
                <AppLogo src={icon} alt={name} />
            </IconsBlock>

            <Connecting>
                Connecting
                <DotsLoader />
            </Connecting>
        </>
    );
};

export default SessionRequestModal;
