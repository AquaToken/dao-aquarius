import * as React from 'react';
import styled from 'styled-components';
import * as SorobanClient from 'soroban-client';
import { respondDown } from '../../../common/mixins';
import { Breakpoints } from '../../../common/styles';
import { ModalDescription, ModalTitle } from '../../../common/modals/atoms/ModalAtoms';
import { useState } from 'react';
import RangeInput from '../../../common/basics/RangeInput';
import Button from '../../../common/basics/Button';
import { formatBalance } from '../../../common/helpers/helpers';
import {
    ModalService,
    SorobanService,
    ToastService,
} from '../../../common/services/globalServices';
import SuccessModal from '../SuccessModal/SuccessModal';
import useAuthStore from '../../../store/authStore/useAuthStore';

const Container = styled.div`
    width: 52.3rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const StyledButton = styled(Button)`
    margin-top: 5rem;
`;

const WithdrawFromPool = ({ params }) => {
    const { base, counter, share, poolId, shareId } = params;
    const [percent, setPercent] = useState(100);
    const [pending, setPending] = useState(false);

    const { account } = useAuthStore();

    const withdraw = () => {
        setPending(true);

        const baseId = SorobanService.getAssetContractId(base);
        const counterId = SorobanService.getAssetContractId(counter);

        const [firstAsset] = baseId > counterId ? [counter, base] : [base, counter];

        const amount = (share * (percent / 100)).toFixed(7);

        SorobanService.getGiveAllowanceTx(account?.accountId(), poolId, shareId, amount)
            .then((tx) => account.signAndSubmitTx(tx as SorobanClient.Transaction, true))
            .then(() => SorobanService.getWithdrawTx(account?.accountId(), poolId, amount))
            .then((tx) => account.signAndSubmitTx(tx as SorobanClient.Transaction, true))
            .then((res) => {
                const [baseAmount, counterAmount] = res.value();

                ModalService.confirmAllModals();

                ModalService.openModal(SuccessModal, {
                    base,
                    counter,
                    baseAmount: SorobanService.i128ToInt(
                        baseId === SorobanService.getAssetContractId(firstAsset)
                            ? baseAmount.value()
                            : counterAmount.value(),
                    ),
                    counterAmount: SorobanService.i128ToInt(
                        baseId === SorobanService.getAssetContractId(firstAsset)
                            ? counterAmount.value()
                            : baseAmount.value(),
                    ),
                    title: 'Success withdraw',
                });
                setPending(false);
            })
            .catch((e) => {
                console.log(e);
                ToastService.showErrorToast('Oops! Something went wrong');
                setPending(false);
            });
    };

    return (
        <Container>
            <ModalTitle>Withdraw from liquidity pool</ModalTitle>
            <ModalDescription>Available: {share} shares</ModalDescription>
            <RangeInput onChange={setPercent} value={percent} />
            <StyledButton fullWidth pending={pending} onClick={() => withdraw()}>
                withdraw {formatBalance((share * percent) / 100)}
            </StyledButton>
        </Container>
    );
};

export default WithdrawFromPool;
