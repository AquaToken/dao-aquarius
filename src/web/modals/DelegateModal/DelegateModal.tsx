import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { processIceTx } from 'api/ice';

import ErrorHandler from 'helpers/error-handler';
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

import TokenAmountFormField from 'basics/form/TokenAmountFormField';
import { Input, Select, ToggleGroup } from 'basics/inputs';
import { ModalDescription, ModalTitle, ModalWrapper, StickyButtonWrapper } from 'basics/ModalAtoms';

import { GOV_ICE, UP_ICE } from 'pages/vote/components/MainPage/MainPage';

import {
    Amounts,
    Avatar,
    DelegateButton,
    FormRow,
    IconWrapper,
    Labels,
    PublicKeyWithIconStyled,
    SelectItem,
} from './DelegateModal.styled';

const MINIMUM_AMOUNT = 10;

type DelegationInput = {
    token: ClassicToken;
    amount: string;
};

const DelegateModal = ({
    params,
    confirm,
}: ModalProps<{ delegatee?: Delegatee; delegatees: Delegatee[] }>) => {
    const { delegatee, delegatees } = params;

    const isKnownDelegatee =
        delegatee &&
        !!delegatees.find(({ account: itemAccount }) => itemAccount === delegatee.account);
    const [upvoteAmount, setUpvoteAmount] = useState('');
    const [governAmount, setGovernAmount] = useState('');
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

    const delegations: DelegationInput[] = useMemo(
        () =>
            [
                { token: UP_ICE, amount: upvoteAmount },
                { token: GOV_ICE, amount: governAmount },
            ].filter(({ amount }) => Number(amount) > 0),
        [governAmount, upvoteAmount],
    );

    const validateDelegations = () => {
        if (!delegations.length) {
            ToastService.showErrorToast('Enter amount for at least one token');
            return false;
        }

        for (const { token, amount } of delegations) {
            if (Number(amount) < MINIMUM_AMOUNT) {
                ToastService.showErrorToast(
                    `The value must be greater than ${MINIMUM_AMOUNT.toFixed(7)} ${token.code}`,
                );
                return false;
            }

            const availableBalance = account.getAvailableForSwapBalance(token);
            if (Number(amount) > availableBalance) {
                ToastService.showErrorToast(`Insufficient ${token.code} balance`);
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
        <ModalWrapper>
            <ModalTitle>Delegate my ICE</ModalTitle>

            <ModalDescription>
                Put your ICE under the control of a trusted delegate
            </ModalDescription>

            <Amounts>
                <TokenAmountFormField
                    asset={UP_ICE}
                    amount={upvoteAmount}
                    setAmount={setUpvoteAmount}
                    balance={account.getAvailableForSwapBalance(UP_ICE)}
                    isBalanceClickable
                    withPercentButtons
                    disabled={pending}
                    isEmbedded
                />

                <TokenAmountFormField
                    asset={GOV_ICE}
                    amount={governAmount}
                    setAmount={setGovernAmount}
                    balance={account.getAvailableForSwapBalance(GOV_ICE)}
                    isBalanceClickable
                    withPercentButtons
                    disabled={pending}
                    isEmbedded
                />
            </Amounts>

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
