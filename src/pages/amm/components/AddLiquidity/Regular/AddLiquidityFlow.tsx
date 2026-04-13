import BigNumber from 'bignumber.js';
import * as React from 'react';
import { useState } from 'react';

import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import { ModalService, SorobanService, ToastService } from 'services/globalServices';

import { PoolExtended } from 'types/amm';
import { SorobanToken, Token, TokenType } from 'types/token';

import Button from 'basics/buttons/Button';
import { StickyButtonWrapper } from 'basics/ModalAtoms';

import { Container } from './AddLiquidity.styled';
import AddLiquidityForm, { AddLiquidityFormData } from './AddLiquidityForm';

import SuccessModal from '../../SuccessModal/SuccessModal';

type AddLiquidityFlowProps = {
    pool: PoolExtended;
    isModal?: boolean;
    baseAmount?: string;
    counterAmount?: string;
    base?: Token;
    counter?: Token;
    onUpdate?: () => void;
    onClose?: () => void;
};

const AddLiquidityFlow = ({
    pool,
    isModal = true,
    baseAmount,
    counterAmount,
    base,
    counter,
    onUpdate,
    onClose,
}: AddLiquidityFlowProps): React.ReactNode => {
    const { account } = useAuthStore();
    const [pending, setPending] = useState(false);
    const [formData, setFormData] = useState<AddLiquidityFormData | null>(null);

    const submit = () => {
        if (!account || !formData) {
            return;
        }

        const insufficientBalanceTokens = pool.tokens.filter(asset => {
            const availableBalance =
                asset.type === TokenType.soroban
                    ? formData.balances?.get(getAssetString(asset)) || '0'
                    : String(account.getAssetBalance(asset) || '0');

            return new BigNumber(availableBalance).lt(
                formData.amounts.get(getAssetString(asset)) || '0',
            );
        });

        if (insufficientBalanceTokens.length) {
            ToastService.showErrorToast(
                `Insufficient balance ${insufficientBalanceTokens.map(({ code }) => code).join(' ')}`,
            );
            return;
        }

        let hash: string;

        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }

        setPending(true);

        SorobanService.amm
            .getDepositTx(account.accountId(), pool.address, pool.tokens, formData.amounts)
            .then(tx => {
                hash = tx.hash().toString('hex');
                return account.signAndSubmitTx(tx, true);
            })
            .then((res: { value?: () => unknown; status?: BuildSignAndSubmitStatuses }) => {
                setPending(false);

                if (!res) {
                    return;
                }

                onClose?.();
                onUpdate?.();

                if (
                    (res as { status: BuildSignAndSubmitStatuses }).status ===
                    BuildSignAndSubmitStatuses.pending
                ) {
                    ToastService.showSuccessToast('More signatures required to complete');
                    return;
                }

                const resultAmounts = res.value()[0].value();

                pool.tokens.forEach((token, index) => {
                    if (token.type === TokenType.soroban) {
                        const resAmount = SorobanService.scVal.i128ToInt(
                            resultAmounts[index],
                            token.decimal,
                        );

                        ToastService.showSuccessToast(
                            `Payment sent: ${formatBalance(resAmount)} ${token.code}`,
                        );
                    }
                });

                ModalService.openModal(SuccessModal, {
                    assets: pool.tokens,
                    amounts: resultAmounts.map((value, index) =>
                        SorobanService.scVal.i128ToInt(
                            value,
                            (pool.tokens[index] as SorobanToken).decimal,
                        ),
                    ),
                    title: 'Deposit Successful',
                    hash,
                });
            })
            .catch(e => {
                ToastService.showErrorToast(
                    e.message ?? e.toString() ?? 'Oops! Something went wrong',
                );
                setPending(false);
            });
    };

    const submitButton = (
        <Button
            isBig
            onClick={submit}
            pending={pending}
            disabled={
                !formData ||
                (formData.isBalancedDeposit ? !formData.hasAllAmounts : !formData.hasAnyAmount)
            }
        >
            deposit
        </Button>
    );

    return (
        <Container $isModal={isModal}>
            <AddLiquidityForm
                pool={pool}
                showPoolSummaryRows={isModal}
                withPoolInfoCardSpacing={isModal}
                baseAmount={baseAmount}
                counterAmount={counterAmount}
                base={base}
                counter={counter}
                onDataChange={setFormData}
            />
            {isModal ? <StickyButtonWrapper>{submitButton}</StickyButtonWrapper> : submitButton}
        </Container>
    );
};

export default AddLiquidityFlow;
