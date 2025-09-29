import * as React from 'react';
import styled, { css } from 'styled-components';

import { AuthService } from 'services/globalServices';

import { ModalProps } from 'types/modal';

import { flexAllCenter } from 'web/mixins';
import { COLORS } from 'web/styles';

import Aqua from 'assets/aqua/aqua-logo.svg';
import ArrowsIcon from 'assets/icons/arrows/arrows-circle-16.svg';

import DotsLoader from 'basics/loaders/DotsLoader';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

const IconsBlock = styled.div`
    ${flexAllCenter};
    margin: 8rem 0 3.2rem;
`;

const Arrows = styled(ArrowsIcon)`
    margin: 0 4rem;
`;

const iconSize = css`
    height: 8.8rem;
    width: 8.8rem;
`;

const AquaLogo = styled(Aqua)`
    ${iconSize};
`;

const AppLogo = styled.img`
    ${iconSize};
`;

const Connecting = styled.div`
    ${flexAllCenter};
    color: ${COLORS.textGray};
    margin-bottom: 4rem;
`;

const SessionRequestModal = ({
    params,
}: ModalProps<{ icon: string; name: string }>): React.ReactNode => {
    const { icon, name } = params;

    return (
        <ModalWrapper>
            <ModalTitle>Connecting</ModalTitle>
            <ModalDescription>
                The connection request was sent to {name}. Confirm the request in the app and
                continue with {AuthService.walletConnect.selfMeta.name}.
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
        </ModalWrapper>
    );
};

export default SessionRequestModal;
