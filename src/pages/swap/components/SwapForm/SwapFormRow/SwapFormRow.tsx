import { Asset } from '@stellar/stellar-sdk';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

import { formatBalance } from 'helpers/format-number';

import { AssetSimple } from 'store/assetsStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { respondDown, textEllipsis } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Info from 'assets/icon-info.svg';

import AssetPicker from 'basics/asset-picker/AssetPicker';
import { BlankInput } from 'basics/inputs';
import { DotsLoader } from 'basics/loaders';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import PercentButtons from 'pages/swap/components/SwapForm/PercentButtons/PercentButtons';

const Container = styled.div<{ $isEmbedded?: boolean }>`
    display: flex;
    position: relative;
    padding: ${({ $isEmbedded }) => ($isEmbedded ? '2.4rem 3.2rem' : '3.2rem 4rem')};
    background-color: ${COLORS.lightGray};
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
    color: ${COLORS.grayText};
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
        color: ${COLORS.titleText};
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
    asset: Asset;
    setAsset: (asset: Asset) => void;
    amount: string;
    setAmount: (amount: string) => void;
    resetAmount: () => void;
    usdEquivalent: React.ReactElement;
    assetsList: AssetSimple[] | null;
    isEmbedded?: boolean;
}

const SwapFormRow = ({
    isBase,
    asset,
    setAsset,
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
        const available = account.getAvailableForSwapBalance(asset);

        setAmount(((available * percent) / 100).toFixed(7));
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
                    decimalScale={7}
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
                {account && account.getAssetBalance(asset) !== null && (
                    <Balance>
                        <BalanceValue>
                            <BalanceLabel>{isBase ? 'Available: ' : 'Balance: '}</BalanceLabel>
                            {isBase ? (
                                <BalanceClickable onClick={() => setPercent(100)}>
                                    {formatBalance(account.getAvailableForSwapBalance(asset))}
                                </BalanceClickable>
                            ) : (
                                formatBalance(account.getAssetBalance(asset, true))
                            )}
                        </BalanceValue>
                        {isBase && (
                            <Tooltip
                                showOnHover
                                background={COLORS.titleText}
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
