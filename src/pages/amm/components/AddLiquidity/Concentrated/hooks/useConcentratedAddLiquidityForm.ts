import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
    CONCENTRATED_DEPOSIT_DEFAULT_PRESET_KEY,
    CONCENTRATED_DEPOSIT_ESTIMATE_DEBOUNCE_MS,
    CONCENTRATED_DEPOSIT_PRESETS,
    CONCENTRATED_DEPOSIT_PRICE_INPUT_DEBOUNCE_MS,
    CONCENTRATED_MAX_TICK,
    CONCENTRATED_MIN_TICK,
    POOL_TYPE,
} from 'constants/amm';

import {
    clamp,
    formatConcentratedDerivedAmount,
    formatConcentratedPriceInputValue,
    isValidNonNegativeConcentratedAmount,
    parseConcentratedAmount,
    parseConcentratedPriceInput,
    priceToTick,
    snapDown,
    snapUp,
    tickToPrice,
} from 'helpers/amm-concentrated';
import { contractValueToFormattedAmount } from 'helpers/amount';
import { getAssetString } from 'helpers/assets';

import { useDebounce } from 'hooks/useDebounce';

import useAuthStore from 'store/authStore/useAuthStore';

import { SorobanService, ToastService } from 'services/globalServices';

import { DepositEstimate, DepositPresetKey, PoolExtended } from 'types/amm';
import { TokenType } from 'types/token';

import {
    getInRangeAmount1PerAmount0,
    normalizeForRange,
    resolvePresetTicks,
} from '../helpers/addLiquidityRangeUtils';

type Params = {
    pool: PoolExtended;
    initialTickSpacing?: number | null;
    skipPoolDataLoading?: boolean;
    disableNetworkEstimate?: boolean;
};

export const useConcentratedAddLiquidityForm = ({
    pool,
    initialTickSpacing = null,
    skipPoolDataLoading = false,
    disableNetworkEstimate = false,
}: Params) => {
    const { account } = useAuthStore();

    const [slot0, setSlot0] = useState<Record<string, unknown> | null>(null);
    const [tickSpacing, setTickSpacing] = useState<number | null>(null);
    const [tickLower, setTickLower] = useState<number | null>(null);
    const [tickUpper, setTickUpper] = useState<number | null>(null);
    const [minPriceInput, setMinPriceInput] = useState('');
    const [maxPriceInput, setMaxPriceInput] = useState('');
    const [amount0, setAmount0] = useState('');
    const [amount1, setAmount1] = useState('');
    const [selectedPreset, setSelectedPreset] = useState<DepositPresetKey | null>(null);
    const liquidityEstimateCallIdRef = useRef(0);
    const lastUserEditedAmountRef = useRef<'token0' | 'token1'>('token0');
    const minPriceChangedByUserRef = useRef(false);
    const maxPriceChangedByUserRef = useRef(false);

    const [depositEstimate, setDepositEstimate] = useState<DepositEstimate | null>(null);
    const [estimateRequest, setEstimateRequest] = useState<{
        amounts: [string, string];
        tickLower: number;
        tickUpper: number;
    } | null>(null);
    const [tokenBalances, setTokenBalances] = useState<Map<string, string>>(new Map());
    const [loading, setLoading] = useState(false);

    const isEmptyPool = new BigNumber(pool.total_share || pool.liquidity || '0').lte(0);

    const currentTick = Number(slot0?.tick);
    const hasTickRange = tickLower !== null && tickUpper !== null;
    const amount0Value = parseConcentratedAmount(amount0);
    const amount1Value = parseConcentratedAmount(amount1);
    const hasPositiveAmount0 = amount0Value?.gt(0) ?? false;
    const hasPositiveAmount1 = amount1Value?.gt(0) ?? false;
    const hasBothPositiveAmounts = hasPositiveAmount0 && hasPositiveAmount1;
    const areAmountsFilled = (amount0Value?.gt(0) ?? false) || (amount1Value?.gt(0) ?? false);
    const isRangeBelowCurrent =
        hasTickRange && Number.isFinite(currentTick) && currentTick > (tickUpper as number);
    const isRangeAboveCurrent =
        hasTickRange && Number.isFinite(currentTick) && currentTick < (tickLower as number);
    const decimalsDiff = pool.tokens[0].decimal - pool.tokens[1].decimal;
    const poolPriceValue = Number.isFinite(currentTick)
        ? tickToPrice(currentTick, decimalsDiff)
        : NaN;
    const amountsDerivedPriceValue = hasBothPositiveAmounts
        ? Number(amount1Value?.dividedBy(amount0Value || 1).toString())
        : NaN;
    const referencePriceValue = isEmptyPool ? amountsDerivedPriceValue : poolPriceValue;
    const canUseRangeControls = !isEmptyPool || Number.isFinite(referencePriceValue);

    const debouncedEstimateRequest = useDebounce(
        estimateRequest,
        CONCENTRATED_DEPOSIT_ESTIMATE_DEBOUNCE_MS,
        true,
    );
    const debouncedMinPriceInput = useDebounce(
        minPriceInput,
        CONCENTRATED_DEPOSIT_PRICE_INPUT_DEBOUNCE_MS,
        true,
    );
    const debouncedMaxPriceInput = useDebounce(
        maxPriceInput,
        CONCENTRATED_DEPOSIT_PRICE_INPUT_DEBOUNCE_MS,
        true,
    );

    const [minTickBound, maxTickBound] = useMemo(() => {
        if (tickSpacing === null) {
            return [0, 0];
        }

        return [
            snapUp(CONCENTRATED_MIN_TICK, tickSpacing),
            snapDown(CONCENTRATED_MAX_TICK, tickSpacing),
        ];
    }, [tickSpacing]);

    const referenceExactTick = useMemo(() => {
        if (!Number.isFinite(referencePriceValue) || referencePriceValue <= 0) {
            return null;
        }

        return priceToTick(referencePriceValue, decimalsDiff);
    }, [referencePriceValue, decimalsDiff]);

    useEffect(() => {
        if (
            tickSpacing === null ||
            !Number.isFinite(referencePriceValue) ||
            referencePriceValue <= 0
        ) {
            return;
        }
        if (tickLower !== null && tickUpper !== null) {
            return;
        }

        const defaultPreset = CONCENTRATED_DEPOSIT_PRESETS.find(
            ({ key }) => key === CONCENTRATED_DEPOSIT_DEFAULT_PRESET_KEY,
        );
        if (
            !defaultPreset ||
            defaultPreset.lowerFactor === null ||
            defaultPreset.upperFactor === null
        ) {
            return;
        }

        const preset = resolvePresetTicks({
            tickSpacing,
            referencePriceValue,
            decimalsDiff,
            minTickBound,
            maxTickBound,
            lowerFactor: defaultPreset.lowerFactor,
            upperFactor: defaultPreset.upperFactor,
        });
        if (!preset) {
            return;
        }
        const [presetLower, presetUpper] = preset;

        setTickLower(presetLower);
        setTickUpper(presetUpper);
        setSelectedPreset(CONCENTRATED_DEPOSIT_DEFAULT_PRESET_KEY as DepositPresetKey);
    }, [
        tickSpacing,
        tickLower,
        tickUpper,
        minTickBound,
        maxTickBound,
        referencePriceValue,
        decimalsDiff,
    ]);

    useEffect(() => {
        const nextMinPriceInput = formatConcentratedPriceInputValue(
            tickToPrice(tickLower ?? minTickBound, decimalsDiff),
        );
        const nextMaxPriceInput = formatConcentratedPriceInputValue(
            tickToPrice(tickUpper ?? maxTickBound, decimalsDiff),
        );

        if (minPriceInput !== nextMinPriceInput) {
            setMinPriceInput(nextMinPriceInput);
        }
        if (maxPriceInput !== nextMaxPriceInput) {
            setMaxPriceInput(nextMaxPriceInput);
        }
    }, [tickLower, tickUpper, minTickBound, maxTickBound, decimalsDiff]);

    const getRatio = (lower: number | null, upper: number | null) =>
        getInRangeAmount1PerAmount0({
            rangeLower: lower,
            rangeUpper: upper,
            referencePriceValue,
            decimalsDiff,
        });

    const isInvalidAmountInput = (value: string) =>
        value !== '' && !isValidNonNegativeConcentratedAmount(value);

    const updateLocalDepositPreview = (
        nextAmount0: string,
        nextAmount1: string,
        nextTickLower: number | null,
        nextTickUpper: number | null,
    ) => {
        const setEstimateIfChanged = (nextValue: DepositEstimate | null) => {
            setDepositEstimate(prev => {
                if (prev === nextValue) {
                    return prev;
                }
                if (!prev || !nextValue) {
                    return nextValue;
                }

                const isSame =
                    prev.liquidityDisplay === nextValue.liquidityDisplay &&
                    prev.liquidityLoading === nextValue.liquidityLoading &&
                    prev.amounts[0] === nextValue.amounts[0] &&
                    prev.amounts[1] === nextValue.amounts[1];

                return isSame ? prev : nextValue;
            });
        };

        const setEstimateRequestIfChanged = (nextValue: typeof estimateRequest) => {
            setEstimateRequest(prev => {
                if (prev === nextValue) {
                    return prev;
                }
                if (!prev || !nextValue) {
                    return nextValue;
                }

                const isSame =
                    prev.tickLower === nextValue.tickLower &&
                    prev.tickUpper === nextValue.tickUpper &&
                    prev.amounts[0] === nextValue.amounts[0] &&
                    prev.amounts[1] === nextValue.amounts[1];

                return isSame ? prev : nextValue;
            });
        };

        const nextAmount0Value = parseConcentratedAmount(nextAmount0);
        const nextAmount1Value = parseConcentratedAmount(nextAmount1);

        if (
            nextTickLower === null ||
            nextTickUpper === null ||
            nextTickLower >= nextTickUpper ||
            (nextAmount0Value === null && nextAmount1Value === null)
        ) {
            setEstimateIfChanged(null);
            setEstimateRequestIfChanged(null);
            return;
        }

        const hasAnyAmount =
            (nextAmount0Value?.gt(0) ?? false) || (nextAmount1Value?.gt(0) ?? false);
        if (!hasAnyAmount) {
            setEstimateIfChanged(null);
            setEstimateRequestIfChanged(null);
            return;
        }

        const amounts = [nextAmount0 || '0', nextAmount1 || '0'] as [string, string];
        setEstimateIfChanged({
            amounts,
            liquidityDisplay: '0',
            liquidityLoading: true,
        });
        setEstimateRequestIfChanged({
            amounts,
            tickLower: nextTickLower,
            tickUpper: nextTickUpper,
        });
    };

    const applyAmountsAndPreview = (
        nextAmount0: string,
        nextAmount1: string,
        nextTickLower: number | null = tickLower,
        nextTickUpper: number | null = tickUpper,
    ) => {
        if (nextAmount0 !== amount0) {
            setAmount0(nextAmount0);
        }
        if (nextAmount1 !== amount1) {
            setAmount1(nextAmount1);
        }
        updateLocalDepositPreview(nextAmount0, nextAmount1, nextTickLower, nextTickUpper);
    };

    const applyTickRangeAndRecalculate = (nextLower: number, nextUpper: number) => {
        if (nextLower !== tickLower) {
            setTickLower(nextLower);
        }
        if (nextUpper !== tickUpper) {
            setTickUpper(nextUpper);
        }

        const normalized = normalizeForRange({
            rawAmount0: amount0,
            rawAmount1: amount1,
            nextTickLower: nextLower,
            nextTickUpper: nextUpper,
            isEmptyPool,
            currentTick,
            decimalsToken0: pool.tokens[0].decimal,
            decimalsToken1: pool.tokens[1].decimal,
            getRatio,
            formatAmount: formatConcentratedDerivedAmount,
            recalculateInRange: true,
            anchor: lastUserEditedAmountRef.current,
        });

        if (normalized.amount0 !== amount0) {
            setAmount0(normalized.amount0);
        }
        if (normalized.amount1 !== amount1) {
            setAmount1(normalized.amount1);
        }
        updateLocalDepositPreview(normalized.amount0, normalized.amount1, nextLower, nextUpper);
    };

    useEffect(() => {
        if (
            !isEmptyPool ||
            !hasBothPositiveAmounts ||
            !canUseRangeControls ||
            selectedPreset === null
        ) {
            return;
        }
        if (
            !Number.isFinite(referencePriceValue) ||
            referencePriceValue <= 0 ||
            tickSpacing === null
        ) {
            return;
        }

        if (selectedPreset === 'full') {
            if (tickLower === minTickBound && tickUpper === maxTickBound) {
                return;
            }
            applyTickRangeAndRecalculate(minTickBound, maxTickBound);
            return;
        }

        const selectedPresetConfig = CONCENTRATED_DEPOSIT_PRESETS.find(
            ({ key }) => key === selectedPreset,
        );
        if (
            !selectedPresetConfig ||
            selectedPresetConfig.lowerFactor === null ||
            selectedPresetConfig.upperFactor === null
        ) {
            return;
        }

        const preset = resolvePresetTicks({
            tickSpacing,
            referencePriceValue,
            decimalsDiff,
            minTickBound,
            maxTickBound,
            lowerFactor: selectedPresetConfig.lowerFactor,
            upperFactor: selectedPresetConfig.upperFactor,
        });

        if (!preset) {
            return;
        }

        const [nextLower, nextUpper] = preset;
        if (nextLower === tickLower && nextUpper === tickUpper) {
            return;
        }

        applyTickRangeAndRecalculate(nextLower, nextUpper);
    }, [
        isEmptyPool,
        hasBothPositiveAmounts,
        canUseRangeControls,
        selectedPreset,
        referencePriceValue,
        tickSpacing,
        decimalsDiff,
        minTickBound,
        maxTickBound,
        tickLower,
        tickUpper,
    ]);

    const handleAmountChange = (editedToken: 'token0' | 'token1', value: string) => {
        lastUserEditedAmountRef.current = editedToken;
        const normalized = value.replaceAll(',', '').trim();

        if (isEmptyPool) {
            if (isInvalidAmountInput(normalized)) {
                return;
            }
            if (editedToken === 'token0') {
                applyAmountsAndPreview(normalized, amount1);
            } else {
                applyAmountsAndPreview(amount0, normalized);
            }
            return;
        }

        if (editedToken === 'token0' && isRangeBelowCurrent) {
            if (amount0 !== '0') {
                setAmount0('0');
            }
            return;
        }

        if (editedToken === 'token1' && isRangeAboveCurrent) {
            if (amount1 !== '0') {
                setAmount1('0');
            }
            return;
        }

        if (editedToken === 'token0' && isRangeAboveCurrent) {
            if (isInvalidAmountInput(normalized)) {
                return;
            }
            applyAmountsAndPreview(normalized, '0');
            return;
        }

        if (editedToken === 'token1' && isRangeBelowCurrent) {
            if (isInvalidAmountInput(normalized)) {
                return;
            }
            applyAmountsAndPreview('0', normalized);
            return;
        }

        if (isInvalidAmountInput(normalized)) {
            return;
        }

        const inRangeRatio = getRatio(tickLower, tickUpper);
        const parsedEditedAmount = parseConcentratedAmount(normalized);
        const derivedAmount =
            normalized === '' || inRangeRatio === null || !parsedEditedAmount
                ? ''
                : editedToken === 'token0'
                  ? formatConcentratedDerivedAmount(
                        parsedEditedAmount.multipliedBy(inRangeRatio),
                        pool.tokens[1].decimal,
                    )
                  : formatConcentratedDerivedAmount(
                        parsedEditedAmount.dividedBy(inRangeRatio),
                        pool.tokens[0].decimal,
                    );

        if (editedToken === 'token0') {
            applyAmountsAndPreview(normalized, derivedAmount);
            return;
        }

        applyAmountsAndPreview(derivedAmount, normalized);
    };

    const handleAmount0Change = (value: string) => handleAmountChange('token0', value);
    const handleAmount1Change = (value: string) => handleAmountChange('token1', value);

    const handleMinPriceChange = (value: string) => {
        setMinPriceInput(value);
        minPriceChangedByUserRef.current = true;
    };

    const handleMaxPriceChange = (value: string) => {
        setMaxPriceInput(value);
        maxPriceChangedByUserRef.current = true;
    };

    useEffect(() => {
        if (!minPriceChangedByUserRef.current) {
            return;
        }
        minPriceChangedByUserRef.current = false;

        if (tickSpacing === null || !hasTickRange || !canUseRangeControls) {
            return;
        }

        const parsed = parseConcentratedPriceInput(debouncedMinPriceInput);
        if (parsed === null) {
            return;
        }

        const nextLower = clamp(
            snapDown(priceToTick(parsed, decimalsDiff), tickSpacing),
            minTickBound,
            (tickUpper ?? maxTickBound) - tickSpacing,
        );

        setSelectedPreset(null);
        applyTickRangeAndRecalculate(nextLower, tickUpper ?? maxTickBound);
    }, [
        debouncedMinPriceInput,
        tickSpacing,
        hasTickRange,
        canUseRangeControls,
        decimalsDiff,
        minTickBound,
        tickUpper,
        maxTickBound,
    ]);

    useEffect(() => {
        if (!maxPriceChangedByUserRef.current) {
            return;
        }
        maxPriceChangedByUserRef.current = false;

        if (tickSpacing === null || !hasTickRange || !canUseRangeControls) {
            return;
        }

        const parsed = parseConcentratedPriceInput(debouncedMaxPriceInput);
        if (parsed === null) {
            return;
        }

        const nextUpper = clamp(
            snapUp(priceToTick(parsed, decimalsDiff), tickSpacing),
            (tickLower ?? minTickBound) + tickSpacing,
            maxTickBound,
        );

        setSelectedPreset(null);
        applyTickRangeAndRecalculate(tickLower ?? minTickBound, nextUpper);
    }, [
        debouncedMaxPriceInput,
        tickSpacing,
        hasTickRange,
        canUseRangeControls,
        decimalsDiff,
        tickLower,
        minTickBound,
        maxTickBound,
    ]);

    useEffect(() => {
        if (!hasTickRange || isEmptyPool) {
            return;
        }

        const normalized = normalizeForRange({
            rawAmount0: amount0,
            rawAmount1: amount1,
            nextTickLower: tickLower,
            nextTickUpper: tickUpper,
            isEmptyPool,
            currentTick,
            decimalsToken0: pool.tokens[0].decimal,
            decimalsToken1: pool.tokens[1].decimal,
            getRatio,
            formatAmount: formatConcentratedDerivedAmount,
        });
        if (normalized.amount0 !== amount0) {
            setAmount0(normalized.amount0);
        }
        if (normalized.amount1 !== amount1) {
            setAmount1(normalized.amount1);
        }
        updateLocalDepositPreview(normalized.amount0, normalized.amount1, tickLower, tickUpper);
    }, [
        hasTickRange,
        isRangeBelowCurrent,
        isRangeAboveCurrent,
        tickLower,
        tickUpper,
        amount0,
        amount1,
        isEmptyPool,
    ]);

    useEffect(() => {
        if (!isEmptyPool || !hasTickRange) {
            return;
        }

        updateLocalDepositPreview(amount0, amount1, tickLower, tickUpper);
    }, [isEmptyPool, hasTickRange, tickLower, tickUpper, amount0, amount1]);

    const rangeError = useMemo(() => {
        if (isEmptyPool && !canUseRangeControls) {
            return null;
        }
        if (!hasTickRange || tickSpacing === null) {
            return 'Price range is not set';
        }
        if (tickLower >= tickUpper) {
            return 'Lower bound must be less than upper bound';
        }
        if (tickLower % tickSpacing !== 0 || tickUpper % tickSpacing !== 0) {
            return `Range is not aligned to tick spacing (${tickSpacing})`;
        }
        if (tickLower < minTickBound || tickUpper > maxTickBound) {
            return `Range is out of bounds (${minTickBound}..${maxTickBound})`;
        }
        if (
            isEmptyPool &&
            referenceExactTick !== null &&
            (tickLower > referenceExactTick || tickUpper < referenceExactTick)
        ) {
            return 'Price range does not match entered amounts';
        }

        return null;
    }, [
        hasTickRange,
        tickLower,
        tickUpper,
        tickSpacing,
        minTickBound,
        maxTickBound,
        referenceExactTick,
        isEmptyPool,
        canUseRangeControls,
    ]);

    const activeDepositPreset = useMemo(() => {
        if (!hasTickRange || tickSpacing === null || !Number.isFinite(referencePriceValue)) {
            return null;
        }

        if (tickLower === minTickBound && tickUpper === maxTickBound) {
            return 'full' as const;
        }

        const matched = CONCENTRATED_DEPOSIT_PRESETS.find(item => {
            if (item.key === 'full' || item.lowerFactor === null || item.upperFactor === null) {
                return false;
            }

            const expected = resolvePresetTicks({
                tickSpacing,
                referencePriceValue,
                decimalsDiff,
                minTickBound,
                maxTickBound,
                lowerFactor: item.lowerFactor,
                upperFactor: item.upperFactor,
            });
            if (!expected) {
                return false;
            }
            const [expectedLower, expectedUpper] = expected;
            return tickLower === expectedLower && tickUpper === expectedUpper;
        });

        return matched?.key ?? null;
    }, [
        hasTickRange,
        tickSpacing,
        referencePriceValue,
        tickLower,
        tickUpper,
        minTickBound,
        maxTickBound,
        decimalsDiff,
    ]);

    const isFirstDepositAmountsInvalid = isEmptyPool && !hasBothPositiveAmounts;
    const disableAmount0Input = !isEmptyPool && isRangeBelowCurrent;
    const disableAmount1Input = !isEmptyPool && isRangeAboveCurrent;
    const disableLowerUpByReference =
        isEmptyPool &&
        referenceExactTick !== null &&
        hasTickRange &&
        tickSpacing !== null &&
        (tickLower as number) + tickSpacing > referenceExactTick;
    const disableUpperDownByReference =
        isEmptyPool &&
        referenceExactTick !== null &&
        hasTickRange &&
        tickSpacing !== null &&
        (tickUpper as number) - tickSpacing < referenceExactTick;

    const isMinScientific = /e/i.test(minPriceInput);
    const isMaxScientific = /e/i.test(maxPriceInput);
    const isDepositDisabled =
        !areAmountsFilled ||
        isFirstDepositAmountsInvalid ||
        !canUseRangeControls ||
        !hasTickRange ||
        !!rangeError ||
        !depositEstimate ||
        depositEstimate.liquidityLoading;

    useEffect(() => {
        if (!account) {
            setTokenBalances(new Map());
            return;
        }

        Promise.all(
            pool.tokens.map(async token => {
                const raw =
                    token.type === TokenType.soroban
                        ? await account.getAssetBalance(token)
                        : account.getAssetBalance(token);
                return [getAssetString(token), String(raw || '0')] as [string, string];
            }),
        ).then(next => {
            setTokenBalances(new Map(next));
        });
    }, [account, pool.tokens]);

    useEffect(() => {
        if (!debouncedEstimateRequest) {
            return;
        }

        const {
            amounts,
            tickLower: requestTickLower,
            tickUpper: requestTickUpper,
        } = debouncedEstimateRequest;

        if (!account) {
            setDepositEstimate({ amounts, liquidityDisplay: '0', liquidityLoading: false });
            return;
        }

        if (disableNetworkEstimate) {
            setDepositEstimate({ amounts, liquidityDisplay: '-', liquidityLoading: false });
            return;
        }

        const callId = ++liquidityEstimateCallIdRef.current;
        const desired = new Map([
            [getAssetString(pool.tokens[0]), amounts[0]],
            [getAssetString(pool.tokens[1]), amounts[1]],
        ]);

        SorobanService.amm
            .estimateDepositPosition(
                account.accountId(),
                pool.address,
                pool.tokens,
                requestTickLower,
                requestTickUpper,
                desired,
            )
            .then(result => {
                if (callId !== liquidityEstimateCallIdRef.current) {
                    return;
                }

                const estimatedAmounts =
                    result?.amounts && result.amounts.length === 2 ? result.amounts : amounts;

                setDepositEstimate({
                    amounts: estimatedAmounts,
                    liquidityDisplay: contractValueToFormattedAmount(
                        result?.liquidity || '0',
                        pool.share_token_decimals,
                        true,
                    ),
                    liquidityLoading: false,
                });
            })
            .catch(() => {
                if (callId !== liquidityEstimateCallIdRef.current) {
                    return;
                }
                setDepositEstimate({ amounts, liquidityDisplay: '0', liquidityLoading: false });
            });
    }, [
        debouncedEstimateRequest,
        account,
        pool.address,
        pool.tokens,
        pool.share_token_decimals,
        disableNetworkEstimate,
    ]);

    const load = () => {
        if (skipPoolDataLoading) {
            setTickSpacing(initialTickSpacing);
            setSlot0(null);
            setLoading(false);
            return;
        }

        if (!account || pool.pool_type !== POOL_TYPE.concentrated) {
            return;
        }

        setLoading(true);

        Promise.all([
            SorobanService.amm.getConcentratedSlot0(pool.address),
            SorobanService.amm.getConcentratedTickSpacing(pool.address),
        ])
            .then(([slot, spacing]) => {
                setSlot0(slot as Record<string, unknown>);
                setTickSpacing(spacing);
            })
            .catch(e => {
                ToastService.showErrorToast(e?.message || 'Failed to load concentrated pool data');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        load();
    }, [account, pool.address, skipPoolDataLoading, initialTickSpacing]);

    const handleStepLowerDown = () => {
        if (tickSpacing === null || !canUseRangeControls) {
            return;
        }
        const nextLower = clamp(
            (tickLower ?? minTickBound) - tickSpacing,
            minTickBound,
            (tickUpper ?? maxTickBound) - tickSpacing,
        );
        setSelectedPreset(null);
        applyTickRangeAndRecalculate(nextLower, tickUpper ?? maxTickBound);
    };

    const handleStepLowerUp = () => {
        if (tickSpacing === null || !canUseRangeControls || disableLowerUpByReference) {
            return;
        }
        const nextLower = clamp(
            (tickLower ?? minTickBound) + tickSpacing,
            minTickBound,
            (tickUpper ?? maxTickBound) - tickSpacing,
        );
        setSelectedPreset(null);
        applyTickRangeAndRecalculate(nextLower, tickUpper ?? maxTickBound);
    };

    const handleStepUpperDown = () => {
        if (tickSpacing === null || !canUseRangeControls || disableUpperDownByReference) {
            return;
        }
        const nextUpper = clamp(
            (tickUpper ?? maxTickBound) - tickSpacing,
            (tickLower ?? minTickBound) + tickSpacing,
            maxTickBound,
        );
        setSelectedPreset(null);
        applyTickRangeAndRecalculate(tickLower ?? minTickBound, nextUpper);
    };

    const handleStepUpperUp = () => {
        if (tickSpacing === null || !canUseRangeControls) {
            return;
        }
        const nextUpper = clamp(
            (tickUpper ?? maxTickBound) + tickSpacing,
            (tickLower ?? minTickBound) + tickSpacing,
            maxTickBound,
        );
        setSelectedPreset(null);
        applyTickRangeAndRecalculate(tickLower ?? minTickBound, nextUpper);
    };

    const handleFullRange = () => {
        if (!canUseRangeControls) {
            return;
        }
        setSelectedPreset('full');
        applyTickRangeAndRecalculate(minTickBound, maxTickBound);
    };

    const handlePreset = (presetKey: DepositPresetKey) => {
        if (presetKey === 'full') {
            handleFullRange();
            return;
        }

        if (tickSpacing === null || !canUseRangeControls || !Number.isFinite(referencePriceValue)) {
            return;
        }
        const presetConfig = CONCENTRATED_DEPOSIT_PRESETS.find(({ key }) => key === presetKey);
        if (
            !presetConfig ||
            presetConfig.lowerFactor === null ||
            presetConfig.upperFactor === null
        ) {
            return;
        }
        const preset = resolvePresetTicks({
            tickSpacing,
            referencePriceValue,
            decimalsDiff,
            minTickBound,
            maxTickBound,
            lowerFactor: presetConfig.lowerFactor,
            upperFactor: presetConfig.upperFactor,
        });
        if (!preset) {
            return;
        }
        const [nextLower, nextUpper] = preset;
        setSelectedPreset(presetKey);
        applyTickRangeAndRecalculate(nextLower, nextUpper);
    };

    const handleChartRangeChange = (nextLower: number, nextUpper: number) => {
        if (tickSpacing === null || !canUseRangeControls) {
            return;
        }

        const clampedLower = clamp(
            snapDown(nextLower, tickSpacing),
            minTickBound,
            maxTickBound - tickSpacing,
        );
        const clampedUpper = clamp(
            snapUp(nextUpper, tickSpacing),
            clampedLower + tickSpacing,
            maxTickBound,
        );

        setSelectedPreset(null);
        applyTickRangeAndRecalculate(clampedLower, clampedUpper);
    };

    const showRangeUnavailable =
        tickSpacing === null || (!isEmptyPool && !Number.isFinite(currentTick));

    return {
        account,
        isModalLoading: loading,
        showRangeUnavailable,
        tokenBalances,
        amount0,
        amount1,
        areAmountsFilled,
        isFirstDepositAmountsInvalid,
        disableAmount0Input,
        disableAmount1Input,
        handleAmount0Change,
        handleAmount1Change,
        isEmptyPool,
        hasBothPositiveAmounts,
        referencePriceValue,
        currentTick: Number.isFinite(currentTick) ? currentTick : null,
        referenceExactTick,
        activeDepositPreset,
        canUseRangeControls,
        hasTickRange,
        tickLower,
        tickUpper,
        tickSpacing,
        minTickBound,
        maxTickBound,
        isMinScientific,
        isMaxScientific,
        minPriceInput,
        maxPriceInput,
        disableLowerUpByReference,
        disableUpperDownByReference,
        depositEstimate,
        handlePreset,
        handleChartRangeChange,
        handleStepLowerDown,
        handleStepLowerUp,
        handleStepUpperDown,
        handleStepUpperUp,
        handleMinPriceChange,
        handleMaxPriceChange,
        rangeError,
        isDepositDisabled,
    };
};
