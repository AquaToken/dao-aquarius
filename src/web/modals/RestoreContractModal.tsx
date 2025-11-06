import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import ErrorHandler from 'helpers/error-handler';

import useAuthStore from 'store/authStore/useAuthStore';

import { ToastService } from 'services/globalServices';

import { ModalProps } from 'types/modal';
import { Transaction } from 'types/stellar';

import Button from 'basics/buttons/Button';
import { ExternalLink } from 'basics/links';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import { respondDown } from 'styles/mixins';
import { Breakpoints } from 'styles/style-constants';

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
            .signAndSubmitTx(tx, true)
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
        <ModalWrapper>
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
        </ModalWrapper>
    );
};

export default RestoreContractModal;
