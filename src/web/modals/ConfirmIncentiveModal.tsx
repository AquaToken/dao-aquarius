import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import { DAY } from 'constants/intervals';

import { getDateString } from 'helpers/date';
import ErrorHandler from 'helpers/error-handler';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { useIsMounted } from 'hooks/useIsMounted';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import { SorobanService, ToastService } from 'services/globalServices';

import { PoolExtended } from 'types/amm';
import { ModalProps } from 'types/modal';
import { Token, TokenType } from 'types/token';

import { flexAllCenter } from 'web/mixins';
import { COLORS } from 'web/styles';

import Asset from 'basics/Asset';
import Button from 'basics/buttons/Button';
import Market from 'basics/Market';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import {
    BribeInfo,
    InfoRow,
    Label,
    Value,
} from 'pages/bribes/components/AddBribePage/ConfirmBribeModal/ConfirmBribeModal';

const PairBlock = styled.div`
    ${flexAllCenter};
    padding: 3.4rem 0;
    border-radius: 0.5rem;
    background: ${COLORS.gray50};
    margin-bottom: 2.3rem;
`;

interface Props {
    pool: PoolExtended;
    rewardToken: Token;
    amountPerDay: number;
    startDate: number;
    endDate: number;
    swapChainedXdr: string;
}

const ConfirmIncentiveModal = ({ params, close }: ModalProps<Props>) => {
    const [pending, setPending] = useState<boolean>(false);
    const { pool, rewardToken, amountPerDay, startDate, endDate, swapChainedXdr } = params;

    const days = (endDate - startDate) / DAY;

    const { account } = useAuthStore();

    const isMounted = useIsMounted();

    const onSubmit = async () => {
        const balance =
            rewardToken.type === TokenType.classic
                ? account.getAssetBalance(rewardToken)
                : await account.getAssetBalance(rewardToken);

        if (rewardToken.type === TokenType.classic && balance === null) {
            ToastService.showErrorToast(`You don't have a trustline for ${rewardToken.code}`);
            return;
        }

        if (+balance < +amountPerDay * +days) {
            ToastService.showErrorToast(`You have insufficient ${rewardToken.code} balance`);
            return;
        }

        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }

        setPending(true);

        try {
            const seconds = (endDate - startDate) / 1000;

            const tps = (amountPerDay * days) / seconds;

            const tx = await SorobanService.amm.getScheduleIncentiveTx(
                account.accountId(),
                pool,
                rewardToken,
                tps,
                startDate,
                endDate,
                swapChainedXdr,
            );

            const result = await account.signAndSubmitTx(tx);

            if (isMounted.current) {
                setPending(false);
                close();
            }

            if (
                (result as { status: BuildSignAndSubmitStatuses }).status ===
                BuildSignAndSubmitStatuses.pending
            ) {
                ToastService.showSuccessToast('More signatures required to complete');
                return;
            }
            ToastService.showSuccessToast('Your incentive has been created');
        } catch (error) {
            const errorText = ErrorHandler(error);
            ToastService.showErrorToast(errorText);
            setPending(false);
        }
    };

    return (
        <ModalWrapper>
            <ModalTitle>Confirm Incentive</ModalTitle>
            <ModalDescription>
                Review details and confirm to lock tokens from your wallet for this incentive.
            </ModalDescription>
            <PairBlock>
                <Market
                    verticalDirections
                    assets={pool.tokens}
                    withoutLink
                    poolType={pool.pool_type}
                    fee={pool.fee}
                />
            </PairBlock>
            <BribeInfo>
                <InfoRow>
                    <Label>Reward asset:</Label>
                    <Value>
                        <Asset asset={rewardToken} inRow withMobileView />
                    </Value>
                </InfoRow>
                <InfoRow>
                    <Label>Daily reward amount:</Label>
                    <Value>
                        {formatBalance(+amountPerDay)} {rewardToken.code}
                    </Value>
                </InfoRow>
                <InfoRow>
                    <Label>Total reward amount:</Label>
                    <Value>
                        {formatBalance(+amountPerDay * days)} {rewardToken.code}
                    </Value>
                </InfoRow>
                <InfoRow>
                    <Label>Incentive period:</Label>
                    <Value>
                        {getDateString(startDate, { withoutYear: true, withTime: true })} -{' '}
                        {getDateString(endDate, { withoutYear: true, withTime: true })} ({days}{' '}
                        days)
                    </Value>
                </InfoRow>
            </BribeInfo>
            <Button isBig fullWidth onClick={() => onSubmit()} pending={pending}>
                create incentive
            </Button>
        </ModalWrapper>
    );
};

export default ConfirmIncentiveModal;
