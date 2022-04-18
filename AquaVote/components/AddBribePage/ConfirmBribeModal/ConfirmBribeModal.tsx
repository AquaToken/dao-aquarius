import * as React from 'react';
import styled from 'styled-components';
import { flexAllCenter, respondDown } from '../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../common/styles';
import {
    ModalDescription,
    ModalProps,
    ModalTitle,
} from '../../../../common/modals/atoms/ModalAtoms';
import { AssetSimple } from '../../../api/types';
import Pair from '../../common/Pair';
import { formatBalance, getDateString } from '../../../../common/helpers/helpers';
import Button from '../../../../common/basics/Button';
import Asset from '../../AssetDropdown/Asset';
import { StellarService, ToastService } from '../../../../common/services/globalServices';
import useAuthStore from '../../../../common/store/authStore/useAuthStore';
import { useState } from 'react';
import { useIsMounted } from '../../../../common/hooks/useIsMounted';
import { BuildSignAndSubmitStatuses } from '../../../../common/services/wallet-connect.service';
import ErrorHandler from '../../../../common/helpers/error-handler';

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
}>) => {
    const { base, counter, rewardAsset, amount, startDate, endDate, marketKey, resetForm } = params;
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

        if (+balance < +amount) {
            ToastService.showErrorToast(`You have insufficient ${rewardAsset.code} balance`);
            return;
        }

        setPending(true);
        try {
            const op = StellarService.createBribeOperation(
                marketKey,
                rewardAsset,
                amount,
                startDate.getTime() - DAY,
            );

            const tx = await StellarService.buildTx(account, [op]);
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
                <Pair base={base} counter={counter} verticalDirections />
            </PairBlock>
            <BribeInfo>
                <InfoRow>
                    <Label>Reward asset</Label>
                    <Value>
                        <Asset asset={rewardAsset} inRow withMobileView />
                    </Value>
                </InfoRow>
                <InfoRow>
                    <Label>Reward amount</Label>
                    <Value>
                        {formatBalance(+amount)} {rewardAsset.code}
                    </Value>
                </InfoRow>
                <InfoRow>
                    <Label>Bribe period</Label>
                    <Value>
                        {getDateString(startDate.getTime(), { withoutYear: true })} -{' '}
                        {getDateString(endDate.getTime())}
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
