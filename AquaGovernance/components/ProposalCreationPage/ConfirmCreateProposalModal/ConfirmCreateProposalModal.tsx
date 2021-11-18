import * as React from 'react';
import { useState } from 'react';
import {
    ModalDescription,
    ModalProps,
    ModalTitle,
} from '../../../../common/modals/atoms/ModalAtoms';
import styled from 'styled-components';
import Button from '../../../../common/basics/Button';
import { flexRowSpaceBetween } from '../../../../common/mixins';
import { Proposal } from '../../../api/types';
import { formatBalance } from '../../../../common/helpers/helpers';
import { CREATE_PROPOSAL_COST } from '../../MainPage/MainPage';
import { StellarService, ToastService } from '../../../../common/services/globalServices';
import { MemoHash } from 'stellar-base';
import { sha256 } from 'js-sha256';
import useAuthStore from '../../../../common/store/authStore/useAuthStore';
import { useIsMounted } from '../../../../common/hooks/useIsMounted';
import { createProposal } from '../../../api/api';
import { Horizon } from 'stellar-sdk';
import { useHistory } from 'react-router-dom';
import { MAX_DURATION_VOTING, MIN_DURATION_VOTING } from '../ProposalCreationPage';

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

const ConfirmCreateProposalModal = ({ params, close }: ModalProps<Proposal>): JSX.Element => {
    const [loading, setLoading] = useState(false);
    const { account } = useAuthStore();
    const cost = formatBalance(CREATE_PROPOSAL_COST);

    const history = useHistory();

    const isMounted = useIsMounted();

    const onSubmit = async () => {
        const { text, title, start_at, end_at } = params;
        //subtract 1 hour from time to give the user to think
        const minEndDateTimeStamp = Date.now() + (MIN_DURATION_VOTING - 60 * 60 * 1000);
        const maxEndDateTimeStamp = Date.now() + MAX_DURATION_VOTING;

        if (loading) {
            return;
        }

        if (
            minEndDateTimeStamp > new Date(end_at).getTime() ||
            new Date(end_at).getTime() > maxEndDateTimeStamp
        ) {
            ToastService.showErrorToast('The duration of voting must be between 3 and 7 days!');
            return;
        }

        setLoading(true);

        try {
            const op = StellarService.createBurnAquaOperation(CREATE_PROPOSAL_COST.toString());
            const hash = sha256(text);
            const memoHash = StellarService.createMemo(MemoHash, hash);

            const tx = await StellarService.buildTx(account, op, memoHash);

            const signed = await account.signAndSubmitTx(tx, true);

            await createProposal({
                proposed_by: account.accountId(),
                title,
                text,
                start_at,
                end_at,
                transaction_hash: (signed as Horizon.SubmitTransactionResponse).hash,
            });

            close();

            ToastService.showSuccessToast('The proposal has been created');

            history.push('/');
        } catch (e) {
            ToastService.showErrorToast('The proposal has not been created');
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    return (
        <>
            <ModalTitle>Create proposal</ModalTitle>
            <ModalDescription>To create a proposal, you need to pay {cost} AQUA.</ModalDescription>
            <ProposalCost>
                <Label>Proposal cost</Label>
                <Amount>{cost} AQUA</Amount>
            </ProposalCost>
            <Button
                isBig
                fullWidth
                pending={loading}
                onClick={() => {
                    onSubmit();
                }}
            >
                Confirm
            </Button>
        </>
    );
};

export default ConfirmCreateProposalModal;
