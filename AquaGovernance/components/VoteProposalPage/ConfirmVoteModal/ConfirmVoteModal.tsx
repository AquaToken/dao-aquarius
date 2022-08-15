import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
    ModalDescription,
    ModalProps,
    ModalTitle,
} from '../../../../common/modals/atoms/ModalAtoms';
import styled, { css } from 'styled-components';
import { flexAllCenter, flexRowSpaceBetween } from '../../../../common/mixins';
import { COLORS } from '../../../../common/styles';
import Fail from '../../../../common/assets/img/icon-fail.svg';
import Success from '../../../../common/assets/img/icon-success.svg';
import Aqua from '../../../../common/assets/img/aqua-logo-small.svg';
import Ice from '../../../../common/assets/img/ice-logo.svg';
import useAuthStore from '../../../../common/store/authStore/useAuthStore';
import Input from '../../../../common/basics/Input';
import RangeInput from '../../../../common/basics/RangeInput';
import Button from '../../../../common/basics/Button';
import {
    ModalService,
    StellarService,
    ToastService,
} from '../../../../common/services/globalServices';
import { formatBalance, getDateString, roundToPrecision } from '../../../../common/helpers/helpers';
import ExternalLink from '../../../../common/basics/ExternalLink';
import GetAquaModal from '../../../../common/modals/GetAquaModal/GetAquaModal';
import { SimpleProposalOptions } from '../VoteProposalPage';
import { useIsMounted } from '../../../../common/hooks/useIsMounted';
import ErrorHandler from '../../../../common/helpers/error-handler';
import {
    BuildSignAndSubmitStatuses,
    openApp,
} from '../../../../common/services/wallet-connect.service';
import { LoginTypes } from '../../../../common/store/authStore/types';
import {
    AQUA_CODE,
    AQUA_ISSUER,
    GOV_ICE_CODE,
    ICE_ISSUER,
} from '../../../../common/services/stellar.service';
import Select from '../../../../common/basics/Select';

const MINIMUM_AMOUNT = 0.0000001;
const MINIMUM_ICE_AMOUNT = 10;

const ContentRow = styled.div`
    ${flexRowSpaceBetween};
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

const iconStyles = css`
    height: 1.6rem;
    width: 1.6rem;
    margin-right: 0.5rem;
`;

const FailIcon = styled(Fail)`
    ${iconStyles};
`;

const SuccessIcon = styled(Success)`
    ${iconStyles};
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

const AquaLogo = styled(Aqua)`
    margin-right: 0.8rem;
    height: 3.2rem;
    width: 3.2rem;
`;

const IceLogo = styled(Ice)`
    margin-right: 0.8rem;
    height: 3.2rem;
    width: 3.2rem;
`;

const StyledInput = styled(Input)`
    margin-top: 1.2rem;
    margin-bottom: 3.3rem;
    flex: 2;
`;

const StyledSelect = styled(Select)`
    margin-top: 1.2rem;
    margin-bottom: 3.3rem;
    flex: 1;
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

const RATIO = 2;
const AQUA = StellarService.createAsset(AQUA_CODE, AQUA_ISSUER);
const GOV_ICE = StellarService.createAsset(GOV_ICE_CODE, ICE_ISSUER);

const OPTIONS = [
    { label: 'AQUA', value: AQUA, icon: <AquaLogo /> },
    { label: 'ICE', value: GOV_ICE, icon: <IceLogo /> },
];

const ConfirmVoteModal = ({
    params,
    close,
}: ModalProps<{ option: string; key: string; endDate: string; startDate: string }>) => {
    const { account } = useAuthStore();
    const { option, key, endDate, startDate } = params;

    const isMounted = useIsMounted();

    const [percent, setPercent] = useState(0);
    const [amount, setAmount] = useState('');
    const [pending, setPending] = useState(false);
    const [targetAsset, setTargetAsset] = useState(AQUA);

    const targetBalance = useMemo(() => {
        return account?.getAssetBalance(targetAsset);
    }, [targetAsset]);

    const hasTrustLine = targetBalance !== null;
    const hasTargetBalance = targetBalance !== 0;

    const formattedBalance = hasTrustLine && formatBalance(targetBalance);

    const now = Date.now();
    const unlockDate =
        targetAsset === AQUA
            ? new Date(endDate).getTime() + RATIO * (now - new Date(startDate).getTime())
            : new Date(endDate).getTime() + 60 * 60 * 1000;

    useEffect(() => {
        setAmount('');
        setPercent(0);
    }, [targetAsset]);

    const onRangeChange = (percent) => {
        setPercent(percent);

        const amountValue = (targetBalance * percent) / 100;

        setAmount(roundToPrecision(amountValue, 7));
    };

    const onInputChange = (value) => {
        if (Number.isNaN(Number(value))) {
            return;
        }
        setAmount(value);

        const percentValue = roundToPrecision((Number(value) / Number(targetBalance)) * 100, 2);

        setPercent(+percentValue);
    };

    const onSubmit = async () => {
        if (pending) {
            return;
        }
        if (Number(amount) > Number(targetBalance)) {
            ToastService.showErrorToast(
                `The value must be less or equal than ${formattedBalance} AQUA`,
            );
            return;
        }
        if (Number(amount) < MINIMUM_AMOUNT) {
            ToastService.showErrorToast(
                `The value must be greater than ${MINIMUM_AMOUNT.toFixed(7)} AQUA`,
            );
            return;
        }
        if (Number(amount) < MINIMUM_ICE_AMOUNT && targetAsset === GOV_ICE) {
            ToastService.showErrorToast(
                `The value must be greater than ${MINIMUM_ICE_AMOUNT} ${GOV_ICE.code}`,
            );
            return;
        }
        if (account.authType === LoginTypes.walletConnect) {
            openApp();
        }
        try {
            setPending(true);
            const voteOp = StellarService.createVoteOperation(
                account.accountId(),
                key,
                amount,
                unlockDate,
                targetAsset,
            );
            const tx = await StellarService.buildTx(account, voteOp);
            const processedTx = await StellarService.processIceTx(tx, targetAsset);
            const result = await account.signAndSubmitTx(processedTx);
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
            ToastService.showSuccessToast('Your vote has been cast');
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            if (isMounted.current) {
                setPending(false);
            }
        }
    };

    return (
        <>
            <ModalTitle>Confirm vote</ModalTitle>
            <ModalDescription>
                Your AQUA will be locked until the voting ends. Please check the details carefully.
            </ModalDescription>
            <ContentRow>
                <Label>Your vote:</Label>
                <Label>
                    {option === SimpleProposalOptions.voteAgainst ? <FailIcon /> : <SuccessIcon />}
                    <span>{option}</span>
                </Label>
            </ContentRow>

            <ContentRow>
                <Label>Voting power</Label>

                {hasTrustLine ? (
                    <BalanceBlock>
                        <Balance onClick={() => onRangeChange(100)}>
                            {formattedBalance} {targetAsset.code}{' '}
                        </Balance>
                        available
                    </BalanceBlock>
                ) : (
                    <BalanceBlock>You don&apos;t have {targetAsset.code} trustline</BalanceBlock>
                )}
            </ContentRow>

            <ContentRow>
                <StyledInput
                    value={amount}
                    onChange={(e) => {
                        onInputChange(e.target.value);
                    }}
                    placeholder="Enter amount"
                    disabled={!hasTrustLine || !hasTargetBalance}
                />

                <StyledSelect options={OPTIONS} value={targetAsset} onChange={setTargetAsset} />
            </ContentRow>

            <RangeInput
                onChange={onRangeChange}
                value={percent}
                disabled={!hasTrustLine || !hasTargetBalance}
            />

            {hasTrustLine && hasTargetBalance ? (
                <ClaimBack>
                    You will be able to claim back your {targetAsset.code} on{' '}
                    <ClaimBackDate>{getDateString(unlockDate, { withTime: true })}</ClaimBackDate>
                </ClaimBack>
            ) : (
                <GetAquaBlock>
                    <GetAquaLabel>You don&apos;t have enough {targetAsset.code}</GetAquaLabel>
                    {targetAsset === AQUA ? (
                        <ExternalLink onClick={() => ModalService.openModal(GetAquaModal, {})}>
                            <GetAquaLink>Get AQUA</GetAquaLink>
                        </ExternalLink>
                    ) : (
                        <ExternalLink href="https://locker.aqua.network">Get ICE</ExternalLink>
                    )}
                </GetAquaBlock>
            )}

            <StyledButton
                fullWidth
                onClick={() => onSubmit()}
                disabled={!amount || !Number(amount)}
                pending={pending}
            >
                SUBMIT VOTE
            </StyledButton>
        </>
    );
};

export default ConfirmVoteModal;
