import * as React from 'react';
import styled from 'styled-components';

import { formatBalance } from 'helpers/format-number';

import { ModalService } from 'services/globalServices';

import { ModalProps } from 'types/modal';

import GetAquaModal from 'web/modals/GetAquaModal';

import Button from 'basics/buttons/Button';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import { respondDown } from 'styles/mixins';
import { Breakpoints } from 'styles/style-constants';

const StyledButton = styled(Button)`
    margin-top: 7.2rem;
    margin-left: auto;

    ${respondDown(Breakpoints.md)`
         min-width: 100%;
         margin-left: 0;
    `}
`;

const BoldText = styled.span`
    font-weight: bold;
`;

interface NotEnoughAquaModalParams {
    cost: number;
}

const NotEnoughAquaModal = ({
    close,
    params,
}: ModalProps<NotEnoughAquaModalParams>): React.ReactNode => {
    const { cost } = params;

    return (
        <ModalWrapper>
            <ModalTitle>Not enough AQUA</ModalTitle>
            <ModalDescription>
                To create a proposal, you must have at least{' '}
                <BoldText>{formatBalance(cost)} AQUA</BoldText> in your stellar account.
            </ModalDescription>
            <StyledButton
                onClick={() => {
                    close();
                    ModalService.openModal(GetAquaModal, {});
                }}
            >
                Get AQUA
            </StyledButton>
        </ModalWrapper>
    );
};

export default NotEnoughAquaModal;
