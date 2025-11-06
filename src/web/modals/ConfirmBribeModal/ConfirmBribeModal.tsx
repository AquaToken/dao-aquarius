import { addWeeks } from 'date-fns';
import * as React from 'react';
import { useState } from 'react';

import { DAY } from 'constants/intervals';

import { getDateString } from 'helpers/date';
import ErrorHandler from 'helpers/error-handler';
import { formatBalance } from 'helpers/format-number';
import { createAsset } from 'helpers/token';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { useIsMounted } from 'hooks/useIsMounted';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import { StellarService, ToastService } from 'services/globalServices';

import { ModalProps } from 'types/modal';
import { ClassicToken } from 'types/token';

import Asset from 'basics/Asset';
import Button from 'basics/buttons/Button';
import Market from 'basics/Market';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import { PairBlock, BribeInfo, InfoRow, Label, Value } from './ConfirmBribeModal.styled';

type ConfirmBribeParams = {
    base: ClassicToken;
    counter: ClassicToken;
    rewardAsset: ClassicToken;
    amount: string;
    startDate: Date;
    endDate: Date;
    marketKey: string;
    resetForm: () => void;
    duration: string;
};

/**
 * ConfirmBribeModal — final confirmation modal before submitting a new bribe.
 * Handles transaction creation, signing, submission, and user feedback.
 */
const ConfirmBribeModal: React.FC<ModalProps<ConfirmBribeParams>> = ({ params, close }) => {
    const {
        base,
        counter,
        rewardAsset,
        amount,
        startDate,
        endDate,
        marketKey,
        resetForm,
        duration,
    } = params;
    const { account } = useAuthStore();
    const [pending, setPending] = useState(false);
    const isMounted = useIsMounted();

    /** Submits bribe creation transaction */
    const onSubmit = async () => {
        const balance = account.getAssetBalance(createAsset(rewardAsset.code, rewardAsset.issuer));

        // Check trustline existence
        if (balance === null) {
            ToastService.showErrorToast(`You don't have a trustline for ${rewardAsset.code}`);
            return;
        }

        // Validate sufficient funds
        if (+balance < +amount * +duration) {
            ToastService.showErrorToast(`You have insufficient ${rewardAsset.code} balance`);
            return;
        }

        // Ensure wallet app is open for WalletConnect
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }

        setPending(true);

        try {
            // Build multiple weekly bribe operations
            const operations = Array.from({ length: +duration }, (_, i) =>
                StellarService.op.createBribeOperation(
                    marketKey,
                    rewardAsset,
                    amount,
                    addWeeks(startDate.getTime() - DAY, i).getTime(),
                ),
            );

            const tx = await StellarService.tx.buildTx(account, operations);
            const result = await account.signAndSubmitTx(tx);

            if (isMounted.current) {
                setPending(false);
                resetForm();
                close();
            }

            // Handle pending multisig transactions
            if (
                (result as { status: BuildSignAndSubmitStatuses }).status ===
                BuildSignAndSubmitStatuses.pending
            ) {
                ToastService.showSuccessToast('More signatures required to complete');
                return;
            }

            ToastService.showSuccessToast('Your bribe has been created');
        } catch (error) {
            const errorText = ErrorHandler(error);
            ToastService.showErrorToast(errorText);
            if (isMounted.current) {
                setPending(false);
            }
        }
    };

    return (
        <ModalWrapper>
            <ModalTitle>Confirm bribe</ModalTitle>
            <ModalDescription>Please check all the details to create a bribe</ModalDescription>

            <PairBlock>
                <Market assets={[base, counter]} verticalDirections />
            </PairBlock>

            <BribeInfo>
                <InfoRow>
                    <Label>Reward asset</Label>
                    <Value>
                        <Asset asset={rewardAsset} inRow withMobileView />
                    </Value>
                </InfoRow>

                <InfoRow>
                    <Label>Weekly reward amount</Label>
                    <Value>
                        {formatBalance(+amount)} {rewardAsset.code}
                    </Value>
                </InfoRow>

                <InfoRow>
                    <Label>Total reward amount</Label>
                    <Value>
                        {formatBalance(+amount * +duration)} {rewardAsset.code}
                    </Value>
                </InfoRow>

                <InfoRow>
                    <Label>Bribe period</Label>
                    <Value>
                        {getDateString(startDate.getTime(), { withoutYear: true })} -{' '}
                        {getDateString(endDate.getTime())} ({duration} week
                        {duration === '1' ? '' : 's'})
                    </Value>
                </InfoRow>
            </BribeInfo>

            <Button isBig fullWidth onClick={onSubmit} pending={pending}>
                add bribe
            </Button>
        </ModalWrapper>
    );
};

export default ConfirmBribeModal;
