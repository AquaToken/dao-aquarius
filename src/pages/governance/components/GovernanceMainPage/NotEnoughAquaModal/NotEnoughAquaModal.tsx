import * as React from 'react';
import { ModalDescription, ModalTitle } from '../../../../../common/modals/atoms/ModalAtoms';
import styled from 'styled-components';
import Button from '../../../../../common/basics/Button';
import { ModalService } from '../../../../../common/services/globalServices';
import GetAquaModal from '../../../../../common/modals/GetAquaModal/GetAquaModal';
import { formatBalance } from '../../../../../common/helpers/helpers';
import { respondDown } from '../../../../../common/mixins';
import { Breakpoints } from '../../../../../common/styles';

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

const NotEnoughAquaModal = ({ close, params }): JSX.Element => {
    const { cost } = params;
    return (
        <>
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
        </>
    );
};

export default NotEnoughAquaModal;
