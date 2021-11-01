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
import { ModalService, ToastService } from '../../../../common/services/globalServices';
import { formatBalance, roundToPrecision } from '../../../../common/helpers/helpers';
import ExternalLink from '../../../../common/basics/ExternalLink';
import GetAquaModal from '../../../../common/modals/GetAquaModal/GetAquaModal';

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
    cursor: pointer;
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

const GetAquaBlock = styled.div`
    ${flexRowSpaceBetween};
    height: 6.8rem;
    border-radius: 1rem;
    background: ${COLORS.lightGray};
    padding: 0 3.2rem;
    margin-top: 4.1rem;
`;

const GetAquaLabel = styled.span`
    color: ${COLORS.grayText};
`;

const GetAquaLink = styled.div`
    font-size: 1.4rem;
`;

const ConfirmVoteModal = ({ params }: ModalProps<{ option: any }>) => {
    const { account } = useAuthStore();

    const [percent, setPercent] = useState(0);
    const [amount, setAmount] = useState('');

    const aquaBalance = account.getAquaBalance();

    const hasTrustLine = aquaBalance !== null;
    const hasAqua = aquaBalance !== 0;

    const formattedAquaBalance = hasTrustLine && formatBalance(aquaBalance);

    const onRangeChange = (percent) => {
        setPercent(percent);

        const amountValue = (aquaBalance * percent) / 100;

        setAmount(roundToPrecision(amountValue, 7));
    };

    const onInputChange = (value) => {
        if (Number.isNaN(Number(value))) {
            return;
        }
        setAmount(value);

        const percentValue = roundToPrecision((Number(value) / Number(aquaBalance)) * 100, 2);

        setPercent(+percentValue);
    };

    const onSubmit = () => {
        if (Number(amount) > Number(aquaBalance)) {
            ToastService.showErrorToast(
                `The value must be less or equal than ${formattedAquaBalance} AQUA`,
            );
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

                {hasTrustLine ? (
                    <BalanceBlock>
                        <Balance onClick={() => onRangeChange(100)}>
                            {formattedAquaBalance} AQUA{' '}
                        </Balance>
                        available
                    </BalanceBlock>
                ) : (
                    <BalanceBlock>You don’t have AQUA trustline</BalanceBlock>
                )}
            </ContentRow>

            <StyledInput
                value={amount}
                onChange={(e) => {
                    onInputChange(e.target.value);
                }}
                placeholder="Enter voting power"
                postfix={
                    <InputPostfix>
                        <AquaLogo />
                        <span>AQUA</span>
                    </InputPostfix>
                }
                disabled={!hasTrustLine || !hasAqua}
            />

            <RangeInput
                onChange={onRangeChange}
                value={percent}
                disabled={!hasTrustLine || !hasAqua}
            />

            {hasTrustLine && hasAqua ? (
                <ClaimBack>
                    You can claim back your AQUA on{' '}
                    <ClaimBackDate>Jan. 15, 2022, 3:00</ClaimBackDate>
                </ClaimBack>
            ) : (
                <GetAquaBlock>
                    <GetAquaLabel>You don&apos;t have enough AQUA</GetAquaLabel>
                    <ExternalLink onClick={() => ModalService.openModal(GetAquaModal, {})}>
                        <GetAquaLink>Get AQUA</GetAquaLink>
                    </ExternalLink>
                </GetAquaBlock>
            )}

            <StyledButton fullWidth onClick={() => onSubmit()} disabled={!amount}>
                CONFIRM VOTE
            </StyledButton>
        </>
    );
};

export default ConfirmVoteModal;
