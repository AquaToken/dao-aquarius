import * as React from 'react';
import { useEffect, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

import { ICE_ISSUER, UP_ICE_CODE } from 'constants/assets';

import ErrorHandler from 'helpers/error-handler';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService, ToastService } from 'services/globalServices';
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';

import { Delegatee } from 'types/delegate';
import { ModalProps } from 'types/modal';

import { flexAllCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Ice from 'assets/ice-logo.svg';
import IconProfile from 'assets/icon-profile.svg';

import { Button } from 'basics/buttons';
import { Input, RangeInput, Select, ToggleGroup } from 'basics/inputs';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';
import PublicKeyWithIcon from 'basics/PublicKeyWithIcon';

import { UP_ICE } from 'pages/vote/components/MainPage/MainPage';

const IceLogo = styled(Ice)`
    height: 1.8rem;
    width: 1.8rem;
    margin-right: 0.5rem;
`;

const FormRow = styled.div`
    display: flex;
    margin: 8rem 0 4rem;
    position: relative;
`;

const Balance = styled.div`
    position: absolute;
    bottom: calc(100% + 1.2rem);
    right: 0;
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.paragraphText};
    display: flex;
    align-items: center;

    svg {
        margin-left: 0.4rem;
    }

    ${respondDown(Breakpoints.sm)`
        font-size: 1.2rem;
    `}
`;

const Labels = styled.div`
    position: absolute;
    bottom: calc(100% + 1.2rem);
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const BalanceClickable = styled.span`
    color: ${COLORS.purple};
    cursor: pointer;
    margin-left: 0.4rem;
    margin-right: 0.4rem;
`;

const SelectItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

const Avatar = styled.img`
    border-radius: 50%;
`;

const IconWrapper = styled.div`
    height: 2.4rem;
    width: 2.4rem;
    background: ${COLORS.gray};
    border-radius: 50%;
    ${flexAllCenter};
    color: ${COLORS.lavenderGray};

    svg {
        margin: 0;
        height: 1.2rem;
        width: 1.2rem;
    }
`;

const PublicKeyWithIconStyled = styled(PublicKeyWithIcon)`
    color: ${COLORS.grayText};
    margin-left: 1rem;
`;

const MINIMUM_AMOUNT = 10;

const DelegateModal = ({
    params,
    confirm,
}: ModalProps<{ delegatee?: Delegatee; delegatees: Delegatee[] }>) => {
    const { delegatee, delegatees } = params;

    const isKnownDelegatee =
        delegatee && !!delegatees.find(({ account }) => account === delegatee.account);

    const [amount, setAmount] = useState('');
    const [percent, setPercent] = useState(0);
    const [pending, setPending] = useState(false);
    const [isManualInput, setIsManualInput] = useState<boolean>(!!delegatee && !isKnownDelegatee);
    const [destination, setDestination] = useState<string>(delegatee?.account ?? '');

    const { account } = useAuthStore();

    const upvoteIce = StellarService.createAsset(UP_ICE_CODE, ICE_ISSUER);
    const upvoteIceBalance = account.getAvailableForSwapBalance(upvoteIce);

    useEffect(() => {
        if (!delegatee) {
            return;
        }
        if (isManualInput) {
            setDestination(isKnownDelegatee ? '' : delegatee.account);
        } else {
            setDestination(isKnownDelegatee ? delegatee.account : '');
        }
    }, [isManualInput, isKnownDelegatee]);

    const onPercentChange = (percent: number) => {
        setPercent(percent);

        const newAmount = ((upvoteIceBalance * percent) / 100).toFixed(7);

        setAmount(newAmount);
    };

    const onAmountChange = (amount: string) => {
        setAmount(amount);

        const newPercent = ((Number(amount) / upvoteIceBalance) * 100).toFixed(2);

        setPercent(Number(newPercent));
    };

    const onSubmit = async () => {
        try {
            if (Number(amount) < MINIMUM_AMOUNT) {
                ToastService.showErrorToast(
                    `The value must be greater than ${MINIMUM_AMOUNT.toFixed(7)} upvoteICE`,
                );
                return;
            }

            if (+amount > +account.getAssetBalance(UP_ICE)) {
                ToastService.showErrorToast('Insufficient upvoteICE balance');
                return;
            }

            if (isManualInput && !StellarService.isValidPublicKey(destination)) {
                ToastService.showErrorToast('Invalid destination address');
                return;
            }

            if (destination === account.accountId()) {
                ToastService.showErrorToast('You cannot delegate tokens to yourself');
                return;
            }

            if (account.authType === LoginTypes.walletConnect) {
                openCurrentWalletIfExist();
            }
            setPending(true);
            const tx = await StellarService.createDelegateTx(account, destination, amount);
            const processedTx = await StellarService.processIceTx(tx, UP_ICE);
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

            <FormRow>
                <Balance>
                    Available:{' '}
                    <BalanceClickable onClick={() => onAmountChange(upvoteIceBalance.toFixed(7))}>
                        {formatBalance(upvoteIceBalance)}
                    </BalanceClickable>
                    {UP_ICE_CODE}
                </Balance>
                <NumericFormat
                    value={amount}
                    onValueChange={value => onAmountChange(value.value)}
                    placeholder="Enter amount"
                    customInput={Input}
                    label="ICE amount"
                    postfix={<IceLogo />}
                    inputMode="decimal"
                    allowedDecimalSeparators={[',']}
                    thousandSeparator=","
                    decimalScale={7}
                    allowNegative={false}
                />
            </FormRow>

            <RangeInput onChange={onPercentChange} value={percent} />

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
                    />
                </Labels>

                {isManualInput ? (
                    <Input
                        placeholder="G..."
                        value={destination}
                        onChange={({ target }) => setDestination(target.value)}
                    />
                ) : (
                    <Select
                        options={delegatees.map(delegate => ({
                            label: (
                                <SelectItem>
                                    {delegate.image ? (
                                        <Avatar
                                            src={delegate.image}
                                            alt={delegate.name}
                                            width={24}
                                        />
                                    ) : (
                                        <IconWrapper>
                                            <IconProfile />
                                        </IconWrapper>
                                    )}{' '}
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

            <Button
                isBig
                fullWidth
                onClick={() => onSubmit()}
                disabled={!Number(amount) || !destination}
                pending={pending}
            >
                Delegate
            </Button>
        </ModalWrapper>
    );
};

export default DelegateModal;
