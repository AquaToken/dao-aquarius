import * as React from 'react';
import styled from 'styled-components';
import { flexAllCenter, flexRowSpaceBetween, respondDown } from '../../../common/mixins';
import { Breakpoints, COLORS } from '../../../common/styles';
import { ModalDescription, ModalTitle } from '../../../common/modals/atoms/ModalAtoms';
import Pair from '../../vote/components/common/Pair';
import { formatBalance } from '../../../common/helpers/helpers';
import Button from '../../../common/basics/Button';
import { useState } from 'react';
import {
    ModalService,
    SorobanService,
    ToastService,
} from '../../../common/services/globalServices';
import SuccessModal from '../../amm/components/SuccessModal/SuccessModal';
import useAuthStore from '../../../store/authStore/useAuthStore';
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

const SwapConfirmModal = ({ params, confirm }) => {
    const { base, counter, baseAmount, counterAmount, bestPoolBytes } = params;
    const [swapPending, setSwapPending] = useState(false);

    const { account } = useAuthStore();

    const swap = () => {
        setSwapPending(true);
        const SLIPPAGE = localStorage.getItem(SWAP_SLIPPAGE_ALIAS) || '1'; // 1%

        const minCounterAmount = ((1 - Number(SLIPPAGE) / 100) * Number(counterAmount)).toFixed(7);

        SorobanService.getSwapTx(
            account?.accountId(),
            bestPoolBytes,
            base,
            counter,
            baseAmount,
            minCounterAmount,
        )
            .then((tx) => account.signAndSubmitTx(tx, true))
            .then((res) => {
                confirm();
                ModalService.openModal(SuccessModal, {
                    base,
                    counter,
                    baseAmount: baseAmount,
                    counterAmount: SorobanService.i128ToInt(res.value()),
                    title: 'Success swap',
                    isSwap: true,
                });
                setSwapPending(false);
            })
            .catch((e) => {
                console.log(e);
                ToastService.showErrorToast('Oops! Something went wrong');
                setSwapPending(false);
            });
    };

    return (
        <Container>
            <ModalTitle>Confirm swap</ModalTitle>
            <ModalDescription>Please check all the details to create a bribe</ModalDescription>
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
            <Divider />
            <Button fullWidth isBig pending={swapPending} onClick={() => swap()}>
                Confirm Swap
            </Button>
        </Container>
    );
};

export default SwapConfirmModal;
