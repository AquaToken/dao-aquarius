import { addWeeks } from 'date-fns';
import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import { getDateString } from 'helpers/date';
import ErrorHandler from 'helpers/error-handler';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { AssetSimple } from 'store/assetsStore/types';
import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { ModalProps } from 'types/modal';

import { useIsMounted } from 'hooks/useIsMounted';
import { StellarService, ToastService } from 'services/globalServices';
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';
import { flexAllCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Asset from 'basics/Asset';
import Button from 'basics/buttons/Button';
import Market from 'basics/Market';
import { ModalDescription, ModalTitle } from 'basics/ModalAtoms';

const Container = styled.div`
    width: 52.8rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const PairBlock = styled.div`
    ${flexAllCenter};
    padding: 3.4rem 0;
    border-radius: 0.5rem;
    background: ${COLORS.lightGray};
    margin-bottom: 2.3rem;
`;

const BribeInfo = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 4.7rem;
    padding-bottom: 3rem;
    border-bottom: 0.1rem dashed ${COLORS.gray};
`;

const InfoRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;

    &:not(:last-child) {
        margin-bottom: 3rem;
    }
`;

const Label = styled.span`
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.grayText};
`;

const Value = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
`;

const StyledButton = styled(Button)`
    margin-top: 3rem;
`;

const DAY = 24 * 60 * 60 * 1000;

const ConfirmBribeModal = ({
    params,
    close,
}: ModalProps<{
    base: AssetSimple;
    counter: AssetSimple;
    rewardAsset: AssetSimple;
    amount: string;
    startDate: Date;
    endDate: Date;
    marketKey: string;
    resetForm: () => void;
    duration: string;
}>) => {
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

    const onSubmit = async () => {
        const balance = account.getAssetBalance(
            StellarService.createAsset(rewardAsset.code, rewardAsset.issuer),
        );

        if (balance === null) {
            ToastService.showErrorToast(`You don't have a trustline for ${rewardAsset.code}`);
            return;
        }

        if (+balance < +amount * +duration) {
            ToastService.showErrorToast(`You have insufficient ${rewardAsset.code} balance`);
            return;
        }

        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }

        setPending(true);
        try {
            const ops = [];

            for (let i = 0; i < +duration; i++) {
                const start = startDate.getTime() - DAY;
                const op = StellarService.createBribeOperation(
                    marketKey,
                    rewardAsset,
                    amount,
                    addWeeks(start, i),
                );

                ops.push(op);
            }

            const tx = await StellarService.buildTx(account, ops);
            const result = await account.signAndSubmitTx(tx);

            if (isMounted.current) {
                setPending(false);
                resetForm();
                close();
            }

            if (
                (result as { status: BuildSignAndSubmitStatuses }).status ===
                BuildSignAndSubmitStatuses.pending
            ) {
                ToastService.showSuccessToast('More signatures required to complete');
                return;
            }
            ToastService.showSuccessToast('Your bribe has been created');
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            if (isMounted.current) {
                setPending(false);
            }
        }
    };

    return (
        <Container>
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
            <StyledButton isBig fullWidth onClick={() => onSubmit()} pending={pending}>
                add bribe
            </StyledButton>
        </Container>
    );
};

export default ConfirmBribeModal;
