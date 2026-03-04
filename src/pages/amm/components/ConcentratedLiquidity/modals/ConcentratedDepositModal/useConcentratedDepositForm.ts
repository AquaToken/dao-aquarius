import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
    CONCENTRATED_DEPOSIT_DEFAULT_PRESET_MULTIPLIER,
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
    formatConcentratedLiquidityValue,
    formatConcentratedPriceInputValue,
    isValidNonNegativeConcentratedAmount,
    parseConcentratedAmount,
    parseConcentratedPriceInput,
    priceToTick,
    snapDown,
    snapUp,
    tickToPrice,
} from 'helpers/amm-concentrated';
import { getAssetString } from 'helpers/assets';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { useDebounce } from 'hooks/useDebounce';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import { SorobanService, ToastService } from 'services/globalServices';

import { DepositEstimate, PoolExtended } from 'types/amm';
import { TokenType } from 'types/token';

import {
    getInRangeAmount1PerAmount0,
    normalizeForRange,
    resolvePresetTicks,
} from './depositRangeUtils';

type DepositPresetKey = 'full' | '2' | '1.2' | '1.01';

type Params = {
    pool: PoolExtended;
    close: () => void;
};

export const useConcentratedDepositForm = ({ pool, close }: Params) => {
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
    const [tokenBalances, setTokenBalances] = useState<Map<string, number>>(new Map());
    const [pending, setPending] = useState(false);
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

    const referenceTick = useMemo(() => {
        if (
            tickSpacing === null ||
            !Number.isFinite(referencePriceValue) ||
            referencePriceValue <= 0
        ) {
            return null;
        }

        return clamp(
            snapDown(priceToTick(referencePriceValue, decimalsDiff), tickSpacing),
            minTickBound,
            maxTickBound,
        );
    }, [tickSpacing, referencePriceValue, decimalsDiff, minTickBound, maxTickBound]);

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

        const preset = resolvePresetTicks({
            tickSpacing,
            referencePriceValue,
            decimalsDiff,
            minTickBound,
            maxTickBound,
            multiplier: CONCENTRATED_DEPOSIT_DEFAULT_PRESET_MULTIPLIER,
        });
        if (!preset) {
            return;
        }
        const [presetLower, presetUpper] = preset;

        setTickLower(presetLower);
        setTickUpper(presetUpper);
        setSelectedPreset(
            String(CONCENTRATED_DEPOSIT_DEFAULT_PRESET_MULTIPLIER) as DepositPresetKey,
        );
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
    }, [
        tickLower,
        tickUpper,
        minTickBound,
        maxTickBound,
        decimalsDiff,
        minPriceInput,
        maxPriceInput,
    ]);

    const getRatio = (lower: number | null, upper: number | null) =>
        getInRangeAmount1PerAmount0({
            rangeLower: lower,
            rangeUpper: upper,
            referencePriceValue,
            decimalsDiff,
        });

    const updateLocalDepositPreview = (
        nextAmount0: string,
        nextAmount1: string,
        nextTickLower: number | null,
        nextTickUpper: number | null,
    ) => {
        const nextAmount0Value = parseConcentratedAmount(nextAmount0);
        const nextAmount1Value = parseConcentratedAmount(nextAmount1);

        if (
            nextTickLower === null ||
            nextTickUpper === null ||
            nextTickLower >= nextTickUpper ||
            (nextAmount0Value === null && nextAmount1Value === null)
        ) {
            setDepositEstimate(null);
            setEstimateRequest(null);
            return;
        }

        const hasAnyAmount =
            (nextAmount0Value?.gt(0) ?? false) || (nextAmount1Value?.gt(0) ?? false);
        if (!hasAnyAmount) {
            setDepositEstimate(null);
            setEstimateRequest(null);
            return;
        }

        const amounts = [nextAmount0 || '0', nextAmount1 || '0'] as [string, string];
        setDepositEstimate({
            amounts,
            liquidityDisplay: '0',
            liquidityLoading: true,
        });
        setEstimateRequest({
            amounts,
            tickLower: nextTickLower,
            tickUpper: nextTickUpper,
        });
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

        const preset = resolvePresetTicks({
            tickSpacing,
            referencePriceValue,
            decimalsDiff,
            minTickBound,
            maxTickBound,
            multiplier: Number(selectedPreset),
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

    const handleAmount0Change = (value: string) => {
        lastUserEditedAmountRef.current = 'token0';
        const normalized = value.replaceAll(',', '').trim();

        if (isEmptyPool) {
            if (normalized !== '' && !isValidNonNegativeConcentratedAmount(normalized)) {
                return;
            }
            if (normalized !== amount0) {
                setAmount0(normalized);
            }
            updateLocalDepositPreview(normalized, amount1, tickLower, tickUpper);
            return;
        }

        if (isRangeBelowCurrent) {
            if (amount0 !== '0') {
                setAmount0('0');
            }
            return;
        }

        if (isRangeAboveCurrent) {
            if (normalized !== '' && !isValidNonNegativeConcentratedAmount(normalized)) {
                return;
            }
            const nextAmount0 = normalized;
            const nextAmount1 = '0';
            if (nextAmount0 !== amount0) {
                setAmount0(nextAmount0);
            }
            if (nextAmount1 !== amount1) {
                setAmount1(nextAmount1);
            }
            updateLocalDepositPreview(nextAmount0, nextAmount1, tickLower, tickUpper);
            return;
        }

        if (normalized !== '' && !isValidNonNegativeConcentratedAmount(normalized)) {
            return;
        }
        const nextAmount0 = normalized;
        const inRangeRatio = getRatio(tickLower, tickUpper);
        const nextAmount0Parsed = parseConcentratedAmount(normalized);
        const nextAmount1 =
            normalized === '' || inRangeRatio === null || !nextAmount0Parsed
                ? ''
                : formatConcentratedDerivedAmount(
                      nextAmount0Parsed.multipliedBy(inRangeRatio),
                      pool.tokens[1].decimal,
                  );
        if (nextAmount0 !== amount0) {
            setAmount0(nextAmount0);
        }
        if (nextAmount1 !== amount1) {
            setAmount1(nextAmount1);
        }
        updateLocalDepositPreview(nextAmount0, nextAmount1, tickLower, tickUpper);
    };

    const handleAmount1Change = (value: string) => {
        lastUserEditedAmountRef.current = 'token1';
        const normalized = value.replaceAll(',', '').trim();

        if (isEmptyPool) {
            if (normalized !== '' && !isValidNonNegativeConcentratedAmount(normalized)) {
                return;
            }
            if (normalized !== amount1) {
                setAmount1(normalized);
            }
            updateLocalDepositPreview(amount0, normalized, tickLower, tickUpper);
            return;
        }

        if (isRangeAboveCurrent) {
            if (amount1 !== '0') {
                setAmount1('0');
            }
            return;
        }

        if (isRangeBelowCurrent) {
            if (normalized !== '' && !isValidNonNegativeConcentratedAmount(normalized)) {
                return;
            }
            const nextAmount1 = normalized;
            const nextAmount0 = '0';
            if (nextAmount1 !== amount1) {
                setAmount1(nextAmount1);
            }
            if (nextAmount0 !== amount0) {
                setAmount0(nextAmount0);
            }
            updateLocalDepositPreview(nextAmount0, nextAmount1, tickLower, tickUpper);
            return;
        }

        if (normalized !== '' && !isValidNonNegativeConcentratedAmount(normalized)) {
            return;
        }
        const nextAmount1 = normalized;
        const inRangeRatio = getRatio(tickLower, tickUpper);
        const nextAmount1Parsed = parseConcentratedAmount(normalized);
        const nextAmount0 =
            normalized === '' || inRangeRatio === null || !nextAmount1Parsed
                ? ''
                : formatConcentratedDerivedAmount(
                      nextAmount1Parsed.dividedBy(inRangeRatio),
                      pool.tokens[0].decimal,
                  );
        if (nextAmount1 !== amount1) {
            setAmount1(nextAmount1);
        }
        if (nextAmount0 !== amount0) {
            setAmount0(nextAmount0);
        }
        updateLocalDepositPreview(nextAmount0, nextAmount1, tickLower, tickUpper);
    };

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
        if (referenceTick !== null && (tickLower > referenceTick || tickUpper < referenceTick)) {
            return isEmptyPool
                ? 'Price range does not match entered amounts'
                : 'Price range must include current pool price';
        }

        return null;
    }, [
        hasTickRange,
        tickLower,
        tickUpper,
        tickSpacing,
        minTickBound,
        maxTickBound,
        referenceTick,
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
            const expected = resolvePresetTicks({
                tickSpacing,
                referencePriceValue,
                decimalsDiff,
                minTickBound,
                maxTickBound,
                multiplier: item.multiplier,
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
        referenceTick !== null &&
        hasTickRange &&
        tickSpacing !== null &&
        (tickLower as number) + tickSpacing > referenceTick;
    const disableUpperDownByReference =
        isEmptyPool &&
        referenceTick !== null &&
        hasTickRange &&
        tickSpacing !== null &&
        (tickUpper as number) - tickSpacing < referenceTick;

    const isModalLoading = loading;
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
                return [getAssetString(token), Number(raw || 0)] as [string, number];
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
                    liquidityDisplay: formatConcentratedLiquidityValue(
                        result?.liquidity || '0',
                        pool.share_token_decimals,
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
    }, [debouncedEstimateRequest, account, pool.address, pool.tokens, pool.share_token_decimals]);

    const load = () => {
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
    }, [account, pool.address]);

    const deposit = () => {
        if (!account || pending || !hasTickRange || rangeError) return;
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        if (!areAmountsFilled) {
            ToastService.showErrorToast('Enter amount for at least one token');
            return;
        }
        if (isFirstDepositAmountsInvalid) {
            ToastService.showErrorToast(
                'For the first deposit both token amounts must be greater than zero',
            );
            return;
        }
        if (!depositEstimate || depositEstimate.liquidityLoading) {
            ToastService.showErrorToast('Waiting for estimate');
            return;
        }

        const desiredAmountsFromInputs = new Map([
            [getAssetString(pool.tokens[0]), amount0 || '0'],
            [getAssetString(pool.tokens[1]), amount1 || '0'],
        ]);

        setPending(true);

        SorobanService.amm
            .getDepositPositionTx(
                account.accountId(),
                pool.address,
                pool.tokens,
                tickLower,
                tickUpper,
                desiredAmountsFromInputs,
                '1',
            )
            .then(tx => account.signAndSubmitTx(tx, true))
            .then((res: { status?: BuildSignAndSubmitStatuses }) => {
                if (!res) {
                    return;
                }

                if (res.status === BuildSignAndSubmitStatuses.pending) {
                    ToastService.showSuccessToast('More signatures required to complete');
                    return;
                }

                ToastService.showSuccessToast('Concentrated position deposited');
                setAmount0('');
                setAmount1('');
                setDepositEstimate(null);
                load();
                close();
            })
            .catch(e => {
                ToastService.showErrorToast(e?.message || 'Deposit failed');
            })
            .finally(() => {
                setPending(false);
            });
    };

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

    const handlePreset = (multiplier: number) => {
        if (tickSpacing === null || !canUseRangeControls || !Number.isFinite(referencePriceValue)) {
            return;
        }
        const preset = resolvePresetTicks({
            tickSpacing,
            referencePriceValue,
            decimalsDiff,
            minTickBound,
            maxTickBound,
            multiplier,
        });
        if (!preset) {
            return;
        }
        const [nextLower, nextUpper] = preset;
        setSelectedPreset(String(multiplier) as Exclude<DepositPresetKey, 'full'>);
        applyTickRangeAndRecalculate(nextLower, nextUpper);
    };

    const showRangeUnavailable =
        tickSpacing === null || (!isEmptyPool && !Number.isFinite(currentTick));

    return {
        account,
        isModalLoading,
        showRangeUnavailable,
        tokenBalances,
        amount0,
        amount1,
        disableAmount0Input,
        disableAmount1Input,
        handleAmount0Change,
        handleAmount1Change,
        isEmptyPool,
        hasBothPositiveAmounts,
        referencePriceValue,
        activeDepositPreset,
        canUseRangeControls,
        hasTickRange,
        tickLower,
        tickUpper,
        minTickBound,
        maxTickBound,
        isMinScientific,
        isMaxScientific,
        minPriceInput,
        maxPriceInput,
        disableLowerUpByReference,
        disableUpperDownByReference,
        depositEstimate,
        handleFullRange,
        handlePreset,
        handleStepLowerDown,
        handleStepLowerUp,
        handleStepUpperDown,
        handleStepUpperUp,
        handleMinPriceChange,
        handleMaxPriceChange,
        rangeError,
        deposit,
        pending,
        isDepositDisabled,
    };
};
