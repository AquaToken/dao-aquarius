import * as React from 'react';
import { NumericFormat } from 'react-number-format';

import { formatConcentratedAmountInputValue } from 'helpers/amm-concentrated';
import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';

import { PoolExtended } from 'types/amm';

import Asset from 'basics/Asset';
import Input from 'basics/inputs/Input';

import {
    Balance,
    BalanceClickable,
    CardStack,
    FormRow,
} from '../../styled/ConcentratedAddLiquidity.styled';

export type AddLiquidityAmountsSectionProps = {
    pool: PoolExtended;
    tokenBalances: Map<string, string>;
    amount0: string;
    amount1: string;
    disableAmount0Input: boolean;
    disableAmount1Input: boolean;
    onAmount0Change: (value: string) => void;
    onAmount1Change: (value: string) => void;
};

const AddLiquidityAmountsSection = ({
    pool,
    tokenBalances,
    amount0,
    amount1,
    disableAmount0Input,
    disableAmount1Input,
    onAmount0Change,
    onAmount1Change,
}: AddLiquidityAmountsSectionProps): React.ReactNode => {
    const token0Key = getAssetString(pool.tokens[0]);
    const token1Key = getAssetString(pool.tokens[1]);
    const token0Balance = tokenBalances.get(token0Key) || '0';
    const token1Balance = tokenBalances.get(token1Key) || '0';
    const token0Decimals = pool.tokens[0].decimal;
    const token1Decimals = pool.tokens[1].decimal;
    const token0BalanceValue = formatConcentratedAmountInputValue(token0Balance, token0Decimals);
    const token1BalanceValue = formatConcentratedAmountInputValue(token1Balance, token1Decimals);

    const token0RightLabel = tokenBalances.has(token0Key) ? (
        <Balance>
            <BalanceClickable
                onClick={() => {
                    if (disableAmount0Input) {
                        return;
                    }
                    onAmount0Change(token0BalanceValue);
                }}
            >
                {formatBalance(token0Balance, false, false, token0Decimals)} {pool.tokens[0].code}
            </BalanceClickable>{' '}
            available
        </Balance>
    ) : null;

    const token1RightLabel = tokenBalances.has(token1Key) ? (
        <Balance>
            <BalanceClickable
                onClick={() => {
                    if (disableAmount1Input) {
                        return;
                    }
                    onAmount1Change(token1BalanceValue);
                }}
            >
                {formatBalance(token1Balance, false, false, token1Decimals)} {pool.tokens[1].code}
            </BalanceClickable>{' '}
            available
        </Balance>
    ) : null;

    return (
        <CardStack>
            <FormRow>
                <NumericFormat
                    value={amount0}
                    onValueChange={(values, sourceInfo) => {
                        if (sourceInfo.source === 'event') {
                            onAmount0Change(values.value);
                        }
                    }}
                    placeholder={`Enter ${pool.tokens[0].code} amount`}
                    customInput={Input}
                    label={`${pool.tokens[0].code} Amount`}
                    rightLabel={token0RightLabel}
                    postfix={<Asset asset={pool.tokens[0]} logoAndCode />}
                    inputMode="decimal"
                    allowedDecimalSeparators={[',']}
                    thousandSeparator=","
                    decimalScale={token0Decimals}
                    allowNegative={false}
                    disabled={disableAmount0Input}
                />
            </FormRow>

            <FormRow>
                <NumericFormat
                    value={amount1}
                    onValueChange={(values, sourceInfo) => {
                        if (sourceInfo.source === 'event') {
                            onAmount1Change(values.value);
                        }
                    }}
                    placeholder={`Enter ${pool.tokens[1].code} amount`}
                    customInput={Input}
                    label={`${pool.tokens[1].code} Amount`}
                    rightLabel={token1RightLabel}
                    postfix={<Asset asset={pool.tokens[1]} logoAndCode />}
                    inputMode="decimal"
                    allowedDecimalSeparators={[',']}
                    thousandSeparator=","
                    decimalScale={token1Decimals}
                    allowNegative={false}
                    disabled={disableAmount1Input}
                />
            </FormRow>
        </CardStack>
    );
};

export default AddLiquidityAmountsSection;
