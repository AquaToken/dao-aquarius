import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import ErrorHandler from 'helpers/error-handler';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalProps } from 'types/modal';
import { Transaction } from 'types/stellar';

import { ToastService } from 'services/globalServices';
import { respondDown } from 'web/mixins';
import { Breakpoints } from 'web/styles';

import Button from 'basics/buttons/Button';
import ExternalLink from 'basics/ExternalLink';
import { ModalDescription, ModalTitle } from 'basics/ModalAtoms';

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

const ExternalLinkStyled = styled(ExternalLink)`
    margin-top: 1.6rem;
`;

interface RestoreContractModalParams {
    tx: Transaction;
}

const RestoreContractModal = ({ params, close }: ModalProps<RestoreContractModalParams>) => {
    const [pending, setPending] = useState(false);
    const { tx } = params;
    const { account } = useAuthStore();

    const restore = () => {
        setPending(true);
        account
            .signAndSubmitTx(tx)
            .then(() => {
                setPending(false);
                close();
            })
            .catch(e => {
                const errorText = ErrorHandler(e);
                ToastService.showErrorToast(errorText);
                setPending(false);
            });
    };

    return (
        <Container>
            <Title>Contract expired</Title>
            <ModalDescription>
                One or more ledger entries that need to be used in this transactions has expired.
                You need to restore it first.
                <ExternalLinkStyled href="https://stellar.org/blog/developers/not-all-data-is-equal-how-soroban-is-solving-state-bloat-with-state-expiration">
                    Learn more
                </ExternalLinkStyled>
            </ModalDescription>

            <StyledButton onClick={() => restore()} pending={pending}>
                Restore
            </StyledButton>
        </Container>
    );
};

export default RestoreContractModal;
