import BigNumber from 'bignumber.js';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

import { formatBalance } from 'helpers/format-number';

import useOnClickOutside from 'hooks/useOutsideClick';

import useAuthStore from 'store/authStore/useAuthStore';

import { SorobanToken, Token, TokenType } from 'types/token';

import ArrowDown from 'assets/icons/arrows/arrow-down-16.svg';
import Info from 'assets/icons/status/icon-info-16.svg';

import AssetPicker from 'basics/asset-pickers/AssetPicker';
import AssetLogo from 'basics/AssetLogo';
import { BlankInput } from 'basics/inputs';
import { DotsLoader } from 'basics/loaders';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { cardBoxShadow, flexAllCenter, respondDown, textEllipsis } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import PercentButtons from 'pages/swap/components/SwapForm/PercentButtons/PercentButtons';

const Container = styled.div<{
    $isEmbedded?: boolean;
    $disabled: boolean;
    $hasPickerOptions?: boolean;
}>`
    display: flex;
    position: relative;
    min-height: ${({ $hasPickerOptions }) => ($hasPickerOptions ? '16.2rem' : 'auto')};
    padding: ${({ $hasPickerOptions, $isEmbedded }) =>
        $hasPickerOptions ? '3.2rem 4rem' : $isEmbedded ? '2.4rem 3.2rem' : '3.2rem 4rem'};
    background-color: ${COLORS.gray50};
    border-radius: 4rem;
    justify-content: space-between;
    align-items: ${({ $hasPickerOptions }) => ($hasPickerOptions ? 'center' : 'stretch')};
    box-sizing: border-box;
    pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
    opacity: ${({ $disabled }) => ($disabled ? '0.7' : '1')};

    ${respondDown(Breakpoints.sm)`
        padding: 3.2rem 1.6rem;
    `}

    ${({ $hasPickerOptions }) =>
        $hasPickerOptions &&
        respondDown(Breakpoints.sm)`
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            grid-template-areas:
                'label percent'
                'amount picker'
                'details details'
                'balance balance';
            gap: 0.8rem 1.2rem;
            min-height: auto;
        `}
`;

const AmountLabel = styled.span`
    font-size: 1.6rem;
`;

const AmountDetails = styled.div`
    color: ${COLORS.textGray};
    font-size: 1.4rem;
    line-height: 1.6rem;
    white-space: nowrap;

    ${respondDown(Breakpoints.sm)`
        white-space: normal;
    `}
`;

const AmountContainer = styled.div<{ $hasPickerOptions?: boolean }>`
    display: flex;
    flex-direction: column;
    width: 50%;
    min-width: 0;
    gap: ${({ $hasPickerOptions }) => ($hasPickerOptions ? '0.8rem' : '0')};

    ${AmountLabel} {
        line-height: ${({ $hasPickerOptions }) => ($hasPickerOptions ? '1.8rem' : 'normal')};
    }

    input {
        ${({ $hasPickerOptions }) =>
            $hasPickerOptions &&
            `
                height: 4.8rem;
                line-height: 4.8rem;
            `}
    }

    ${({ $hasPickerOptions }) =>
        $hasPickerOptions &&
        respondDown(Breakpoints.sm)`
            display: contents;

            ${AmountLabel} {
                grid-area: label;
            }

            > div:first-of-type {
                grid-area: amount;
                min-width: 0;
            }

            ${AmountDetails} {
                grid-area: details;
                min-width: 0;
            }
        `}
`;

const PickerContainer = styled.div<{ $hasPickerOptions?: boolean }>`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: ${({ $hasPickerOptions }) => ($hasPickerOptions ? '19.1rem' : '50%')};
    gap: ${({ $hasPickerOptions }) => ($hasPickerOptions ? '0.8rem' : '0')};
    align-items: flex-end;

    ${({ $hasPickerOptions }) =>
        $hasPickerOptions &&
        respondDown(Breakpoints.sm)`
            display: contents;

            > div:first-child {
                grid-area: percent;
                justify-self: end;
            }

            > div:nth-child(2) {
                grid-area: picker;
                justify-self: end;
            }

            > div:nth-child(3) {
                grid-area: balance;
                justify-self: end;
            }
        `}
`;

const Balance = styled.div<{ $hasPickerOptions?: boolean }>`
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.textGray};
    display: inline-flex;
    align-items: center;
    gap: ${({ $hasPickerOptions }) => ($hasPickerOptions ? '0.8rem' : '0')};
    white-space: nowrap;
    width: ${({ $hasPickerOptions }) => ($hasPickerOptions ? 'auto' : '100%')};

    svg {
        margin-left: ${({ $hasPickerOptions }) => ($hasPickerOptions ? '0' : '0.4rem')};
    }
`;

const BalanceLabel = styled.span`
    text-align: right;
    ${respondDown(Breakpoints.sm)`
        display: none;
    `}
`;

const BalanceClickable = styled.span`
    cursor: pointer;

    &:hover {
        color: ${COLORS.textPrimary};
    }
`;

const BalanceValue = styled.span<{ $hasPickerOptions?: boolean }>`
    width: ${({ $hasPickerOptions }) => ($hasPickerOptions ? 'auto' : '100%')};
    ${textEllipsis};
    text-align: right;
`;

const TooltipInner = styled.div`
    display: flex;
    flex-direction: column;
    color: ${COLORS.white};
    font-size: 1.2rem;
    line-height: 2rem;
`;

const TooltipRow = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 1.2rem;

    &:last-child:not(:first-child) {
        font-weight: 700;
    }
`;

const TokenPickerContainer = styled.div<{ $disabled?: boolean; $isOpen: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    position: relative;
    min-width: 17.5rem;
    max-width: 17.5rem;
    height: 4.8rem;
    margin: 0;
    padding: 0.8rem 1.6rem 0.8rem 0.8rem;
    border-radius: 3.8rem;
    border: ${({ $isOpen }) =>
        $isOpen ? `0.2rem solid ${COLORS.purple500}` : `0.1rem solid ${COLORS.gray100}`};
    background-color: ${COLORS.white};
    box-sizing: border-box;
    cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
    pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};

    &:hover {
        border-color: ${COLORS.purple500};
    }
`;

const TokenPickerLabel = styled.span`
    min-width: 0;
    color: ${COLORS.textTertiary};
    font-size: 1.6rem;
    line-height: 2.8rem;
    ${textEllipsis};
`;

const TokenPickerArrow = styled(ArrowDown)<{ $isOpen: boolean }>`
    min-width: 1.6rem;
    margin-left: auto;
    transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'none')};
    transition: transform linear 200ms;
    color: ${COLORS.textGray};
`;

const TokenPickerList = styled.div`
    position: absolute;
    right: -0.1rem;
    top: calc(100% + 0.4rem);
    min-width: 100%;
    padding: 0.4rem 0;
    border-radius: 1.2rem;
    background: ${COLORS.white};
    ${cardBoxShadow};
    z-index: 3;
`;

const TokenPickerOption = styled.button`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.8rem 1.2rem;
    border: none;
    background: transparent;
    color: ${COLORS.textTertiary};
    font-size: 1.4rem;
    line-height: 2rem;
    white-space: nowrap;
    cursor: pointer;

    &:hover {
        background-color: ${COLORS.gray50};
    }
`;

const TokenLogos = styled.div`
    display: flex;
    align-items: center;
`;

const TokenLogo = styled.div`
    width: 2.4rem;
    height: 2.4rem;
    border-radius: 50%;
    overflow: hidden;
    border: 0.2rem solid ${COLORS.white};
    background: ${COLORS.white};
    ${flexAllCenter};

    &:not(:first-child) {
        margin-left: -1.6rem;
    }
`;

export type TokenAmountPickerOption = {
    id: string;
    label: string;
    assets: Token[];
};

interface SwapFormRowProps {
    asset: Token;
    setAsset?: (asset: Token) => void;
    amount: string;
    setAmount: (amount: string) => void;
    resetAmount?: () => void;
    usdEquivalent?: React.ReactElement;
    assetsList?: Token[] | null;
    isEmbedded?: boolean;
    balance: number | null;
    withAutoFocus?: boolean;
    amountLabel?: string;
    withPercentButtons?: boolean;
    balanceLabel?: string;
    isBalanceClickable?: boolean;
    withReserveTooltip?: boolean;
    disabled?: boolean;
    pickerOptions?: TokenAmountPickerOption[];
    selectedPickerOptionId?: string;
    onPickerOptionChange?: (optionId: string) => void;
    amountDetails?: React.ReactNode;
    balanceContent?: React.ReactNode;
    balanceTooltipContent?: React.ReactNode;
}

const TokenLogosView = ({ assets }: { assets: Token[] }) => (
    <TokenLogos>
        {assets.map(asset => (
            <TokenLogo key={`${asset.code}-${asset.contract}`}>
                <AssetLogo asset={asset} size={2.4} />
            </TokenLogo>
        ))}
    </TokenLogos>
);

const TokenAmountPicker = ({
    options,
    selectedOptionId,
    onChange,
    disabled,
}: {
    options: TokenAmountPickerOption[];
    selectedOptionId: string;
    onChange: (optionId: string) => void;
    disabled?: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useOnClickOutside(ref, () => setIsOpen(false));

    if (options.length === 0) {
        return null;
    }

    const selectedOption = options.find(({ id }) => id === selectedOptionId) ?? options[0];
    const isDisabled = disabled || options.length < 2;

    const toggleOpen = () => {
        if (!isDisabled) {
            setIsOpen(prev => !prev);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (isDisabled) {
            return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleOpen();
        } else if (event.key === 'Escape' && isOpen) {
            event.preventDefault();
            setIsOpen(false);
        }
    };

    return (
        <TokenPickerContainer
            ref={ref}
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-disabled={isDisabled}
            tabIndex={isDisabled ? -1 : 0}
            $disabled={isDisabled}
            $isOpen={isOpen}
            onClick={toggleOpen}
            onKeyDown={handleKeyDown}
        >
            <TokenLogosView assets={selectedOption.assets} />
            <TokenPickerLabel>{selectedOption.label}</TokenPickerLabel>
            {!isDisabled && <TokenPickerArrow $isOpen={isOpen} />}

            {isOpen && (
                <TokenPickerList role="listbox">
                    {options.map(option => (
                        <TokenPickerOption
                            key={option.id}
                            type="button"
                            role="option"
                            aria-selected={option.id === selectedOption.id}
                            onClick={event => {
                                event.stopPropagation();
                                onChange(option.id);
                                setIsOpen(false);
                            }}
                        >
                            <TokenLogosView assets={option.assets} />
                            {option.label}
                        </TokenPickerOption>
                    ))}
                </TokenPickerList>
            )}
        </TokenPickerContainer>
    );
};

const TokenAmountFormField = ({
    asset,
    setAsset,
    balance,
    amount,
    setAmount,
    usdEquivalent,
    assetsList,
    resetAmount,
    isEmbedded,
    withAutoFocus,
    amountLabel,
    withPercentButtons,
    balanceLabel,
    isBalanceClickable,
    withReserveTooltip,
    disabled,
    pickerOptions,
    selectedPickerOptionId,
    onPickerOptionChange,
    amountDetails,
    balanceContent,
    balanceTooltipContent,
    ...props
}: SwapFormRowProps) => {
    const { account } = useAuthStore();
    const [assetReserves, setAssetReserves] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (withAutoFocus && inputRef.current) {
            inputRef.current?.focus();
        }
    }, []);

    useEffect(() => {
        if (!account) {
            setAssetReserves(null);
            return;
        }
        account.getReservesForSwap(asset).then(res => {
            setAssetReserves(res);
        });
    }, [account, asset]);

    const setPercent = (percent: number) => {
        resetAmount?.();
        const available =
            asset.type === TokenType.soroban || pickerOptions
                ? balance
                : account.getAvailableForSwapBalance(asset);

        const result = new BigNumber(available)
            .times(percent)
            .div(100)
            .toFixed((asset as SorobanToken).decimal ?? 7);

        setAmount(result);
    };

    const hasPickerOptions = Boolean(pickerOptions);

    return (
        <Container
            $isEmbedded={isEmbedded}
            {...props}
            $disabled={disabled}
            $hasPickerOptions={hasPickerOptions}
        >
            <AmountContainer $hasPickerOptions={hasPickerOptions}>
                <AmountLabel>{amountLabel ?? 'Amount'}</AmountLabel>
                <NumericFormat
                    placeholder="0"
                    customInput={BlankInput}
                    allowedDecimalSeparators={[',']}
                    thousandSeparator=","
                    decimalScale={(asset as SorobanToken).decimal ?? 7}
                    value={amount}
                    onChange={() => resetAmount?.()}
                    onValueChange={value => setAmount(value.value)}
                    getInputRef={inputRef}
                    inputMode="decimal"
                    allowNegative={false}
                />
                {amountDetails && <AmountDetails>{amountDetails}</AmountDetails>}
                {usdEquivalent}
            </AmountContainer>

            <PickerContainer $hasPickerOptions={hasPickerOptions}>
                {withPercentButtons ? (
                    <PercentButtons setPercent={setPercent} compact={hasPickerOptions} />
                ) : (
                    <div style={{ height: '1.8rem' }} />
                )}
                {pickerOptions ? (
                    <TokenAmountPicker
                        options={pickerOptions}
                        selectedOptionId={selectedPickerOptionId ?? pickerOptions[0].id}
                        onChange={onPickerOptionChange ?? (() => undefined)}
                        disabled={disabled || !onPickerOptionChange}
                    />
                ) : (
                    <AssetPicker
                        asset={asset}
                        onUpdate={setAsset}
                        assetsList={assetsList}
                        disabled={!setAsset}
                    />
                )}
                {balance !== null && Boolean(account) && (
                    <Balance $hasPickerOptions={hasPickerOptions}>
                        <BalanceValue $hasPickerOptions={hasPickerOptions}>
                            <BalanceLabel>{balanceLabel ?? 'Balance: '}</BalanceLabel>
                            {isBalanceClickable ? (
                                <BalanceClickable onClick={() => setPercent(100)}>
                                    {balanceContent !== undefined && balanceContent !== null
                                        ? balanceContent
                                        : asset.type === TokenType.soroban
                                          ? Number(balance).toFixed(asset.decimal)
                                          : formatBalance(
                                                pickerOptions
                                                    ? balance
                                                    : account.getAvailableForSwapBalance(asset),
                                            )}
                                </BalanceClickable>
                            ) : balanceContent !== undefined && balanceContent !== null ? (
                                balanceContent
                            ) : (
                                formatBalance(balance, true)
                            )}
                        </BalanceValue>
                        {withReserveTooltip && (
                            <Tooltip
                                showOnHover
                                background={COLORS.textPrimary}
                                position={
                                    +window.innerWidth < 1200
                                        ? TOOLTIP_POSITION.left
                                        : TOOLTIP_POSITION.right
                                }
                                content={
                                    <TooltipInner>
                                        {assetReserves ? (
                                            assetReserves.map(({ label, value }) => (
                                                <TooltipRow key={label}>
                                                    <span>{label}</span>
                                                    <span>
                                                        {value} {asset.code}
                                                    </span>
                                                </TooltipRow>
                                            ))
                                        ) : (
                                            <DotsLoader />
                                        )}
                                    </TooltipInner>
                                }
                            >
                                <Info />
                            </Tooltip>
                        )}
                        {balanceTooltipContent && (
                            <Tooltip
                                showOnHover
                                background={COLORS.textPrimary}
                                position={TOOLTIP_POSITION.left}
                                withoutPadding
                                content={balanceTooltipContent}
                            >
                                <Info />
                            </Tooltip>
                        )}
                    </Balance>
                )}
            </PickerContainer>
        </Container>
    );
};

export default TokenAmountFormField;
