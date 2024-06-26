import * as React from 'react';
import styled from 'styled-components';
import { respondDown } from '../mixins';
import { Breakpoints } from '../styles';
import { ModalDescription, ModalTitle } from './atoms/ModalAtoms';
import ExternalLink from '../basics/ExternalLink';

import Logo from '../assets/img/freighter-logo.svg';

const Container = styled.div`
    width: 52.8rem;
    display: flex;
    flex-direction: column;

    ${respondDown(Breakpoints.md)`
          width: 100%;
      `}
`;

const Freighter = styled(Logo)`
    height: 4.5rem;
    width: 4.5rem;
    margin-bottom: 2.4rem;
`;

const GetFreighterModal = () => {
    return (
        <Container>
            <Freighter />
            <ModalTitle>Install Freighter extension</ModalTitle>
            <ModalDescription>
                Freighter is a non-custodial wallet extension for your browser. You can install the
                extension from the web store.
            </ModalDescription>

            <ExternalLink href="https://www.freighter.app/">Install Freighter</ExternalLink>
        </Container>
    );
};

export default GetFreighterModal;
