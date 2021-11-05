import * as React from 'react';
import {
    ModalDescription,
    ModalProps,
    ModalTitle,
} from '../../../../common/modals/atoms/ModalAtoms';
import styled from 'styled-components';
import Button from '../../../../common/basics/Button';
import { flexRowSpaceBetween } from '../../../../common/mixins';
import { Proposal } from '../../../api/types';

const MINIMUM_AMOUNT_AQUA_FOR_PAY = 100000;

const ProposalCost = styled.div`
    ${flexRowSpaceBetween};
    font-size: 1.6rem;
    padding-bottom: 2.6rem;
    width: 52.8rem;
    margin-bottom: 2.4rem;
    border-bottom: 1px dashed #e8e8ed;
`;

const Label = styled.div`
    line-height: 2.8rem;
    color: #6b6c83;
`;

const Amount = styled.div`
    line-height: 2.8rem;
    text-align: right;
    color: #000636;
`;

const ConfirmCreateProposalModal = ({ params }: ModalProps<Proposal>): JSX.Element => {
    const minCost = new Intl.NumberFormat('en-US').format(MINIMUM_AMOUNT_AQUA_FOR_PAY);
    return (
        <>
            <ModalTitle>Create proposal</ModalTitle>
            <ModalDescription>
                To create a proposal, you need to pay {minCost} AQUA.
            </ModalDescription>
            <ProposalCost>
                <Label>Proposal cost</Label>
                <Amount>{minCost} AQUA</Amount>
            </ProposalCost>
            <Button
                isBig
                fullWidth
                onClick={() => {
                    console.log('CONFIRM', params);
                }}
            >
                Confirm
            </Button>
        </>
    );
};

export default ConfirmCreateProposalModal;
