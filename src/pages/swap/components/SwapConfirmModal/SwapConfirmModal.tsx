import * as StellarSdk from '@stellar/stellar-sdk';
import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getPathPoolsFee } from 'api/amm';

import { getAssetFromString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, SorobanService, ToastService } from 'services/globalServices';
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';

import { ModalProps } from 'types/modal';
import { Asset, Int128Parts } from 'types/stellar';

import { flexAllCenter, flexRowSpaceBetween, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Button from 'basics/buttons/Button';
import DotsLoader from 'basics/loaders/DotsLoader';
import PageLoader from 'basics/loaders/PageLoader';
import Market from 'basics/Market';
import { ModalDescription, ModalTitle } from 'basics/ModalAtoms';

import PathPool from './PathPool/PathPool';

import SuccessModal from '../../../amm/components/SuccessModal/SuccessModal';
import { SWAP_SLIPPAGE_ALIAS } from '../SwapSettingsModal/SwapSettingsModal';

const Container = styled.div`
    width: 52.3rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const AssetsInfo = styled.div`
    ${flexAllCenter};
    padding: 3.5rem 0;
    background-color: ${COLORS.lightGray};
    border-radius: 0.5rem;
`;

const DescriptionRow = styled.div`
    ${flexRowSpaceBetween};
    color: ${COLORS.grayText};
    font-size: 1.6rem;
    padding: 1.5rem 0;

    span:last-child {
        color: ${COLORS.paragraphText};
    }
`;

const Divider = styled.div`
    border-bottom: 0.1rem dashed ${COLORS.gray};
    margin: 3.2rem 0;
`;

const Pools = styled.div`
    display: flex;
    flex-wrap: wrap;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        width: 100%;
    `}
`;

const STROOP = 0.0000001;

interface SwapConfirmModalParams {
    base: Asset;
    counter: Asset;
    baseAmount: string;
    counterAmount: string;
    bestPathXDR: string;
    bestPath: string[];
    bestPools: string[];
    isSend: boolean;
}

const SwapConfirmModal = ({
    params,
    confirm,
}: ModalProps<SwapConfirmModalParams>): React.ReactNode => {
    const { base, counter, baseAmount, counterAmount, bestPathXDR, bestPath, bestPools, isSend } =
        params;
    const [fees, setFees] = useState(null);
    const [swapPending, setSwapPending] = useState(false);
    const [txFee, setTxFee] = useState(null);

    const { account } = useAuthStore();

    useEffect(() => {
        getPathPoolsFee(bestPools)
            .then(res => {
                setFees(res);
            })
            .catch(() => {
                setFees(0);
            });
    }, []);

    useEffect(() => {
        const SLIPPAGE = localStorage.getItem(SWAP_SLIPPAGE_ALIAS) || '1'; // 1%
        const minAmount = isSend
            ? ((1 - Number(SLIPPAGE) / 100) * Number(counterAmount)).toFixed(7)
            : ((1 + Number(SLIPPAGE) / 100) * Number(baseAmount)).toFixed(7);
        SorobanService.getSwapChainedTx(
            account?.accountId(),
            base,
            bestPathXDR,
            isSend ? baseAmount : counterAmount,
            minAmount,
            isSend,
        ).then(res => {
            SorobanService.simulateTx(res).then(
                ({ minResourceFee }: StellarSdk.rpc.Api.SimulateTransactionSuccessResponse) => {
                    setTxFee(minResourceFee);
                },
            );
        });
    }, []);

    const swap = () => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        setSwapPending(true);
        const SLIPPAGE = localStorage.getItem(SWAP_SLIPPAGE_ALIAS) || '1'; // 1%

        const minAmount = isSend
            ? ((1 - Number(SLIPPAGE) / 100) * Number(counterAmount)).toFixed(7)
            : ((1 + Number(SLIPPAGE) / 100) * Number(baseAmount)).toFixed(7);

        let hash: string;

        SorobanService.getSwapChainedTx(
            account?.accountId(),
            base,
            bestPathXDR,
            isSend ? baseAmount : counterAmount,
            minAmount,
            isSend,
        )
            .then(tx => {
                hash = tx.hash().toString('hex');
                return account.signAndSubmitTx(tx, true);
            })
            .then((res: { value?: () => Int128Parts; status?: BuildSignAndSubmitStatuses }) => {
                confirm();

                if (!res) {
                    return;
                }

                if (
                    (res as { status: BuildSignAndSubmitStatuses }).status ===
                    BuildSignAndSubmitStatuses.pending
                ) {
                    ToastService.showSuccessToast('More signatures required to complete');
                    return;
                }

                ModalService.openModal(SuccessModal, {
                    assets: [base, counter],
                    amounts: [
                        isSend ? baseAmount : SorobanService.i128ToInt(res.value()),
                        isSend ? SorobanService.i128ToInt(res.value()) : counterAmount,
                    ],
                    title: 'Swap Successful',
                    isSwap: true,
                    hash,
                });
                setSwapPending(false);
            })
            .catch(e => {
                const errorMessage = e.message ?? e.toString() ?? 'Oops! Something went wrong';

                ToastService.showErrorToast(
                    errorMessage === 'The amount is too small to deposit to this pool'
                        ? 'Price expired, please submit a swap again'
                        : errorMessage,
                );
                setSwapPending(false);
            });
    };

    if (!fees) {
        return (
            <Container>
                <PageLoader />
            </Container>
        );
    }

    return (
        <Container>
            <ModalTitle>Confirm swap</ModalTitle>
            <ModalDescription>Please check all the details to make a swap</ModalDescription>
            <AssetsInfo>
                <Market verticalDirections assets={[base, counter]} />
            </AssetsInfo>
            <DescriptionRow>
                <span>You give</span>
                <span>
                    {formatBalance(Number(baseAmount))} {base.code}
                </span>
            </DescriptionRow>
            <DescriptionRow>
                <span>You get (estimate)</span>
                <span>
                    {formatBalance(Number(counterAmount))} {counter.code}
                </span>
            </DescriptionRow>
            <DescriptionRow>
                <span>Exchange rate</span>
                <span>
                    1 {base.code} = {formatBalance(+counterAmount / +baseAmount)} {counter.code}
                </span>
            </DescriptionRow>

            <DescriptionRow>
                <span>Maximum transaction fee:</span>
                <span>
                    {txFee !== null ? (
                        `${formatBalance(
                            STROOP * (Number(txFee) + Number(StellarSdk.BASE_FEE)),
                        )} XLM`
                    ) : (
                        <DotsLoader />
                    )}
                </span>
            </DescriptionRow>

            <DescriptionRow>
                <span>Pools:</span>
                <span />
            </DescriptionRow>

            <Pools>
                {bestPools.map((pool, index) => (
                    <PathPool
                        key={pool}
                        base={getAssetFromString(bestPath[index])}
                        counter={getAssetFromString(bestPath[index + 1])}
                        fee={fees.get(pool)}
                        address={pool}
                        isLastPool={index === bestPools.length - 1}
                    />
                ))}
            </Pools>

            <Divider />
            <Button fullWidth isBig pending={swapPending} onClick={() => swap()}>
                Confirm Swap
            </Button>
        </Container>
    );
};

export default SwapConfirmModal;
