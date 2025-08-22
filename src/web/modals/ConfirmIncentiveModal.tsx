import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import { DAY } from 'constants/intervals';

import { getDateString } from 'helpers/date';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { ToastService } from 'services/globalServices';

import { PoolExtended } from 'types/amm';
import { ModalProps } from 'types/modal';
import { Token, TokenType } from 'types/token';

import Asset from 'basics/Asset';
import Market from 'basics/Market';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import {
    BribeInfo,
    InfoRow,
    Label,
    Value,
} from 'pages/bribes/components/AddBribePage/ConfirmBribeModal/ConfirmBribeModal';

import Button from '../basics/buttons/Button';
import { flexAllCenter } from '../mixins';
import { COLORS } from '../styles';

const PairBlock = styled.div`
    ${flexAllCenter};
    padding: 3.4rem 0;
    border-radius: 0.5rem;
    background: ${COLORS.lightGray};
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

const ConfirmIncentiveModal = ({ params }: ModalProps<Props>) => {
    const [pending, setPending] = useState<boolean>(false);
    const { pool, rewardToken, amountPerDay, startDate, endDate, swapChainedXdr } = params;

    const days = (endDate - startDate) / DAY;

    const { account } = useAuthStore();

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
    };

    return (
        <ModalWrapper>
            <ModalTitle>Confirm Incentive</ModalTitle>
            <ModalDescription>Please check all the details to create an incentive</ModalDescription>
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
                    <Label>Reward asset</Label>
                    <Value>
                        <Asset asset={rewardToken} inRow withMobileView />
                    </Value>
                </InfoRow>
                <InfoRow>
                    <Label>Daily reward amount</Label>
                    <Value>
                        {formatBalance(+amountPerDay)} {rewardToken.code}
                    </Value>
                </InfoRow>
                <InfoRow>
                    <Label>Total reward amount</Label>
                    <Value>
                        {formatBalance(+amountPerDay * days)} {rewardToken.code}
                    </Value>
                </InfoRow>
                <InfoRow>
                    <Label>Incentive period</Label>
                    <Value>
                        {getDateString(startDate, { withoutYear: true })} - {getDateString(endDate)}{' '}
                        ({days} days)
                    </Value>
                </InfoRow>
            </BribeInfo>
            <Button isBig fullWidth onClick={() => {}} pending={pending}>
                create incentive
            </Button>
        </ModalWrapper>
    );
};

export default ConfirmIncentiveModal;
