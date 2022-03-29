import * as React from 'react';
import { useState } from 'react';
import {
    ModalDescription,
    ModalProps,
    ModalTitle,
} from '../../../../common/modals/atoms/ModalAtoms';
import styled from 'styled-components';
import Button from '../../../../common/basics/Button';
import { flexRowSpaceBetween, respondDown } from '../../../../common/mixins';
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
import { Breakpoints } from '../../../../common/styles';
import { LoginTypes } from '../../../../common/store/authStore/types';
import { openApp } from '../../../../common/services/wallet-connect.service';

const ProposalCost = styled.div`
    ${flexRowSpaceBetween};
    font-size: 1.6rem;
    padding-bottom: 2.6rem;
    width: 52.8rem;
    margin-bottom: 2.4rem;
    border-bottom: 1px dashed #e8e8ed;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const Description = styled(ModalDescription)`
    width: 52.8rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
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
    const reward = formatBalance(CREATE_PROPOSAL_COST * 1.5);

    const history = useHistory();

    const isMounted = useIsMounted();

    const onSubmit = async () => {
        const { text, title, start_at, end_at } = params;

        if (loading) {
            return;
        }

        if (account.authType === LoginTypes.walletConnect) {
            openApp();
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
            <Description>
                Please make sure your proposal is clear, well written and follows the suggested
                format. Before you submit the proposal, we recommend sharing it on Discord to get
                the feedback from the community and ensure it has a good chance of being accepted.
                <br />
                <br />
                To create a proposal, you need to pay {cost} AQUA. The AQUA will be burned. If your
                proposal is accepted, you will get a reward of {reward} AQUA.
                <br />
                <br />
                Proposals must have clearly defined action points, be relevant to Aquarius and have
                a feasible technical plan for implementation. Otherwise, they might be taken down
                before the voting ends.
                <br />
                <br />
            </Description>
            <ProposalCost>
                <Label>Proposal creation cost</Label>
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
