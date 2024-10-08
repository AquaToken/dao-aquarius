import * as React from 'react';
import styled, { css } from 'styled-components';

import { ModalProps } from 'types/modal';

import { WalletConnectService } from 'services/globalServices';

import Aqua from 'assets/aqua-logo-small.svg';
import ArrowsIcon from 'assets/icon-arrows-circle.svg';

import DotsLoader from 'basics/loaders/DotsLoader';
import { ModalDescription, ModalTitle } from 'basics/ModalAtoms';

import { flexAllCenter, respondDown } from '../../mixins';
import { Breakpoints, COLORS } from '../../styles';

const Container = styled.div`
    width: 52.3rem;

    ${respondDown(Breakpoints.md)`
          width: 100%;
      `}
`;

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
    color: ${COLORS.grayText};
    margin-bottom: 4rem;
`;

const SessionRequestModal = ({
    params,
}: ModalProps<{ icon: string; name: string }>): React.ReactNode => {
    const { icon, name } = params;
    return (
        <Container>
            <ModalTitle>Connecting</ModalTitle>
            <ModalDescription>
                The connection request was sent to {name}. Confirm the request in the app and
                continue with {WalletConnectService.selfMeta.name}.
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
        </Container>
    );
};

export default SessionRequestModal;
