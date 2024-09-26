import { MemoHash } from '@stellar/stellar-sdk';
import { sha256 } from 'js-sha256';
import * as React from 'react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import ErrorHandler from 'helpers/error-handler';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { useIsMounted } from 'hooks/useIsMounted';
import { StellarService, ToastService } from 'services/globalServices';
import { flexRowSpaceBetween, respondDown } from 'web/mixins';
import { Breakpoints } from 'web/styles';

import Alert from 'basics/Alert';
import Button from 'basics/buttons/Button';

import {
    ModalDescription,
    ModalProps,
    ModalTitle,
} from '../../../../../common/modals/atoms/ModalAtoms';
import { checkProposalStatus, createProposal, editProposal } from '../../../api/api';
import { Proposal } from '../../../api/types';
import { CREATE_DISCUSSION_COST } from '../../../pages/GovernanceMainPage';

const Container = styled.div`
    width: 52.8rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const ProposalCost = styled.div`
    ${flexRowSpaceBetween};
    font-size: 1.6rem;
    padding-bottom: 2.6rem;
    margin-bottom: 2.4rem;
    border-bottom: 1px dashed #e8e8ed;
`;

const Description = styled(ModalDescription)`
    width: 100%;
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

    const checkStatus = id =>
        new Promise((resolve, reject) => {
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

    const onSubmit = async () => {
        const { text, title, start_at, end_at, discord_username, isEdit, id } = params;

        if (loading) {
            return;
        }

        setLoading(true);

        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
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
                      discord_username: discord_username ? discord_username : null,
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
        <Container>
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
            {loading && (
                <Alert
                    title="Transaction submitting"
                    text="Do not close this window. The window will close automatically when the
                    transaction is signed"
                />
            )}
        </Container>
    );
};

export default CreateDiscussionModal;
