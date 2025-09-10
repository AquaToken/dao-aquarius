import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { GD_ICE_CODE, GOV_ICE_CODE, ICE_ISSUER } from 'constants/assets';
import { LockerRoutes } from 'constants/routes';

import { getDateString } from 'helpers/date';
import ErrorHandler from 'helpers/error-handler';
import { formatBalance, roundToPrecision } from 'helpers/format-number';
import { createAsset } from 'helpers/token';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { useIsMounted } from 'hooks/useIsMounted';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService, ToastService } from 'services/globalServices';
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';

import { ModalProps } from 'types/modal';

import { flexAllCenter, flexRowSpaceBetween } from 'web/mixins';
import { COLORS } from 'web/styles';

import DIce from 'assets/dice-logo.svg';
import Ice from 'assets/ice-logo.svg';
import Fail from 'assets/icon-fail.svg';
import Success from 'assets/icon-success.svg';

import Button from 'basics/buttons/Button';
import ExternalLink from 'basics/ExternalLink';
import Input from 'basics/inputs/Input';
import RangeInput from 'basics/inputs/RangeInput';
import Select from 'basics/inputs/Select';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import { SimpleProposalOptions } from '../../../pages/GovernanceVoteProposalPage';

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

const IceLogo = styled(Ice)`
    margin-right: 0.8rem;
    height: 3.2rem;
    width: 3.2rem;
`;
const DIceLogo = styled(DIce)`
    margin-right: 0.8rem;
    height: 3.2rem;
    width: 3.2rem;
`;

const StyledInput = styled(Input)`
    margin-top: 1.2rem;
    margin-bottom: 3.3rem;
    flex: 3;
`;

const StyledSelect = styled(Select)`
    margin-top: 1.2rem;
    margin-bottom: 3.3rem;
    flex: 2;
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

const GOV_ICE = createAsset(GOV_ICE_CODE, ICE_ISSUER);
const GD_ICE = createAsset(GD_ICE_CODE, ICE_ISSUER);

const OPTIONS = [{ label: 'governICE', value: GOV_ICE, icon: <IceLogo /> }];

const EXTENDED_OPTIONS = [...OPTIONS, { label: 'gdICE', value: GD_ICE, icon: <DIceLogo /> }];

const ConfirmVoteModal = ({
    params,
    close,
}: ModalProps<{ option: string; key: string; endDate: string; startDate: string }>) => {
    const { account } = useAuthStore();
    const { option, key, endDate } = params;

    const isMounted = useIsMounted();

    const [percent, setPercent] = useState(0);
    const [amount, setAmount] = useState('');
    const [pending, setPending] = useState(false);
    const [targetAsset, setTargetAsset] = useState(GOV_ICE);

    const targetBalance = useMemo(() => account?.getAssetBalance(targetAsset), [targetAsset]);

    const hasTrustLine = targetBalance !== null;
    const hasTargetBalance = targetBalance !== 0;

    const formattedBalance = hasTrustLine && formatBalance(targetBalance);

    const unlockDate = new Date(endDate).getTime() + 60 * 60 * 1000;

    const hasGDIce = account?.getAssetBalance(GD_ICE) !== null;

    useEffect(() => {
        setAmount('');
        setPercent(0);
    }, [targetAsset]);

    const onRangeChange = percent => {
        setPercent(percent);

        const amountValue = (targetBalance * percent) / 100;

        setAmount(roundToPrecision(amountValue, 7));
    };

    const onInputChange = value => {
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
                `The value must be less or equal than ${formattedBalance} ${targetAsset.code}`,
            );
            return;
        }
        if (Number(amount) < MINIMUM_ICE_AMOUNT) {
            ToastService.showErrorToast(
                `The value must be greater than ${MINIMUM_ICE_AMOUNT} ${targetAsset.code}`,
            );
            return;
        }
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
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
        <ModalWrapper>
            <ModalTitle>Confirm vote</ModalTitle>
            <ModalDescription>
                Your ICE will be locked until the voting ends. Please check the details carefully.
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
                    onChange={e => {
                        onInputChange(e.target.value);
                    }}
                    placeholder="Enter amount"
                    disabled={!hasTrustLine || !hasTargetBalance}
                    inputMode="decimal"
                />

                <StyledSelect
                    options={hasGDIce ? EXTENDED_OPTIONS : OPTIONS}
                    value={targetAsset}
                    onChange={setTargetAsset}
                    disabled={!hasGDIce}
                />
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

                    <ExternalLink asDiv>
                        <Link to={LockerRoutes.main}>Get ICE</Link>
                    </ExternalLink>
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
        </ModalWrapper>
    );
};

export default ConfirmVoteModal;
