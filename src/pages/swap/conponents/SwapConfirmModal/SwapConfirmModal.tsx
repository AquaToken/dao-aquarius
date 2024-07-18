import * as React from 'react';
import styled from 'styled-components';
import { flexAllCenter, flexRowSpaceBetween, respondDown } from '../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { ModalDescription, ModalTitle } from '../../../../common/modals/atoms/ModalAtoms';
import Pair from '../../../vote/components/common/Pair';
import { formatBalance, getAssetFromString } from '../../../../common/helpers/helpers';
import Button from '../../../../common/basics/Button';
import { useState } from 'react';
import {
    ModalService,
    SorobanService,
    ToastService,
} from '../../../../common/services/globalServices';
import SuccessModal from '../../../amm/components/SuccessModal/SuccessModal';
import useAuthStore from '../../../../store/authStore/useAuthStore';
import { SWAP_SLIPPAGE_ALIAS } from '../SwapSettingsModal/SwapSettingsModal';
import { AmmRoutes } from '../../../../routes';
import { BuildSignAndSubmitStatuses } from '../../../../common/services/wallet-connect.service';

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

const PoolLink = styled.a`
    color: ${COLORS.purple};
    text-decoration: none;

    &:not(:last-child):after {
        color: ${COLORS.titleText};
        content: ' => ';
        text-decoration: none;
        cursor: default;
    }
`;

const SwapConfirmModal = ({ params, confirm }) => {
    const { base, counter, baseAmount, counterAmount, bestPathXDR, bestPath, bestPools } = params;
    const [swapPending, setSwapPending] = useState(false);

    const { account } = useAuthStore();

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
                console.log(tx.toEnvelope().toXDR('base64'));
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
                ToastService.showErrorToast(e.toString() ?? 'Oops! Something went wrong');
                setSwapPending(false);
            });
    };

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
                <span>Path</span>
                <span>{bestPath.map((path) => getAssetFromString(path).code).join(' => ')}</span>
            </DescriptionRow>

            <DescriptionRow>
                <span>Pools</span>
                <span>
                    {bestPools.map((pool) => (
                        <PoolLink
                            href={`${AmmRoutes.analytics}${pool}`}
                            target="_blank"
                        >{`C...${pool.slice(-3)}`}</PoolLink>
                    ))}
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
            <Divider />
            <Button fullWidth isBig pending={swapPending} onClick={() => swap()}>
                Confirm Swap
            </Button>
        </Container>
    );
};

export default SwapConfirmModal;
