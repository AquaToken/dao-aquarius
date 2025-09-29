import BigNumber from 'bignumber.js';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

import { formatBalance } from 'helpers/format-number';

import useAuthStore from 'store/authStore/useAuthStore';

import { SorobanToken, Token, TokenType } from 'types/token';

import { respondDown, textEllipsis } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Info from 'assets/icons/status/icon-info-16.svg';

import AssetPicker from 'basics/asset-pickers/AssetPicker';
import { BlankInput } from 'basics/inputs';
import { DotsLoader } from 'basics/loaders';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import PercentButtons from 'pages/swap/components/SwapForm/PercentButtons/PercentButtons';

const Container = styled.div<{ $isEmbedded?: boolean }>`
    display: flex;
    position: relative;
    padding: ${({ $isEmbedded }) => ($isEmbedded ? '2.4rem 3.2rem' : '3.2rem 4rem')};
    background-color: ${COLORS.gray50};
    border-radius: 4rem;
    justify-content: space-between;

    ${respondDown(Breakpoints.sm)`
        padding: 3.2rem 1.6rem;
    `}
`;

const AmountContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;

    span {
        font-size: 1.6rem;
    }
`;

const PickerContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 50%;
    align-items: flex-end;
`;

const Balance = styled.div`
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.textGray};
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    width: 100%;

    svg {
        margin-left: 0.4rem;
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

const BalanceValue = styled.span`
    width: 100%;
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

interface SwapFormRowProps {
    isBase?: boolean;
    asset: Token;
    setAsset: (asset: Token) => void;
    amount: string;
    setAmount: (amount: string) => void;
    resetAmount: () => void;
    usdEquivalent: React.ReactElement;
    assetsList: Token[] | null;
    isEmbedded?: boolean;
    balance: number | null;
}

const SwapFormRow = ({
    isBase,
    asset,
    setAsset,
    balance,
    amount,
    setAmount,
    usdEquivalent,
    assetsList,
    resetAmount,
    isEmbedded,
}: SwapFormRowProps) => {
    const { account } = useAuthStore();
    const [assetReserves, setAssetReserves] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isBase && inputRef.current) {
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
        resetAmount();
        const available =
            asset.type === TokenType.soroban ? balance : account.getAvailableForSwapBalance(asset);

        const result = new BigNumber(available)
            .times(percent)
            .div(100)
            .toFixed((asset as SorobanToken).decimal ?? 7);

        setAmount(result);
    };

    return (
        <Container $isEmbedded={isEmbedded}>
            <AmountContainer>
                <span>{isBase ? 'Sell' : 'Buy'}</span>
                <NumericFormat
                    placeholder="0"
                    customInput={BlankInput}
                    allowedDecimalSeparators={[',']}
                    thousandSeparator=","
                    decimalScale={(asset as SorobanToken).decimal ?? 7}
                    value={amount}
                    onChange={() => resetAmount()}
                    onValueChange={value => setAmount(value.value)}
                    getInputRef={inputRef}
                    inputMode="decimal"
                    allowNegative={false}
                />
                {usdEquivalent}
            </AmountContainer>

            <PickerContainer>
                {isBase ? (
                    <PercentButtons setPercent={setPercent} />
                ) : (
                    <div style={{ height: '1.8rem' }} />
                )}
                <AssetPicker asset={asset} onUpdate={setAsset} assetsList={assetsList} />
                {balance !== null && Boolean(account) && (
                    <Balance>
                        <BalanceValue>
                            <BalanceLabel>{isBase ? 'Available: ' : 'Balance: '}</BalanceLabel>
                            {isBase ? (
                                <BalanceClickable onClick={() => setPercent(100)}>
                                    {asset.type === TokenType.soroban
                                        ? Number(balance).toFixed(asset.decimal)
                                        : formatBalance(account.getAvailableForSwapBalance(asset))}
                                </BalanceClickable>
                            ) : (
                                formatBalance(balance, true)
                            )}
                        </BalanceValue>
                        {isBase && (
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
                    </Balance>
                )}
            </PickerContainer>
        </Container>
    );
};

export default SwapFormRow;
