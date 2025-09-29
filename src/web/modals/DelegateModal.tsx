import * as React from 'react';
import { useEffect, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

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

import { flexAllCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Ice from 'assets/ice-logo.svg';
import IconProfile from 'assets/icon-profile.svg';

import AssetLogo from 'basics/AssetLogo';
import { Button } from 'basics/buttons';
import { Input, RangeInput, Select, ToggleGroup } from 'basics/inputs';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import PublicKeyWithIcon from 'components/PublicKeyWithIcon';

import { GOV_ICE, UP_ICE } from 'pages/vote/components/MainPage/MainPage';

const DelegateButton = styled(Button)`
    margin-top: 4rem;
`;

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
    color: ${COLORS.textTertiary};
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
    color: ${COLORS.purple500};
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
    background: ${COLORS.gray100};
    border-radius: 50%;
    ${flexAllCenter};
    color: ${COLORS.gray300};

    svg {
        margin: 0 !important;
        height: 1.2rem;
        width: 1.2rem;
    }
`;

const PublicKeyWithIconStyled = styled(PublicKeyWithIcon)`
    color: ${COLORS.textGray};
    margin-left: 1rem;
`;

const MINIMUM_AMOUNT = 10;

const OPTIONS = [
    {
        value: UP_ICE,
        label: (
            <SelectItem>
                {UP_ICE.code} <AssetLogo asset={UP_ICE} />
            </SelectItem>
        ),
    },
    {
        value: GOV_ICE,
        label: (
            <SelectItem>
                {GOV_ICE.code} <AssetLogo asset={GOV_ICE} />
            </SelectItem>
        ),
    },
];

const DelegateModal = ({
    params,
    confirm,
}: ModalProps<{ delegatee?: Delegatee; delegatees: Delegatee[] }>) => {
    const { delegatee, delegatees } = params;

    const isKnownDelegatee =
        delegatee && !!delegatees.find(({ account }) => account === delegatee.account);

    const [selectedToken, setSelectedToken] = useState<ClassicToken>(UP_ICE);
    const [amount, setAmount] = useState('');
    const [percent, setPercent] = useState(0);
    const [pending, setPending] = useState(false);
    const [isManualInput, setIsManualInput] = useState<boolean>(!!delegatee && !isKnownDelegatee);
    const [destination, setDestination] = useState<string>(delegatee?.account ?? '');

    const { account } = useAuthStore();

    const availableBalance = account.getAvailableForSwapBalance(selectedToken);

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

        const newAmount = ((availableBalance * percent) / 100).toFixed(7);

        setAmount(newAmount);
    };

    const onAmountChange = (amount: string) => {
        setAmount(amount);

        const newPercent = ((Number(amount) / availableBalance) * 100).toFixed(2);

        setPercent(Number(newPercent));
    };

    const onSubmit = async () => {
        try {
            if (Number(amount) < MINIMUM_AMOUNT) {
                ToastService.showErrorToast(
                    `The value must be greater than ${MINIMUM_AMOUNT.toFixed(7)} ${
                        selectedToken.code
                    }`,
                );
                return;
            }

            if (+amount > +account.getAssetBalance(selectedToken)) {
                ToastService.showErrorToast(`Insufficient ${selectedToken.code} balance`);
                return;
            }

            if (isManualInput && !isValidPublicKey(destination)) {
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
            const tx = await StellarService.tx.createDelegateTx(
                account,
                selectedToken,
                destination,
                amount,
            );
            const processedTx = await processIceTx(tx, selectedToken);
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
        <ModalWrapper $noScroll>
            <ModalTitle>Delegate my ICE</ModalTitle>

            <ModalDescription>
                Put your ICE under the control of a trusted delegate
            </ModalDescription>

            <FormRow>
                <Balance>
                    Available:{' '}
                    <BalanceClickable onClick={() => onAmountChange(availableBalance.toFixed(7))}>
                        {formatBalance(availableBalance)}
                    </BalanceClickable>
                    {selectedToken.code}
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
                <Select options={OPTIONS} value={selectedToken} onChange={setSelectedToken} />
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
                                            height={24}
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

            <DelegateButton
                isBig
                fullWidth
                onClick={() => onSubmit()}
                disabled={!Number(amount) || !destination}
                pending={pending}
            >
                Delegate
            </DelegateButton>
        </ModalWrapper>
    );
};

export default DelegateModal;
