import * as React from 'react';
import styled from 'styled-components';

import { ModalProps } from 'types/modal';

import Vault from 'assets/vault.svg';

import Button from 'basics/buttons/Button';
import { ModalDescription, ModalTitle } from 'basics/ModalAtoms';

import { respondDown } from '../mixins';
import { Breakpoints } from '../styles';

const Container = styled.div`
    width: 52.3rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const Title = styled(ModalTitle)`
    margin-top: 2.4rem;
`;

const StyledButton = styled(Button)`
    margin-top: 3.1rem;
    margin-left: auto;

    ${respondDown(Breakpoints.md)`
            width: 100%;
        `}
`;

const SentToVault = ({ close }: ModalProps<never>) => (
    <Container>
        <Vault />
        <Title>More signatures required</Title>
        <ModalDescription>Transaction has been sent to your Lobstr Vault</ModalDescription>
        <StyledButton onClick={() => close()}>Close</StyledButton>
    </Container>
);

export default SentToVault;
