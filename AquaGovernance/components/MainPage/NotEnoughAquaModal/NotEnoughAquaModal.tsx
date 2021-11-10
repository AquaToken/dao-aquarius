import * as React from 'react';
import { ModalDescription, ModalTitle } from '../../../../common/modals/atoms/ModalAtoms';
import styled from 'styled-components';
import Button from '../../../../common/basics/Button';
import { ModalService } from '../../../../common/services/globalServices';
import GetAquaModal from '../../../../common/modals/GetAquaModal/GetAquaModal';
import { CREATE_PROPOSAL_COST } from '../MainPage';
import { formatBalance } from '../../../../common/helpers/helpers';

const StyledButton = styled(Button)`
    margin-top: 7.2rem;
    margin-left: auto;
`;

const BoldText = styled.span`
    font-weight: bold;
`;

const NotEnoughAquaModal = ({ close }): JSX.Element => (
    <>
        <ModalTitle>Not enough AQUA</ModalTitle>
        <ModalDescription>
            To create a proposal, you must have at least{' '}
            <BoldText>{formatBalance(CREATE_PROPOSAL_COST)} AQUA</BoldText> in your stellar account.
        </ModalDescription>
        <StyledButton
            onClick={() => {
                close();
                ModalService.openModal(GetAquaModal, {});
            }}
        >
            Get AQUA
        </StyledButton>
    </>
);

export default NotEnoughAquaModal;
