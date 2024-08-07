import * as React from 'react';
import styled from 'styled-components';
import { flexAllCenter, flexRowSpaceBetween, respondDown } from '../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { ModalDescription, ModalTitle } from '../../../../common/modals/atoms/ModalAtoms';
import Pair from '../../../vote/components/common/Pair';
import { formatBalance, getAssetFromString } from '../../../../common/helpers/helpers';
import Button from '../../../../common/basics/Button';
import { useEffect, useState } from 'react';
import {
    ModalService,
    SorobanService,
    ToastService,
} from '../../../../common/services/globalServices';
import SuccessModal from '../../../amm/components/SuccessModal/SuccessModal';
import useAuthStore from '../../../../store/authStore/useAuthStore';
import { SWAP_SLIPPAGE_ALIAS } from '../SwapSettingsModal/SwapSettingsModal';
import { BuildSignAndSubmitStatuses } from '../../../../common/services/wallet-connect.service';
import { getPathPoolsFee } from '../../../amm/api/api';
import PageLoader from '../../../../common/basics/PageLoader';
import PathPool from './PathPool/PathPool';

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

const SwapConfirmModal = ({ params, confirm }) => {
    const { base, counter, baseAmount, counterAmount, bestPathXDR, bestPath, bestPools } = params;
    const [fees, setFees] = useState(null);
    const [swapPending, setSwapPending] = useState(false);

    const { account } = useAuthStore();

    useEffect(() => {
        getPathPoolsFee(bestPools).then((res) => {
            setFees(res);
        });
    }, []);

    const swap = () => {
        setSwapPending(true);
        const SLIPPAGE = localStorage.getItem(SWAP_SLIPPAGE_ALIAS) || '1'; // 1%

        const minCounterAmount = ((1 - Number(SLIPPAGE) / 100) * Number(counterAmount)).toFixed(7);

        let hash: string;

        SorobanService.getSwapChainedTx(
            account?.accountId(),
            base,
            bestPathXDR,
            baseAmount,
            minCounterAmount,
        )
            .then((tx) => {
                hash = tx.hash().toString('hex');
                return account.signAndSubmitTx(tx, true);
            })
            .then((res) => {
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
                    amounts: [baseAmount, SorobanService.i128ToInt(res.value())],
                    title: 'Swap Successful',
                    isSwap: true,
                    hash,
                });
                setSwapPending(false);
            })
            .catch((e) => {
                console.log(e);

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
                <Pair
                    verticalDirections
                    base={{
                        code: base.code,
                        issuer: base.issuer,
                    }}
                    counter={{
                        code: counter.code,
                        issuer: counter.issuer,
                    }}
                />
            </AssetsInfo>
            <DescriptionRow>
                <span>You give</span>
                <span>
                    {baseAmount} {base.code}
                </span>
            </DescriptionRow>
            <DescriptionRow>
                <span>You get (estimate)</span>
                <span>
                    {counterAmount} {counter.code}
                </span>
            </DescriptionRow>
            <DescriptionRow>
                <span>Exchange rate</span>
                <span>
                    1 {base.code} = {formatBalance(+counterAmount / +baseAmount)} {counter.code}
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
