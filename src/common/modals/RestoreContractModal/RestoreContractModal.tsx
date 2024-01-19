import * as React from 'react';
import styled from 'styled-components';
import { respondDown } from '../../mixins';
import { Breakpoints } from '../../styles';
import { ModalDescription, ModalTitle } from '../atoms/ModalAtoms';
import Button from '../../basics/Button';
import useAuthStore from '../../../store/authStore/useAuthStore';
import { useState } from 'react';

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

const RestoreContractModal = ({ params, close }) => {
    const [pending, setPending] = useState(false);
    const { tx } = params;
    const { account } = useAuthStore();

    const restore = () => {
        setPending(true);
        account.signAndSubmitTx(tx).then(() => {
            setPending(false);
            close();
        });
    };

    return (
        <Container>
            <Title>Some of the contracts expired</Title>
            <ModalDescription>
                You can restore the contract by signing the transaction.
            </ModalDescription>
            <StyledButton onClick={() => restore()} pending={pending}>
                Restore
            </StyledButton>
        </Container>
    );
};

export default RestoreContractModal;
