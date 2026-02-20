import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { useIsMounted } from 'hooks/useIsMounted';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import { SorobanService, ToastService } from 'services/globalServices';

import { PoolExtended } from 'types/amm';
import { ModalProps } from 'types/modal';

import { Button } from 'basics/buttons';
import { IconFail, IconSuccess } from 'basics/icons';
import { PageLoader } from 'basics/loaders';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import { flexColumn, flexRowSpaceBetween } from 'styles/mixins';

const Content = styled.div`
    ${flexColumn};
    gap: 3.2rem;
`;

const CurrentStatus = styled.div`
    ${flexRowSpaceBetween};
`;

const Status = styled.div`
    display: flex;
    align-items: center;
    gap: 0.6rem;
`;

const RewardsSettingsModal = ({ params, close }: ModalProps<{ pool: PoolExtended }>) => {
    const { pool } = params;

    const [isEnabled, setIsEnabled] = useState(null);
    const [pending, setPending] = useState(false);

    const poolName = pool.tokens.map(t => t.code).join(' / ');
    const { account } = useAuthStore();

    useEffect(() => {
        if (!account) return;

        SorobanService.amm
            .getUserRewardsStatus(pool.address, account.accountId())
            .then(setIsEnabled);
    }, [account]);

    const isMounted = useIsMounted();

    const submit = async () => {
        setPending(true);

        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }

        try {
            const tx = await SorobanService.amm.getChangeUserRewardsStatusTx(
                pool.address,
                account.accountId(),
                !isEnabled,
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
            ToastService.showSuccessToast(
                `Rewards for pool ${poolName} successfully ${isEnabled ? 'disabled' : 'enabled'}`,
            );

            setPending(false);

            close();
        } catch (e) {
            console.log(e);
            ToastService.showErrorToast('Something went wrong!');
            setPending(false);
        }
    };

    return (
        <ModalWrapper>
            <ModalTitle>Pool Rewards Settings</ModalTitle>
            <ModalDescription>
                You can exclude yourself from receiving AQUA rewards and incentives for {poolName}{' '}
                pool. This can be useful for liquidity providers who want to motivate other
                participants to supply liquidity without taking a large share of the pool rewards.
            </ModalDescription>

            <Content>
                {isEnabled === null ? (
                    <PageLoader />
                ) : (
                    <>
                        <CurrentStatus>
                            <span>{poolName} rewards status:</span>
                            <Status>
                                {isEnabled ? 'Enabled' : 'Disabled'}
                                {isEnabled ? <IconSuccess /> : <IconFail />}
                            </Status>
                        </CurrentStatus>

                        <Button
                            fullWidth
                            isBig
                            isRounded
                            withGradient
                            secondary={isEnabled}
                            pending={pending}
                            onClick={() => submit()}
                        >
                            {isEnabled ? 'Disable' : 'Enable'} Rewards for Pool
                        </Button>
                    </>
                )}
            </Content>
        </ModalWrapper>
    );
};

export default RewardsSettingsModal;
