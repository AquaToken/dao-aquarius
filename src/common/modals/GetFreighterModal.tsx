import * as React from 'react';
import styled from 'styled-components';

import { respondDown } from 'web/mixins';
import { Breakpoints } from 'web/styles';

import Logo from 'assets/freighter-logo.svg';

import ExternalLink from 'basics/ExternalLink';

import { ModalDescription, ModalTitle } from './atoms/ModalAtoms';

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

const GetFreighterModal = () => (
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

export default GetFreighterModal;
