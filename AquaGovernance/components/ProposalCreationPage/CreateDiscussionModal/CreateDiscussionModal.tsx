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
import { CREATE_DISCUSSION_COST } from '../../MainPage/MainPage';
import { StellarService, ToastService } from '../../../../common/services/globalServices';
import { MemoHash } from 'stellar-base';
import { sha256 } from 'js-sha256';
import useAuthStore from '../../../../common/store/authStore/useAuthStore';
import { useIsMounted } from '../../../../common/hooks/useIsMounted';
import { checkProposalStatus, createProposal, editProposal } from '../../../api/api';
import { useHistory } from 'react-router-dom';
import { Breakpoints } from '../../../../common/styles';
import PaymentInProgressAlert from '../PaymentInProgressAlert/PaymentInProgressAlert';
import ErrorHandler from '../../../../common/helpers/error-handler';
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

const CreateDiscussionModal = ({
    params,
    close,
}: ModalProps<Proposal & { isEdit?: boolean }>): JSX.Element => {
    const [loading, setLoading] = useState(false);
    const { account } = useAuthStore();
    const cost = formatBalance(CREATE_DISCUSSION_COST);

    const history = useHistory();

    const isMounted = useIsMounted();

    const checkStatus = (id) => {
        return new Promise((resolve, reject) => {
            async function check() {
                if (!isMounted.current) {
                    reject();
                    return;
                }
                const result = await checkProposalStatus(id);

                if (result.payment_status === 'FINE') {
                    resolve(void 0);
                    return;
                }

                if (result.payment_status === 'HORIZON_ERROR') {
                    return setTimeout(() => check(), 5000);
                }

                reject(result.payment_status);
            }

            check();
        });
    };

    const onSubmit = async () => {
        const {
            text,
            title,
            start_at,
            end_at,
            discord_username,
            discord_channel_name,
            discord_channel_url,
            isEdit,
            id,
        } = params;

        if (loading) {
            return;
        }

        setLoading(true);

        if (account.authType === LoginTypes.walletConnect) {
            openApp();
        }

        try {
            const op = StellarService.createBurnAquaOperation(CREATE_DISCUSSION_COST.toString());
            const hash = sha256(text);
            const memoHash = StellarService.createMemo(MemoHash, hash);

            const tx = await StellarService.buildTx(account, op, memoHash);

            const result = isEdit
                ? await editProposal(
                      {
                          new_text: text,
                          new_title: title,
                          new_transaction_hash: tx.hash().toString('hex'),
                          new_envelope_xdr: tx.toEnvelope().toXDR('base64'),
                      },
                      id,
                  )
                : await createProposal({
                      proposed_by: account.accountId(),
                      title,
                      text,
                      start_at,
                      end_at,
                      transaction_hash: tx.hash().toString('hex'),
                      discord_username: Boolean(discord_username) ? discord_username : null,
                      discord_channel_name: Boolean(discord_channel_name)
                          ? discord_channel_name
                          : null,
                      discord_channel_url: Boolean(discord_channel_url)
                          ? discord_channel_url
                          : null,
                      envelope_xdr: tx.toEnvelope().toXDR('base64'),
                  });

            if (result.payment_status !== 'FINE') {
                ToastService.showErrorToast('The proposal has not been created');
                if (isMounted.current) {
                    setLoading(false);
                }
                return;
            }

            await account.signAndSubmitTx(tx);

            await checkStatus(result.id);

            close();

            ToastService.showSuccessToast('The proposal has been created');

            history.push('/');
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    return (
        <>
            <ModalTitle>Create proposal discussion</ModalTitle>
            <Description>To create a proposal discussion, you need to pay {cost} AQUA</Description>
            <ProposalCost>
                <Label>Discussion creation cost</Label>
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
            {loading && <PaymentInProgressAlert />}
        </>
    );
};

export default CreateDiscussionModal;
