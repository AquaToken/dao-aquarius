import * as React from 'react';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import { NumericFormat } from 'react-number-format';

import { contractValueToAmount } from 'helpers/amount';
import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';

import useAuthStore from 'store/authStore/useAuthStore';

import { SorobanService, StellarService } from 'services/globalServices';

import { PoolExtended } from 'types/amm';
import { SorobanToken, Token, TokenType } from 'types/token';

import Info from 'assets/icons/status/icon-info-16.svg';

import Alert from 'basics/Alert';
import Asset from 'basics/Asset';
import Input from 'basics/inputs/Input';
import DotsLoader from 'basics/loaders/DotsLoader';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { COLORS } from 'styles/style-constants';

import {
    Balance,
    BalanceClickable,
    CheckboxStyled,
    Form,
    FormRow,
    TooltipInnerBalance,
    TooltipRow,
} from './AddLiquidity.styled';
import AddLiquidityPoolInfo from './AddLiquidityPoolInfo';
import AddLiquidityPoolSummary from './AddLiquidityPoolSummary';

export type AddLiquidityFormData = {
    amounts: Map<string, string>;
    balances: Map<string, string> | null;
    hasAllAmounts: boolean;
    hasAnyAmount: boolean;
    isBalancedDeposit: boolean;
};

type SwapReserve = {
    label: string;
    value: number;
};

type AddLiquidityFormProps = {
    pool: PoolExtended;
    showPoolSummaryRows?: boolean;
    withPoolInfoCardSpacing?: boolean;
    showPoolInfo?: boolean;
    baseAmount?: string;
    counterAmount?: string;
    base?: Token;
    counter?: Token;
    onDataChange?: (data: AddLiquidityFormData) => void;
};

const AddLiquidityForm = ({
    pool,
    showPoolSummaryRows = true,
    withPoolInfoCardSpacing = true,
    showPoolInfo = true,
    baseAmount,
    counterAmount,
    base,
    counter,
    onDataChange,
}: AddLiquidityFormProps): React.ReactNode => {
    const { account } = useAuthStore();

    const [assetsReserves, setAssetsReserves] = useState<SwapReserve[][] | null>(null);
    const [balances, setBalances] = useState<Map<string, string> | null>(null);
    const [amounts, setAmounts] = useState<Map<string, string>>(
        new Map<string, string>(pool.tokens.map(asset => [getAssetString(asset), ''])),
    );
    const [isBalancedDeposit, setIsBalancedDeposit] = useState(true);
    const [priceIndex, setPriceIndex] = useState(0);

    useEffect(() => {
        if (!account) {
            setAssetsReserves(null);
            return;
        }

        Promise.all(pool.tokens.map(asset => account.getReservesForSwap(asset))).then(res => {
            setAssetsReserves(res);
        });
    }, [account, pool]);

    useEffect(() => {
        if (!account) {
            setBalances(null);
            return;
        }

        const sorobanTokens = pool.tokens.filter(({ type }) => type === TokenType.soroban);
        Promise.all(
            sorobanTokens.map((asset: SorobanToken) => account.getAssetBalance(asset)),
        ).then(res => {
            const result = new Map<string, string>();
            sorobanTokens.forEach((token, index) => {
                result.set(getAssetString(token), String(res[index] ?? '0'));
            });

            setBalances(result);
        });
    }, [account, pool.tokens]);

    const reserves: Map<string, number> = useMemo(
        () =>
            new Map(
                pool.tokens.map((asset, index) => [
                    getAssetString(asset),
                    +contractValueToAmount(
                        pool.reserves[index],
                        (pool.tokens[index] as SorobanToken).decimal,
                    ),
                ]) as [string, number][],
            ),
        [pool],
    );

    const hasAllAmounts = useMemo(
        () => [...amounts.values()].every(value => Boolean(+value)),
        [amounts],
    );
    const hasAnyAmount = useMemo(
        () => [...amounts.values()].some(value => Boolean(+value)),
        [amounts],
    );

    const rates: Map<string, string> = useMemo(() => {
        if (Number(pool.total_share) === 0 && !hasAllAmounts) {
            return null;
        }

        const map = new Map<string, string>();

        pool.tokens.forEach(asset => {
            const otherAssets = pool.tokens
                .filter(token => getAssetString(token) !== getAssetString(asset))
                .map(
                    token =>
                        `${formatBalance(
                            Number(pool.total_share) === 0
                                ? +amounts.get(getAssetString(token)) /
                                      +amounts.get(getAssetString(asset))
                                : reserves.get(getAssetString(token)) /
                                      reserves.get(getAssetString(asset)),
                            true,
                        )} ${token.code}`,
                );
            map.set(getAssetString(asset), `1 ${asset.code} ≈ ${otherAssets.join(' ≈ ')}`);
        });

        return map;
    }, [reserves, pool, amounts, hasAllAmounts]);

    const liquidityDisplay = pool.liquidity
        ? `$${formatBalance(
              (Number(pool.liquidity) * StellarService.price.priceLumenUsd) / 1e7,
              true,
          )}`
        : '0';
    const rotatePriceIndex = () => {
        if (!rates?.size) {
            return;
        }

        setPriceIndex(prev => (prev + 1) % rates.size);
    };

    const onChangeInput = (asset: Token, inputValue: string) => {
        const value = inputValue.replaceAll(',', '');
        if (value === '') {
            pool.tokens.forEach(token => {
                setAmounts(new Map(amounts.set(getAssetString(token), '')));
            });
            return;
        }

        setAmounts(new Map(amounts.set(getAssetString(asset), value)));

        if (Number(pool.total_share) === 0 || !isBalancedDeposit) {
            return;
        }

        pool.tokens
            .filter(token => getAssetString(token) !== getAssetString(asset))
            .forEach(token => {
                const newAmount = (
                    (Number(value) * +reserves.get(getAssetString(token))) /
                    +reserves.get(getAssetString(asset))
                ).toFixed((token as SorobanToken).decimal);
                setAmounts(new Map(amounts.set(getAssetString(token), newAmount)));
            });
    };

    useEffect(() => {
        pool.tokens.forEach(token => {
            setAmounts(new Map(amounts.set(getAssetString(token), '')));
        });
    }, [isBalancedDeposit]);

    useEffect(() => {
        if (!baseAmount || !counterAmount || !base || !counter) {
            return;
        }

        const newCounterAmount = (
            (Number(baseAmount) * +reserves.get(getAssetString(counter))) /
            +reserves.get(getAssetString(base))
        ).toFixed((counter as SorobanToken).decimal);

        if (+newCounterAmount >= +counterAmount) {
            onChangeInput(counter, counterAmount);
        } else {
            onChangeInput(base, baseAmount);
        }
    }, []);

    useEffect(() => {
        if (!onDataChange) {
            return;
        }

        onDataChange({
            amounts: new Map(amounts),
            balances,
            hasAllAmounts,
            hasAnyAmount,
            isBalancedDeposit,
        });
    }, [onDataChange, amounts, balances, hasAllAmounts, hasAnyAmount, isBalancedDeposit]);

    return (
        <>
            {Number(pool.total_share) === 0 && (
                <Alert
                    title="This is the first deposit into this pool."
                    text="We recommend depositing tokens according to the market rate. Otherwise, traders may profit from your deposit, and you could lose money."
                />
            )}
            <Form>
                {pool.tokens.map((asset, index) => {
                    const sorobanBalance = balances?.get(getAssetString(asset)) || '0';
                    const availableBalance =
                        asset.type === TokenType.soroban
                            ? sorobanBalance
                            : String(account?.getAvailableForSwapBalance(asset) || '0');
                    const availableBalanceInput = new BigNumber(availableBalance || '0')
                        .toFixed(asset.decimal)
                        .replace(/\.?0+$/, '');
                    const availableBalanceDisplay =
                        asset.type === TokenType.soroban
                            ? Number(sorobanBalance)
                            : account?.getAvailableForSwapBalance(asset);
                    const hasAvailableBalance =
                        account &&
                        (asset.type === TokenType.soroban
                            ? balances?.get(getAssetString(asset))
                            : account.getAssetBalance(asset)) !== null;

                    return (
                        <FormRow key={getAssetString(asset)}>
                            {hasAvailableBalance && (
                                <Balance>
                                    Available:
                                    <BalanceClickable
                                        onClick={() =>
                                            onChangeInput(
                                                asset,
                                                availableBalanceInput === ''
                                                    ? '0'
                                                    : availableBalanceInput,
                                            )
                                        }
                                    >
                                        {' '}
                                        {formatBalance(
                                            availableBalanceDisplay,
                                            false,
                                            false,
                                            asset.decimal,
                                        )}
                                    </BalanceClickable>
                                    <Tooltip
                                        showOnHover
                                        background={COLORS.textPrimary}
                                        position={TOOLTIP_POSITION.left}
                                        content={
                                            <TooltipInnerBalance>
                                                {assetsReserves ? (
                                                    assetsReserves[index].map(
                                                        ({ label, value }) => (
                                                            <TooltipRow key={label}>
                                                                <span>{label}</span>
                                                                <span>
                                                                    {value} {asset.code}
                                                                </span>
                                                            </TooltipRow>
                                                        ),
                                                    )
                                                ) : (
                                                    <DotsLoader />
                                                )}
                                            </TooltipInnerBalance>
                                        }
                                    >
                                        <Info />
                                    </Tooltip>
                                </Balance>
                            )}
                            <NumericFormat
                                value={amounts.get(getAssetString(asset))}
                                onChange={({ target }) => onChangeInput(asset, target.value)}
                                placeholder={`Enter ${asset.code} amount`}
                                customInput={Input}
                                label={`${asset.code} Amount`}
                                postfix={<Asset asset={asset} logoAndCode />}
                                inputMode="decimal"
                                allowedDecimalSeparators={[',']}
                                thousandSeparator=","
                                decimalScale={(asset as SorobanToken).decimal}
                                allowNegative={false}
                            />
                        </FormRow>
                    );
                })}

                {pool.pool_type === 'stable' && !!Number(pool.total_share) && (
                    <CheckboxStyled
                        checked={isBalancedDeposit}
                        onChange={setIsBalancedDeposit}
                        label="Match pool ratio"
                    />
                )}

                {showPoolSummaryRows && (
                    <AddLiquidityPoolSummary
                        pool={pool}
                        liquidityDisplay={liquidityDisplay}
                        rates={rates}
                        priceIndex={priceIndex}
                        onRotatePriceIndex={rotatePriceIndex}
                    />
                )}

                {showPoolInfo && (
                    <AddLiquidityPoolInfo
                        pool={pool}
                        amounts={amounts}
                        withPoolInfoCardSpacing={withPoolInfoCardSpacing}
                    />
                )}
            </Form>
        </>
    );
};

export default AddLiquidityForm;
