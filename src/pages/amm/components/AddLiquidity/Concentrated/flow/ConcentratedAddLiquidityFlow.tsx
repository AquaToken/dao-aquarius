import * as React from 'react';
import { useState } from 'react';

import { getAssetString } from 'helpers/assets';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import { SorobanService, ToastService } from 'services/globalServices';

import { PoolExtended } from 'types/amm';

import Button from 'basics/buttons/Button';
import { StickyButtonWrapper } from 'basics/ModalAtoms';

import ConcentratedAddLiquidityForm, {
    ConcentratedAddLiquidityFormData,
} from '../form/ConcentratedAddLiquidityForm';

type ConcentratedAddLiquidityFlowProps = {
    pool: PoolExtended;
    onClose?: () => void;
    onUpdate?: () => void;
};

const ConcentratedAddLiquidityFlow = ({
    pool,
    onClose,
    onUpdate,
}: ConcentratedAddLiquidityFlowProps): React.ReactNode => {
    const { account } = useAuthStore();
    const [pending, setPending] = useState(false);
    const [formData, setFormData] = useState<ConcentratedAddLiquidityFormData | null>(null);

    const submit = () => {
        if (!account || !formData) {
            return;
        }

        if (!formData.hasTickRange || formData.rangeError) {
            return;
        }

        if (!formData.areAmountsFilled) {
            ToastService.showErrorToast('Enter amount for at least one token');
            return;
        }

        if (formData.isFirstDepositAmountsInvalid) {
            ToastService.showErrorToast(
                'For the first deposit both token amounts must be greater than zero',
            );
            return;
        }

        if (!formData.depositEstimate || formData.depositEstimate.liquidityLoading) {
            ToastService.showErrorToast('Waiting for estimate');
            return;
        }

        const desiredAmountsFromInputs = new Map([
            [getAssetString(pool.tokens[0]), formData.amount0 || '0'],
            [getAssetString(pool.tokens[1]), formData.amount1 || '0'],
        ]);

        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }

        setPending(true);

        SorobanService.amm
            .getDepositPositionTx(
                account.accountId(),
                pool.address,
                pool.tokens,
                formData.tickLower as number,
                formData.tickUpper as number,
                desiredAmountsFromInputs,
                '1',
            )
            .then(tx => account.signAndSubmitTx(tx, true))
            .then((res: { status?: BuildSignAndSubmitStatuses }) => {
                if (!res) {
                    return;
                }

                if (res.status === BuildSignAndSubmitStatuses.pending) {
                    ToastService.showSuccessToast('More signatures required to complete');
                    return;
                }

                ToastService.showSuccessToast('Concentrated position deposited');
                onUpdate?.();
                onClose?.();
            })
            .catch(e => {
                ToastService.showErrorToast(e?.message || 'Deposit failed');
            })
            .finally(() => {
                setPending(false);
            });
    };

    return (
        <>
            <ConcentratedAddLiquidityForm pool={pool} onDataChange={setFormData} />
            <StickyButtonWrapper>
                <Button
                    fullWidth
                    isBig
                    onClick={submit}
                    pending={pending}
                    disabled={!formData || formData.isDepositDisabled}
                >
                    Deposit
                </Button>
            </StickyButtonWrapper>
        </>
    );
};

export default ConcentratedAddLiquidityFlow;
