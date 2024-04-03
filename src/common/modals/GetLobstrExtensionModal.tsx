import * as React from 'react';
import styled from 'styled-components';
import { respondDown } from '../mixins';
import { Breakpoints } from '../styles';
import { ModalDescription, ModalTitle } from './atoms/ModalAtoms';
import ExternalLink from '../basics/ExternalLink';

import Logo from '../assets/img/lobstr-logo-color.svg';

const Container = styled.div`
    width: 52.8rem;
    display: flex;
    flex-direction: column;

    ${respondDown(Breakpoints.md)`
          width: 100%;
      `}
`;

const Lobstr = styled(Logo)`
    height: 4.5rem;
    width: 4.5rem;
    margin-bottom: 2.4rem;
`;

const GetLobstrExtensionModal = () => {
    return (
        <Container>
            <Lobstr />
            <ModalTitle>Install LOBSTR | Signer extension</ModalTitle>
            <ModalDescription>Don’t have the LOBSTR | Signer extension installed?</ModalDescription>

            <ExternalLink>Get it on Chrome Web Store</ExternalLink>
        </Container>
    );
};

export default GetLobstrExtensionModal;
