import * as React from 'react';
import { useState, useMemo } from 'react';

import { getDateString } from 'helpers/date';
import ErrorHandler from 'helpers/error-handler';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { useIsMounted } from 'hooks/useIsMounted';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import { StellarService, ToastService } from 'services/globalServices';

import { ModalProps } from 'types/modal';

import Button from 'basics/buttons/Button';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import {
    Row,
    Label,
    Value,
    ButtonContainer,
    AquaLogo,
    IceLogo,
    AddTrustBlock,
    AddTrustDescription,
    AddTrustEmoji,
    AddTrustTextDescription,
} from './LockAquaModal.styled';

const LockAquaModal = ({
    confirm,
    params,
}: ModalProps<{ amount: string; period: number; iceAmount: number }>) => {
    const { amount, period, iceAmount } = params;
    const { account } = useAuthStore();
    const [pending, setPending] = useState(false);
    const isMounted = useIsMounted();

    const unlistedIceAssets = useMemo(() => account.getUntrustedIceAssets(), [account]);

    const buildOperations = () => {
        const ops = [StellarService.op.createLockOperation(account.accountId(), amount, period)];

        if (unlistedIceAssets.length) {
            unlistedIceAssets.forEach(asset => {
                ops.push(StellarService.op.createAddTrustOperation(asset));
            });
        }

        return ops;
    };

    const handleSubmit = async () => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }

        try {
            setPending(true);

            const operations = buildOperations();
            const tx = await StellarService.tx.buildTx(account, operations);
            const result = await account.signAndSubmitTx(tx);

            if (isMounted.current) {
                setPending(false);
                confirm({});
            }

            const { status } = result as { status: BuildSignAndSubmitStatuses };

            if (status === BuildSignAndSubmitStatuses.pending) {
                ToastService.showSuccessToast('More signatures required to complete');
                return;
            }

            ToastService.showSuccessToast('Your lock has been created!');
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            if (isMounted.current) setPending(false);
        }
    };

    const renderAddTrustInfo = Boolean(unlistedIceAssets.length) && (
        <AddTrustBlock>
            <AddTrustDescription>
                <AddTrustEmoji>☝️</AddTrustEmoji>
                <AddTrustTextDescription>
                    Freezing AQUA requires you to add the {unlistedIceAssets.length} ICE trustlines
                    ({unlistedIceAssets.map(asset => asset.code).join(', ')}). Each trustline will
                    reserve 0.5 XLM of your wallet balance.
                </AddTrustTextDescription>
            </AddTrustDescription>
        </AddTrustBlock>
    );

    return (
        <ModalWrapper>
            <ModalTitle>Lock AQUA</ModalTitle>
            <ModalDescription>Please verify the details below before confirming</ModalDescription>

            <Row>
                <Label>Amount</Label>
                <Value>
                    <AquaLogo />
                    {formatBalance(+amount)} AQUA
                </Value>
            </Row>

            <Row>
                <Label>Unlock date</Label>
                <Value>{getDateString(+period)}</Value>
            </Row>

            <Row>
                <Label>ICE reward amount</Label>
                <Value>
                    <IceLogo />
                    {formatBalance(iceAmount)} ICE
                </Value>
            </Row>

            {renderAddTrustInfo}

            <ButtonContainer>
                <Button isBig isRounded fullWidth pending={pending} onClick={handleSubmit}>
                    Confirm
                </Button>
            </ButtonContainer>
        </ModalWrapper>
    );
};

export default LockAquaModal;
