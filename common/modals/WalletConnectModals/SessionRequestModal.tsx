import * as React from 'react';
import { ModalDescription, ModalProps, ModalTitle } from '../atoms/ModalAtoms';
import Aqua from '../../assets/img/aqua-logo-small.svg';
import ArrowsIcon from '../../assets/img/icon-arrows-circle.svg';
import styled, { css } from 'styled-components';
import { flexAllCenter, respondDown } from '../../mixins';
import { Breakpoints, COLORS } from '../../styles';
import DotsLoader from '../../basics/DotsLoader';
import { WalletConnectService } from '../../services/globalServices';

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
}: ModalProps<{ icon: string; name: string }>): JSX.Element => {
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
