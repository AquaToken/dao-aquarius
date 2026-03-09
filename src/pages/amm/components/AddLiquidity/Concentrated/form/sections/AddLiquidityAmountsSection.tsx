import * as React from 'react';
import { NumericFormat } from 'react-number-format';

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
    tokenBalances: Map<string, number>;
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
    const token0Balance = tokenBalances.get(token0Key) || 0;
    const token1Balance = tokenBalances.get(token1Key) || 0;

    return (
        <CardStack>
            <FormRow>
                {tokenBalances.has(token0Key) && (
                    <Balance>
                        Available:
                        <BalanceClickable
                            onClick={() => {
                                if (disableAmount0Input) {
                                    return;
                                }
                                onAmount0Change(String(token0Balance));
                            }}
                        >
                            {' '}
                            {formatBalance(token0Balance)}
                        </BalanceClickable>
                    </Balance>
                )}
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
                    postfix={<Asset asset={pool.tokens[0]} logoAndCode />}
                    inputMode="decimal"
                    allowedDecimalSeparators={[',']}
                    thousandSeparator=","
                    decimalScale={(pool.tokens[0] as { decimal?: number }).decimal ?? 7}
                    allowNegative={false}
                    disabled={disableAmount0Input}
                />
            </FormRow>

            <FormRow>
                {tokenBalances.has(token1Key) && (
                    <Balance>
                        Available:
                        <BalanceClickable
                            onClick={() => {
                                if (disableAmount1Input) {
                                    return;
                                }
                                onAmount1Change(String(token1Balance));
                            }}
                        >
                            {' '}
                            {formatBalance(token1Balance)}
                        </BalanceClickable>
                    </Balance>
                )}
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
                    postfix={<Asset asset={pool.tokens[1]} logoAndCode />}
                    inputMode="decimal"
                    allowedDecimalSeparators={[',']}
                    thousandSeparator=","
                    decimalScale={(pool.tokens[1] as { decimal?: number }).decimal ?? 7}
                    allowNegative={false}
                    disabled={disableAmount1Input}
                />
            </FormRow>
        </CardStack>
    );
};

export default AddLiquidityAmountsSection;
