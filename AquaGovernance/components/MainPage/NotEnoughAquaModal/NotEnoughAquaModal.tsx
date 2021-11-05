import * as React from 'react';
import { ModalDescription, ModalTitle } from '../../../../common/modals/atoms/ModalAtoms';
import styled from 'styled-components';
import Button from '../../../../common/basics/Button';
import { ModalService } from '../../../../common/services/globalServices';
import GetAquaModal from '../../../../common/modals/GetAquaModal/GetAquaModal';

const StyledButton = styled(Button)`
    margin-top: 7.2rem;
    margin-left: auto;
`;

const BoldText = styled.span`
    font-weight: bold;
`;

const NotEnoughAquaModal = (): JSX.Element => (
    <>
        <ModalTitle>Not enough AQUA</ModalTitle>
        <ModalDescription>
            To create a proposal, you must have at least <BoldText>1,000,000 AQUA</BoldText> in your
            stellar account.
        </ModalDescription>
        <StyledButton
            onClick={() => {
                ModalService.closeAllModals();
                ModalService.openModal(GetAquaModal, {});
            }}
        >
            Get AQUA
        </StyledButton>
    </>
);

export default NotEnoughAquaModal;
