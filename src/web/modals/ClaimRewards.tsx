import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { useUpdateIndex } from 'hooks/useUpdateIndex';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { SorobanService, ToastService } from 'services/globalServices';
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';

import { PoolProcessed } from 'types/amm';
import { ModalProps } from 'types/modal';
import { Int128Parts } from 'types/stellar';

import { Button } from 'basics/buttons';
import { CircleLoader } from 'basics/loaders';
import Market from 'basics/Market';
import { ModalTitle, ModalWrapper, ModalDescription } from 'basics/ModalAtoms';

import { flexAllCenter } from '../mixins';
import { COLORS } from '../styles';

const MarketBlock = styled.div`
    ${flexAllCenter};
    padding: 3.4rem 0;
    border-radius: 0.5rem;
    background: ${COLORS.lightGray};
    margin-bottom: 2.3rem;
`;

const ClaimRewards = ({ params, confirm }: ModalProps<{ pool: PoolProcessed }>) => {
    const [rewards, setRewards] = useState(null);
    const [claimPending, setClaimPending] = useState(false);

    const { pool } = params;

    const { account } = useAuthStore();

    const updateIndex = useUpdateIndex(5000);

    useEffect(() => {
        SorobanService.getPoolRewards(account.accountId(), pool.address).then(res => {
            setRewards(res);
        });
    }, [updateIndex, pool]);

    const claim = () => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        setClaimPending(true);

        SorobanService.getClaimRewardsTx(account.accountId(), pool.address)
            .then(tx => account.signAndSubmitTx(tx, true))
            .then((res: { status?: BuildSignAndSubmitStatuses; value: () => Int128Parts }) => {
                if (!res) {
                    return;
                }

                if (
                    (res as { status: BuildSignAndSubmitStatuses }).status ===
                    BuildSignAndSubmitStatuses.pending
                ) {
                    ToastService.showSuccessToast('More signatures required to complete');
                    confirm();
                    return;
                }
                const value = SorobanService.i128ToInt(res.value());

                ToastService.showSuccessToast(`Claimed ${formatBalance(+value)} AQUA`);
                setClaimPending(false);
                confirm();
            })
            .catch(err => {
                ToastService.showErrorToast(err.message ?? err.toString());
                setClaimPending(false);
            });
    };

    return (
        <ModalWrapper>
            <ModalTitle>Claim rewards</ModalTitle>
            <ModalDescription>
                You have unclaimed rewards for the pool. Click the button below to claim them.
            </ModalDescription>
            <MarketBlock>
                <Market assets={pool.assets} verticalDirections />
            </MarketBlock>

            <Button fullWidth disabled={!rewards} pending={claimPending} onClick={() => claim()}>
                {rewards ? `Claim ${formatBalance(rewards.to_claim, true)} AQUA` : <CircleLoader />}
            </Button>
        </ModalWrapper>
    );
};

export default ClaimRewards;
