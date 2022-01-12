import * as React from 'react';
import {
    ModalDescription,
    ModalProps,
    ModalTitle,
} from '../../../../common/modals/atoms/ModalAtoms';
import styled from 'styled-components';
import { flexRowSpaceBetween } from '../../../../common/mixins';
import { COLORS } from '../../../../common/styles';
import Button from '../../../../common/basics/Button';
import { formatBalance, getDateString } from '../../../../common/helpers/helpers';
import { StellarService, ToastService } from '../../../../common/services/globalServices';
import { BuildSignAndSubmitStatuses } from '../../../../common/services/wallet-connect.service';
import { useState } from 'react';
import useAuthStore from '../../../../common/store/authStore/useAuthStore';
import { useIsMounted } from '../../../../common/hooks/useIsMounted';

const ModalContainer = styled.div`
    width: 52.8rem;
    display: flex;
    flex-direction: column;
`;

const Row = styled.div`
    ${flexRowSpaceBetween};
    font-size: 1.6rem;
    line-height: 1.8rem;
    padding-bottom: 3rem;
`;

const Label = styled.span`
    color: ${COLORS.grayText};
`;

const Value = styled.span`
    color: ${COLORS.paragraphText};
`;

const ButtonContainer = styled.div`
    padding-top: 3.2rem;
    border-top: 0.1rem dashed ${COLORS.gray};
    display: flex;
`;

const LockAquaModal = ({ confirm, params }: ModalProps<{ amount: string; period: number }>) => {
    const { amount, period } = params;
    const { account } = useAuthStore();
    const [pending, setPending] = useState(false);

    const isMounted = useIsMounted();

    const onSubmit = async () => {
        try {
            setPending(true);

            const op = StellarService.createLockOperation(account.accountId(), amount, period);

            const tx = await StellarService.buildTx(account, op);

            const result = await account.signAndSubmitTx(tx);

            if (isMounted.current) {
                setPending(false);
                confirm({});
            }

            if (
                (result as { status: BuildSignAndSubmitStatuses }).status ===
                BuildSignAndSubmitStatuses.pending
            ) {
                ToastService.showSuccessToast('More signatures required to complete');
                return;
            }
            ToastService.showSuccessToast('Your lock has been created!');
        } catch (e) {
            console.log(e);
            ToastService.showErrorToast('Oops. Something went wrong.');
            if (isMounted.current) {
                setPending(false);
            }
        }
    };
    return (
        <ModalContainer>
            <ModalTitle>Lock AQUA</ModalTitle>
            <ModalDescription>You lock your AQUA to get a boost to the airdrop</ModalDescription>
            <Row>
                <Label>Amount</Label>
                <Value>{formatBalance(+amount)} AQUA</Value>
            </Row>
            <Row>
                <Label>Unlock date</Label>
                <Value>{getDateString(+period)}</Value>
            </Row>
            <ButtonContainer>
                <Button isBig fullWidth pending={pending} onClick={() => onSubmit()}>
                    Confirm
                </Button>
            </ButtonContainer>
        </ModalContainer>
    );
};

export default LockAquaModal;
