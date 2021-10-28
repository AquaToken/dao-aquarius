import * as React from 'react';
import {
    ModalDescription,
    ModalProps,
    ModalTitle,
} from '../../../../common/modals/atoms/ModalAtoms';
import styled from 'styled-components';
import { flexAllCenter, flexRowSpaceBetween } from '../../../../common/mixins';
import { COLORS } from '../../../../common/styles';
import Fail from '../../../../common/assets/img/icon-fail.svg';
import Aqua from '../../../../common/assets/img/aqua-logo-small.svg';
import useAuthStore from '../../../../common/store/authStore/useAuthStore';
import Input from '../../../../common/basics/Input';
import RangeInput from '../../../../common/basics/RangeInput';
import { useState } from 'react';
import Button from '../../../../common/basics/Button';
import { ToastService } from '../../../../common/services/globalServices';

const MINIMUM_AMOUNT = 0.0000001;

const ContentRow = styled.div`
    ${flexRowSpaceBetween};
    width: 52.8rem;
    margin-top: 3rem;

    &:first-child {
        margin-top: 7.2rem;
    }
`;

const Label = styled.span`
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.paragraphText};
    ${flexAllCenter};
`;

const FailIcon = styled(Fail)`
    height: 1.6rem;
    width: 1.6rem;
    margin-right: 0.5rem;
`;

const BalanceBlock = styled.span`
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.grayText};
`;

const Balance = styled.span`
    color: ${COLORS.tooltip};
`;

const InputPostfix = styled.div`
    height: min-content;
    ${flexAllCenter};
    color: ${COLORS.grayText};
`;

const AquaLogo = styled(Aqua)`
    margin-right: 0.8rem;
    height: 3.2rem;
    width: 3.2rem;
`;

const StyledInput = styled(Input)`
    margin-top: 1.2rem;
    margin-bottom: 3.3rem;
`;

const ClaimBack = styled.div`
    margin-top: 4.1rem;
    padding-bottom: 1.7rem;
    color: ${COLORS.grayText};
    border-bottom: 0.1rem dashed ${COLORS.gray};
`;

const ClaimBackDate = styled.span`
    color: ${COLORS.paragraphText};
`;

const StyledButton = styled(Button)`
    margin-top: 3.2rem;
`;

const ConfirmVoteModal = ({ params }: ModalProps<{ option: any }>) => {
    const { account } = useAuthStore();

    const [percent, setPercent] = useState(0);
    const [amount, setAmount] = useState('0');

    const aquaBalance = account.getAquaBalance();

    const onRangeChange = (percent) => {
        console.log(percent);
        setPercent(percent);

        const amountValue = (Number(aquaBalance) * percent) / 100;

        setAmount(amountValue.toString());
    };

    const onInputChange = (value) => {
        if (Number.isNaN(Number(value))) {
            return;
        }
        setAmount(value);

        const percentValue = Math.round((Number(value) / Number(aquaBalance)) * 100 * 10) / 10;

        setPercent(percentValue);
    };

    const onSubmit = () => {
        if (Number(amount) > Number(aquaBalance)) {
            ToastService.showErrorToast(`The value must be less  than ${aquaBalance} AQUA`);
        }
        if (Number(amount) < MINIMUM_AMOUNT) {
            ToastService.showErrorToast(
                `The value must be greater than ${MINIMUM_AMOUNT.toFixed(7)} AQUA`,
            );
        }
        console.log('submit');
    };

    return (
        <>
            <ModalTitle>Confirm vote</ModalTitle>
            <ModalDescription>
                Make sure you are confident in your choice. This action cannot be undone.
            </ModalDescription>
            <ContentRow>
                <Label>Option:</Label>
                <Label>
                    <FailIcon />
                    <span>Vote Against</span>
                </Label>
            </ContentRow>

            <ContentRow>
                <Label>Voting power</Label>

                <BalanceBlock>
                    <Balance>{aquaBalance} AQUA </Balance>
                    available
                </BalanceBlock>
            </ContentRow>

            <StyledInput
                value={amount}
                onChange={(e) => {
                    onInputChange(e.target.value);
                }}
                postfix={
                    <InputPostfix>
                        <AquaLogo />
                        <span>AQUA</span>
                    </InputPostfix>
                }
            />

            <RangeInput onChange={onRangeChange} value={percent} />

            <ClaimBack>
                You can claim back your AQUA on <ClaimBackDate>Jan. 15, 2022, 3:00</ClaimBackDate>
            </ClaimBack>

            <StyledButton fullWidth onClick={() => onSubmit()} disabled={!amount}>
                CONFIRM VOTE
            </StyledButton>
        </>
    );
};

export default ConfirmVoteModal;
