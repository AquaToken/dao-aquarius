import BigNumber from 'bignumber.js';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { processIceTx } from 'api/ice';

import ErrorHandler from 'helpers/error-handler';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import { StellarService, ToastService } from 'services/globalServices';
import { isValidPublicKey } from 'services/stellar/utils/validators';

import { Delegatee } from 'types/delegate';
import { ModalProps } from 'types/modal';
import { ClassicToken } from 'types/token';

import IconProfile from 'assets/icons/nav/icon-profile.svg';

import TokenAmountFormField, { TokenAmountPickerOption } from 'basics/form/TokenAmountFormField';
import { Input, Select, ToggleGroup } from 'basics/inputs';
import { ModalDescription, ModalTitle, ModalWrapper, StickyButtonWrapper } from 'basics/ModalAtoms';

import { GOV_ICE, UP_ICE } from 'pages/vote/components/MainPage/MainPage';

import {
    Avatar,
    BalanceTooltipDivider,
    BalanceTooltipInner,
    BalanceTooltipLabel,
    BalanceTooltipRow,
    BalanceTooltipTitle,
    BalanceTooltipTotalLabel,
    DelegateButton,
    DelegationDescription,
    DelegationDescriptionContent,
    DelegationDivider,
    DelegationDescriptionIcon,
    DelegationDescriptionText,
    DelegationDescriptionTitle,
    DelegationInfo,
    FormRow,
    IconWrapper,
    Labels,
    PublicKeyWithIconStyled,
    SelectItem,
} from './DelegateModal.styled';

const MINIMUM_AMOUNT = 10;
const DECIMAL_PLACES = 7;

type DelegationMode = 'upvote' | 'govern' | 'both';

type DelegationInput = {
    token: ClassicToken;
    amount: string;
};

const DELEGATION_OPTIONS: TokenAmountPickerOption[] = [
    {
        id: 'upvote',
        label: 'upvoteICE',
        assets: [UP_ICE],
    },
    {
        id: 'govern',
        label: 'governICE',
        assets: [GOV_ICE],
    },
    {
        id: 'both',
        label: 'ICE Tokens',
        assets: [UP_ICE, GOV_ICE],
    },
];

const toStellarAmount = (amount: BigNumber.Value) =>
    new BigNumber(amount || 0).decimalPlaces(DECIMAL_PLACES, BigNumber.ROUND_DOWN).toFixed();

const getDualDelegationAmounts = (
    totalAmount: BigNumber,
    upvoteAvailable: number,
    governAvailable: number,
) => {
    if (totalAmount.lte(0)) {
        const zero = new BigNumber(0);
        return { upvoteAmount: zero, governAmount: zero };
    }

    const upvoteCapacity = new BigNumber(upvoteAvailable);
    const governCapacity = new BigNumber(governAvailable);
    const halfAmount = totalAmount.div(2).decimalPlaces(DECIMAL_PLACES, BigNumber.ROUND_DOWN);

    let upvoteAmount = BigNumber.min(halfAmount, upvoteCapacity);
    let governAmount = BigNumber.min(halfAmount, governCapacity);
    let remainingAmount = totalAmount.minus(upvoteAmount).minus(governAmount);

    if (remainingAmount.gt(0)) {
        const upvoteExtra = BigNumber.min(remainingAmount, upvoteCapacity.minus(upvoteAmount));
        upvoteAmount = upvoteAmount.plus(upvoteExtra);
        remainingAmount = remainingAmount.minus(upvoteExtra);
    }

    if (remainingAmount.gt(0)) {
        const governExtra = BigNumber.min(remainingAmount, governCapacity.minus(governAmount));
        governAmount = governAmount.plus(governExtra);
    }

    return {
        upvoteAmount: upvoteAmount.decimalPlaces(DECIMAL_PLACES, BigNumber.ROUND_DOWN),
        governAmount: governAmount.decimalPlaces(DECIMAL_PLACES, BigNumber.ROUND_DOWN),
    };
};

const DelegateModal = ({
    params,
    confirm,
}: ModalProps<{ delegatee?: Delegatee; delegatees: Delegatee[] }>) => {
    const { delegatee, delegatees } = params;

    const isKnownDelegatee =
        delegatee &&
        !!delegatees.find(({ account: itemAccount }) => itemAccount === delegatee.account);
    const [amount, setAmount] = useState('');
    const [delegationMode, setDelegationMode] = useState<DelegationMode>('both');
    const [pending, setPending] = useState(false);
    const [isManualInput, setIsManualInput] = useState<boolean>(!!delegatee && !isKnownDelegatee);
    const [destination, setDestination] = useState<string>(delegatee?.account ?? '');

    const { account } = useAuthStore();

    useEffect(() => {
        if (!delegatee) {
            return;
        }

        if (isManualInput) {
            setDestination(isKnownDelegatee ? '' : delegatee.account);
        } else {
            setDestination(isKnownDelegatee ? delegatee.account : '');
        }
    }, [delegatee, isKnownDelegatee, isManualInput]);

    const destinationValue = destination.trim();
    const upvoteAvailable = useMemo(() => account.getAvailableForSwapBalance(UP_ICE), [account]);
    const governAvailable = useMemo(() => account.getAvailableForSwapBalance(GOV_ICE), [account]);
    // In `both` mode we still need a single asset for AssetPicker-internal logic in
    // TokenAmountFormField (decimals, code). UP_ICE is a safe placeholder because both
    // ICE tokens share the same decimals and the input route bypasses asset.code.
    const selectedAsset = delegationMode === 'govern' ? GOV_ICE : UP_ICE;
    const availableAmount = useMemo(() => {
        if (delegationMode === 'upvote') {
            return new BigNumber(upvoteAvailable);
        }

        if (delegationMode === 'govern') {
            return new BigNumber(governAvailable);
        }

        return new BigNumber(upvoteAvailable)
            .plus(governAvailable)
            .decimalPlaces(DECIMAL_PLACES, BigNumber.ROUND_DOWN);
    }, [delegationMode, governAvailable, upvoteAvailable]);

    const inputAmount = useMemo(
        () => new BigNumber(amount || 0).decimalPlaces(DECIMAL_PLACES, BigNumber.ROUND_DOWN),
        [amount],
    );
    const dualDelegationAmounts = useMemo(
        () => getDualDelegationAmounts(inputAmount, upvoteAvailable, governAvailable),
        [governAvailable, inputAmount, upvoteAvailable],
    );

    const delegations: DelegationInput[] = useMemo(() => {
        if (delegationMode === 'upvote') {
            return [{ token: UP_ICE, amount: toStellarAmount(inputAmount) }].filter(
                ({ amount }) => Number(amount) > 0,
            );
        }

        if (delegationMode === 'govern') {
            return [{ token: GOV_ICE, amount: toStellarAmount(inputAmount) }].filter(
                ({ amount }) => Number(amount) > 0,
            );
        }

        return [
            { token: UP_ICE, amount: toStellarAmount(dualDelegationAmounts.upvoteAmount) },
            { token: GOV_ICE, amount: toStellarAmount(dualDelegationAmounts.governAmount) },
        ].filter(({ amount }) => Number(amount) > 0);
    }, [delegationMode, dualDelegationAmounts, inputAmount]);

    const splitSummary = useMemo(() => {
        if (delegationMode !== 'both') {
            return null;
        }
        return `${formatBalance(
            dualDelegationAmounts.upvoteAmount.toFixed(),
            true,
        )} upvoteICE + ${formatBalance(
            dualDelegationAmounts.governAmount.toFixed(),
            true,
        )} governICE`;
    }, [delegationMode, dualDelegationAmounts]);

    const validateDelegations = () => {
        if (!delegations.length) {
            ToastService.showErrorToast('Enter amount');
            return false;
        }

        if (inputAmount.gt(availableAmount)) {
            const tokenCode = delegationMode === 'both' ? 'ICE Tokens' : selectedAsset.code;
            ToastService.showErrorToast(`Insufficient ${tokenCode} balance`);
            return false;
        }

        // In `both` mode amounts are auto-clamped to capacity by
        // getDualDelegationAmounts, so an extra per-token availability check would be
        // dead. We still enforce the per-token MINIMUM_AMOUNT.
        for (const { token, amount } of delegations) {
            if (Number(amount) < MINIMUM_AMOUNT) {
                ToastService.showErrorToast(
                    delegationMode === 'both'
                        ? `Each delegated token must be at least ${MINIMUM_AMOUNT} ICE`
                        : `The value must be greater than ${MINIMUM_AMOUNT.toFixed(7)} ${token.code}`,
                );
                return false;
            }
        }

        return true;
    };

    const onSubmit = async () => {
        try {
            if (!destinationValue) {
                ToastService.showErrorToast('Select a destination');
                return;
            }

            if (!validateDelegations()) {
                return;
            }

            if (isManualInput && !isValidPublicKey(destinationValue)) {
                ToastService.showErrorToast('Invalid destination address');
                return;
            }

            if (destinationValue === account.accountId()) {
                ToastService.showErrorToast('You cannot delegate tokens to yourself');
                return;
            }

            if (account.authType === LoginTypes.walletConnect) {
                openCurrentWalletIfExist();
            }

            setPending(true);
            let processedTx = await StellarService.tx.createDelegateTx(
                account,
                destinationValue,
                delegations,
            );

            for (const { token } of delegations) {
                processedTx = await processIceTx(processedTx, token);
            }

            const result = await account.signAndSubmitTx(processedTx);
            setPending(false);

            if (
                (result as { status: BuildSignAndSubmitStatuses }).status ===
                BuildSignAndSubmitStatuses.pending
            ) {
                ToastService.showSuccessToast('More signatures required to complete');
                confirm();
                return;
            }

            ToastService.showSuccessToast('Your tokens delegated successfully');
            confirm();
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            setPending(false);
        }
    };

    return (
        <ModalWrapper $width="62.4rem">
            <ModalTitle>Delegate my ICE</ModalTitle>

            <ModalDescription>
                Put your ICE under the control of a trusted delegate
            </ModalDescription>

            <TokenAmountFormField
                asset={selectedAsset}
                amount={amount}
                setAmount={setAmount}
                balance={Number(availableAmount.toFixed())}
                balanceLabel="Available: "
                isBalanceClickable
                withPercentButtons
                disabled={pending}
                isEmbedded
                pickerOptions={DELEGATION_OPTIONS}
                selectedPickerOptionId={delegationMode}
                onPickerOptionChange={optionId => setDelegationMode(optionId as DelegationMode)}
                amountDetails={splitSummary}
                balanceTooltipContent={
                    delegationMode === 'both' ? (
                        <BalanceTooltipInner>
                            <BalanceTooltipTitle>
                                Delegation is split between upvoteICE and governICE
                            </BalanceTooltipTitle>
                            <BalanceTooltipDivider />
                            <BalanceTooltipLabel>Available:</BalanceTooltipLabel>
                            <BalanceTooltipRow>
                                <span>upvoteICE</span>
                                <span>{formatBalance(upvoteAvailable, true)}</span>
                            </BalanceTooltipRow>
                            <BalanceTooltipRow>
                                <span>governICE</span>
                                <span>{formatBalance(governAvailable, true)}</span>
                            </BalanceTooltipRow>
                            <BalanceTooltipRow>
                                <BalanceTooltipTotalLabel>Total:</BalanceTooltipTotalLabel>
                                <span>{formatBalance(availableAmount.toFixed(), true)}</span>
                            </BalanceTooltipRow>
                        </BalanceTooltipInner>
                    ) : null
                }
            />

            {delegationMode === 'both' && (
                <>
                    <DelegationInfo>
                        <DelegationDescription>
                            <DelegationDescriptionIcon>☝️</DelegationDescriptionIcon>
                            <DelegationDescriptionContent>
                                <DelegationDescriptionTitle>
                                    Your delegation is split between upvoteICE and governICE
                                </DelegationDescriptionTitle>
                                <DelegationDescriptionText>
                                    Distribution between upvoteICE and governICE is performed
                                    automatically.
                                    <br />
                                    To allocate manually, you can make two separate transactions.
                                </DelegationDescriptionText>
                            </DelegationDescriptionContent>
                        </DelegationDescription>
                    </DelegationInfo>
                    <DelegationDivider />
                </>
            )}

            <FormRow>
                <Labels>
                    <label>Delegate to</label>
                    <ToggleGroup
                        options={[
                            { value: false, label: 'Whitelist' },
                            { value: true, label: 'Custom address' },
                        ]}
                        value={isManualInput}
                        onChange={setIsManualInput}
                        disabled={pending}
                    />
                </Labels>

                {isManualInput ? (
                    <Input
                        placeholder="G..."
                        value={destination}
                        onChange={({ target }) => setDestination(target.value)}
                        disabled={pending}
                    />
                ) : (
                    <Select
                        disabled={pending}
                        usePortal
                        options={delegatees.map(delegate => ({
                            label: (
                                <SelectItem>
                                    {delegate.image ? (
                                        <Avatar
                                            src={delegate.image}
                                            alt={delegate.name}
                                            width={24}
                                            height={24}
                                        />
                                    ) : (
                                        <IconWrapper>
                                            <IconProfile />
                                        </IconWrapper>
                                    )}
                                    {delegate.name}
                                    <PublicKeyWithIconStyled
                                        pubKey={delegate.account}
                                        lettersCount={4}
                                        narrowForMobile
                                    />
                                </SelectItem>
                            ),
                            value: delegate.account,
                        }))}
                        value={destination}
                        onChange={setDestination}
                        placeholder="Select a destination"
                    />
                )}
            </FormRow>

            <StickyButtonWrapper>
                <DelegateButton
                    isBig
                    withGradient
                    isRounded
                    fullWidth
                    onClick={onSubmit}
                    disabled={!destinationValue || !delegations.length}
                    pending={pending}
                >
                    Delegate
                </DelegateButton>
            </StickyButtonWrapper>
        </ModalWrapper>
    );
};

export default DelegateModal;
