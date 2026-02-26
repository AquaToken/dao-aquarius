import BigNumber from 'bignumber.js';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { NumericFormat } from 'react-number-format';

import { CONCENTRATED_MAX_TICK, CONCENTRATED_MIN_TICK, POOL_TYPE } from 'constants/amm';

import {
    clamp,
    formatConcentratedLiquidityValue,
    formatConcentratedPrice,
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
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import { SorobanService, ToastService } from 'services/globalServices';

import { PoolExtended } from 'types/amm';
import { ModalProps } from 'types/modal';
import { TokenType } from 'types/token';

import Alert from 'basics/Alert';
import Asset from 'basics/Asset';
import AssetLogo from 'basics/AssetLogo';
import Button from 'basics/buttons/Button';
import Input from 'basics/inputs/Input';
import DotsLoader from 'basics/loaders/DotsLoader';
import PageLoader from 'basics/loaders/PageLoader';
import { ModalTitle, ModalWrapper, StickyButtonWrapper } from 'basics/ModalAtoms';

import {
    Balance,
    BalanceClickable,
    CardStack,
    Container,
    CurrentPrice,
    FormRow,
    Label,
    PresetButton,
    Presets,
    PriceControl,
    PriceInput,
    RangeBlock,
    RangeGrid,
    RangeSummary,
    RangeTitle,
    RangeTitleRow,
    Section,
    StepBtn,
    SummaryMain,
    SummaryRows,
    SummarySub,
    SummaryValueRow,
} from './ConcentratedDepositModal.styled';

type ConcentratedDepositModalParams = {
    pool: PoolExtended;
};

const ConcentratedDepositModal = ({
    params,
}: ModalProps<ConcentratedDepositModalParams>): React.ReactNode => {
    const { pool } = params;
    const { account } = useAuthStore();

    const [slot0, setSlot0] = useState<Record<string, unknown> | null>(null);
    const [tickSpacing, setTickSpacing] = useState<number | null>(null);
    const [tickLower, setTickLower] = useState<number | null>(null);
    const [tickUpper, setTickUpper] = useState<number | null>(null);
    const [minPriceInput, setMinPriceInput] = useState('');
    const [maxPriceInput, setMaxPriceInput] = useState('');
    const [amount0, setAmount0] = useState('');
    const [amount1, setAmount1] = useState('');
    const liquidityEstimateTimeoutRef = useRef<number | null>(null);
    const liquidityEstimateCallIdRef = useRef(0);
    const minPriceTimeoutRef = useRef<number | null>(null);
    const maxPriceTimeoutRef = useRef<number | null>(null);
    const lastUserEditedAmountRef = useRef<'token0' | 'token1'>('token0');

    const [depositEstimate, setDepositEstimate] = useState<{
        amounts: string[];
        liquidityDisplay: string;
        liquidityLoading: boolean;
    } | null>(null);
    const [tokenBalances, setTokenBalances] = useState<Map<string, number>>(new Map());

    const [pending, setPending] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = 'Concentrated Deposit';

    const currentTick = Number(slot0?.tick);
    const hasTickRange = tickLower !== null && tickUpper !== null;
    const areAmountsFilled =
        (parseConcentratedAmount(amount0)?.gt(0) ?? false) ||
        (parseConcentratedAmount(amount1)?.gt(0) ?? false);
    const isRangeBelowCurrent =
        hasTickRange && Number.isFinite(currentTick) && currentTick > (tickUpper as number);
    const isRangeAboveCurrent =
        hasTickRange && Number.isFinite(currentTick) && currentTick < (tickLower as number);
    const decimalsDiff = pool.tokens[0].decimal - pool.tokens[1].decimal;
    const currentPriceValue = Number.isFinite(currentTick)
        ? tickToPrice(currentTick, decimalsDiff)
        : NaN;

    const [minTickBound, maxTickBound] = useMemo(() => {
        if (tickSpacing === null) {
            return [0, 0];
        }

        return [
            snapUp(CONCENTRATED_MIN_TICK, tickSpacing),
            snapDown(CONCENTRATED_MAX_TICK, tickSpacing),
        ];
    }, [tickSpacing]);

    useEffect(() => {
        if (tickSpacing === null || !Number.isFinite(currentTick)) {
            return;
        }
        if (tickLower !== null && tickUpper !== null) {
            return;
        }

        const lowerPrice = currentPriceValue / 1.2;
        const upperPrice = currentPriceValue * 1.2;
        const presetLower = clamp(
            snapDown(priceToTick(lowerPrice, decimalsDiff), tickSpacing),
            minTickBound,
            maxTickBound - tickSpacing,
        );
        const presetUpper = clamp(
            snapUp(priceToTick(upperPrice, decimalsDiff), tickSpacing),
            presetLower + tickSpacing,
            maxTickBound,
        );

        setTickLower(
            Number.isFinite(lowerPrice) && lowerPrice > 0
                ? presetLower
                : clamp(
                      snapDown(currentTick - tickSpacing * 5, tickSpacing),
                      minTickBound,
                      maxTickBound - tickSpacing,
                  ),
        );
        setTickUpper(
            Number.isFinite(upperPrice) && upperPrice > 0
                ? presetUpper
                : clamp(
                      snapUp(currentTick + tickSpacing * 5, tickSpacing),
                      minTickBound + tickSpacing,
                      maxTickBound,
                  ),
        );
    }, [
        tickSpacing,
        currentTick,
        tickLower,
        tickUpper,
        minTickBound,
        maxTickBound,
        currentPriceValue,
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

    const formatDerivedAmount = (value: BigNumber.Value, decimals: number) => {
        const bnValue = new BigNumber(value);
        if (!bnValue.isFinite() || bnValue.lt(0)) {
            return '';
        }
        if (bnValue.isZero()) {
            return '0';
        }
        const fixed = bnValue.toFixed(Math.min(10, decimals));
        const normalized = fixed.replace(/\.?0+$/, '');
        return normalized === '' ? '0' : normalized;
    };

    const getInRangeAmount1PerAmount0 = (
        rangeLower: number | null = tickLower,
        rangeUpper: number | null = tickUpper,
    ) => {
        if (rangeLower === null || rangeUpper === null) {
            return null;
        }
        if (!Number.isFinite(currentPriceValue) || currentPriceValue <= 0) {
            return null;
        }

        const lowerPrice = tickToPrice(rangeLower, decimalsDiff);
        const upperPrice = tickToPrice(rangeUpper, decimalsDiff);
        if (!Number.isFinite(lowerPrice) || !Number.isFinite(upperPrice)) {
            return null;
        }
        if (lowerPrice <= 0 || upperPrice <= 0) {
            return null;
        }

        const sqrtPl = new BigNumber(lowerPrice).sqrt();
        const sqrtPu = new BigNumber(upperPrice).sqrt();
        const sqrtP = new BigNumber(currentPriceValue).sqrt();
        const denominator = sqrtPu.minus(sqrtP);

        if (!denominator.isFinite() || denominator.isZero()) {
            return null;
        }

        const ratio = sqrtP
            .minus(sqrtPl)
            .multipliedBy(sqrtP)
            .multipliedBy(sqrtPu)
            .dividedBy(denominator);

        return ratio.isFinite() && ratio.gt(0) ? ratio : null;
    };

    const normalizeForRange = (
        rawAmount0: string,
        rawAmount1: string,
        nextTickLower: number | null,
        nextTickUpper: number | null,
        options?: {
            recalculateInRange?: boolean;
            anchor?: 'token0' | 'token1';
        },
    ) => {
        const normalizedAmount0 = rawAmount0.replaceAll(',', '').trim();
        const normalizedAmount1 = rawAmount1.replaceAll(',', '').trim();
        if (nextTickLower === null || nextTickUpper === null) {
            return { amount0: normalizedAmount0, amount1: normalizedAmount1 };
        }

        const isBelow = Number.isFinite(currentTick) && currentTick > nextTickUpper;
        const isAbove = Number.isFinite(currentTick) && currentTick < nextTickLower;

        if (isBelow) {
            return { amount0: '0', amount1: normalizedAmount1 };
        }
        if (isAbove) {
            return { amount0: normalizedAmount0, amount1: '0' };
        }

        const ratio = getInRangeAmount1PerAmount0(nextTickLower, nextTickUpper);
        if (ratio === null) {
            return { amount0: normalizedAmount0, amount1: normalizedAmount1 };
        }

        const amount0Value = parseConcentratedAmount(normalizedAmount0);
        const amount1Value = parseConcentratedAmount(normalizedAmount1);
        const hasAmount0 = amount0Value?.gt(0) ?? false;
        const hasAmount1 = amount1Value?.gt(0) ?? false;

        if (options?.recalculateInRange) {
            const anchor = options.anchor ?? 'token0';
            if (anchor === 'token0' && hasAmount0) {
                return {
                    amount0: normalizedAmount0,
                    amount1: formatDerivedAmount(
                        amount0Value?.multipliedBy(ratio) ?? 0,
                        pool.tokens[1].decimal,
                    ),
                };
            }
            if (anchor === 'token1' && hasAmount1) {
                return {
                    amount0: formatDerivedAmount(
                        amount1Value?.dividedBy(ratio) ?? 0,
                        pool.tokens[0].decimal,
                    ),
                    amount1: normalizedAmount1,
                };
            }
        }

        if (hasAmount0 && !hasAmount1) {
            return {
                amount0: normalizedAmount0,
                amount1: formatDerivedAmount(
                    amount0Value?.multipliedBy(ratio) ?? 0,
                    pool.tokens[1].decimal,
                ),
            };
        }
        if (hasAmount1 && !hasAmount0) {
            return {
                amount0: formatDerivedAmount(
                    amount1Value?.dividedBy(ratio) ?? 0,
                    pool.tokens[0].decimal,
                ),
                amount1: normalizedAmount1,
            };
        }

        return { amount0: normalizedAmount0, amount1: normalizedAmount1 };
    };

    const updateLocalDepositPreview = (
        nextAmount0: string,
        nextAmount1: string,
        nextTickLower: number | null,
        nextTickUpper: number | null,
    ) => {
        const amount0Value = parseConcentratedAmount(nextAmount0);
        const amount1Value = parseConcentratedAmount(nextAmount1);

        if (
            nextTickLower === null ||
            nextTickUpper === null ||
            nextTickLower >= nextTickUpper ||
            (amount0Value === null && amount1Value === null)
        ) {
            setDepositEstimate(null);
            return;
        }

        const hasAnyAmount = (amount0Value?.gt(0) ?? false) || (amount1Value?.gt(0) ?? false);
        if (!hasAnyAmount) {
            setDepositEstimate(null);
            return;
        }

        const amounts = [nextAmount0 || '0', nextAmount1 || '0'];
        setDepositEstimate({
            amounts,
            liquidityDisplay: '0',
            liquidityLoading: true,
        });

        if (liquidityEstimateTimeoutRef.current) {
            window.clearTimeout(liquidityEstimateTimeoutRef.current);
            liquidityEstimateTimeoutRef.current = null;
        }
        const callId = ++liquidityEstimateCallIdRef.current;

        if (!account) {
            setDepositEstimate({ amounts, liquidityDisplay: '0', liquidityLoading: false });
            return;
        }

        const desired = new Map([
            [getAssetString(pool.tokens[0]), amounts[0]],
            [getAssetString(pool.tokens[1]), amounts[1]],
        ]);

        liquidityEstimateTimeoutRef.current = window.setTimeout(() => {
            SorobanService.amm
                .estimateDepositPosition(
                    account.accountId(),
                    pool.address,
                    pool.tokens,
                    nextTickLower,
                    nextTickUpper,
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
        }, 700);
    };

    const applyTickRangeAndRecalculate = (nextLower: number, nextUpper: number) => {
        if (minPriceTimeoutRef.current) {
            window.clearTimeout(minPriceTimeoutRef.current);
            minPriceTimeoutRef.current = null;
        }
        if (maxPriceTimeoutRef.current) {
            window.clearTimeout(maxPriceTimeoutRef.current);
            maxPriceTimeoutRef.current = null;
        }

        if (nextLower !== tickLower) {
            setTickLower(nextLower);
        }
        if (nextUpper !== tickUpper) {
            setTickUpper(nextUpper);
        }

        const normalized = normalizeForRange(amount0, amount1, nextLower, nextUpper, {
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

    const handleAmount0Change = (value: string) => {
        lastUserEditedAmountRef.current = 'token0';
        const normalized = value.replaceAll(',', '').trim();

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
        const inRangeRatio = getInRangeAmount1PerAmount0();
        const nextAmount0Parsed = parseConcentratedAmount(normalized);
        const nextAmount1 =
            normalized === '' || inRangeRatio === null || !nextAmount0Parsed
                ? ''
                : formatDerivedAmount(
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
        const inRangeRatio = getInRangeAmount1PerAmount0();
        const nextAmount1Parsed = parseConcentratedAmount(normalized);
        const nextAmount0 =
            normalized === '' || inRangeRatio === null || !nextAmount1Parsed
                ? ''
                : formatDerivedAmount(
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
        if (tickSpacing === null || !hasTickRange) {
            return;
        }
        if (minPriceTimeoutRef.current) {
            window.clearTimeout(minPriceTimeoutRef.current);
        }

        minPriceTimeoutRef.current = window.setTimeout(() => {
            const parsed = parseConcentratedPriceInput(value);
            if (parsed === null) {
                return;
            }

            const nextLower = clamp(
                snapDown(priceToTick(parsed, decimalsDiff), tickSpacing),
                minTickBound,
                (tickUpper ?? maxTickBound) - tickSpacing,
            );

            applyTickRangeAndRecalculate(nextLower, tickUpper ?? maxTickBound);
        }, 2000);
    };

    const handleMaxPriceChange = (value: string) => {
        setMaxPriceInput(value);
        if (tickSpacing === null || !hasTickRange) {
            return;
        }
        if (maxPriceTimeoutRef.current) {
            window.clearTimeout(maxPriceTimeoutRef.current);
        }

        maxPriceTimeoutRef.current = window.setTimeout(() => {
            const parsed = parseConcentratedPriceInput(value);
            if (parsed === null) {
                return;
            }

            const nextUpper = clamp(
                snapUp(priceToTick(parsed, decimalsDiff), tickSpacing),
                (tickLower ?? minTickBound) + tickSpacing,
                maxTickBound,
            );

            applyTickRangeAndRecalculate(tickLower ?? minTickBound, nextUpper);
        }, 2000);
    };

    useEffect(() => {
        if (!hasTickRange) {
            return;
        }

        const normalized = normalizeForRange(amount0, amount1, tickLower, tickUpper);
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
    ]);

    const rangeError = useMemo(() => {
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

        return null;
    }, [hasTickRange, tickLower, tickUpper, tickSpacing, minTickBound, maxTickBound]);

    const activeDepositPreset = useMemo(() => {
        if (!hasTickRange || tickSpacing === null || !Number.isFinite(currentPriceValue)) {
            return null;
        }

        if (tickLower === minTickBound && tickUpper === maxTickBound) {
            return 'full' as const;
        }

        const resolvePresetTicks = (multiplier: number) => {
            const lowerPrice = currentPriceValue / multiplier;
            const upperPrice = currentPriceValue * multiplier;
            const expectedLower = clamp(
                snapDown(priceToTick(lowerPrice, decimalsDiff), tickSpacing),
                minTickBound,
                maxTickBound - tickSpacing,
            );
            const expectedUpper = clamp(
                snapUp(priceToTick(upperPrice, decimalsDiff), tickSpacing),
                expectedLower + tickSpacing,
                maxTickBound,
            );

            return [expectedLower, expectedUpper] as const;
        };

        const presets = [
            { key: '2', value: 2 },
            { key: '1.2', value: 1.2 },
            { key: '1.01', value: 1.01 },
        ] as const;

        const matched = presets.find(item => {
            const [expectedLower, expectedUpper] = resolvePresetTicks(item.value);
            return tickLower === expectedLower && tickUpper === expectedUpper;
        });

        return matched?.key ?? null;
    }, [
        hasTickRange,
        tickSpacing,
        currentPriceValue,
        tickLower,
        tickUpper,
        minTickBound,
        maxTickBound,
        decimalsDiff,
    ]);

    const isModalLoading = loading;
    const isMinScientific = /e/i.test(minPriceInput);
    const isMaxScientific = /e/i.test(maxPriceInput);
    const isDepositDisabled =
        !areAmountsFilled ||
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

    useEffect(
        () => () => {
            if (liquidityEstimateTimeoutRef.current) {
                window.clearTimeout(liquidityEstimateTimeoutRef.current);
            }
            if (minPriceTimeoutRef.current) {
                window.clearTimeout(minPriceTimeoutRef.current);
            }
            if (maxPriceTimeoutRef.current) {
                window.clearTimeout(maxPriceTimeoutRef.current);
            }
        },
        [],
    );

    const ensureWalletOpened = () => {
        if (account?.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
    };

    const deposit = () => {
        if (!account || pending || !hasTickRange || rangeError) return;
        if (!areAmountsFilled) {
            ToastService.showErrorToast('Enter amount for at least one token');
            return;
        }
        if (!depositEstimate || depositEstimate.liquidityLoading) {
            ToastService.showErrorToast('Waiting for estimate');
            return;
        }

        const estimatedDesiredAmounts = new Map([
            [getAssetString(pool.tokens[0]), depositEstimate.amounts[0] || '0'],
            [getAssetString(pool.tokens[1]), depositEstimate.amounts[1] || '0'],
        ]);

        ensureWalletOpened();
        setPending(true);

        SorobanService.amm
            .getDepositPositionTx(
                account.accountId(),
                pool.address,
                pool.tokens,
                tickLower,
                tickUpper,
                estimatedDesiredAmounts,
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
            })
            .catch(e => {
                ToastService.showErrorToast(e?.message || 'Deposit failed');
            })
            .finally(() => {
                setPending(false);
            });
    };

    const handleStepLowerDown = () => {
        if (tickSpacing === null) {
            return;
        }
        const nextLower = clamp(
            (tickLower ?? minTickBound) - tickSpacing,
            minTickBound,
            (tickUpper ?? maxTickBound) - tickSpacing,
        );
        applyTickRangeAndRecalculate(nextLower, tickUpper ?? maxTickBound);
    };

    const handleStepLowerUp = () => {
        if (tickSpacing === null) {
            return;
        }
        const nextLower = clamp(
            (tickLower ?? minTickBound) + tickSpacing,
            minTickBound,
            (tickUpper ?? maxTickBound) - tickSpacing,
        );
        applyTickRangeAndRecalculate(nextLower, tickUpper ?? maxTickBound);
    };

    const handleStepUpperDown = () => {
        if (tickSpacing === null) {
            return;
        }
        const nextUpper = clamp(
            (tickUpper ?? maxTickBound) - tickSpacing,
            (tickLower ?? minTickBound) + tickSpacing,
            maxTickBound,
        );
        applyTickRangeAndRecalculate(tickLower ?? minTickBound, nextUpper);
    };

    const handleStepUpperUp = () => {
        if (tickSpacing === null) {
            return;
        }
        const nextUpper = clamp(
            (tickUpper ?? maxTickBound) + tickSpacing,
            (tickLower ?? minTickBound) + tickSpacing,
            maxTickBound,
        );
        applyTickRangeAndRecalculate(tickLower ?? minTickBound, nextUpper);
    };

    const handleFullRange = () => {
        applyTickRangeAndRecalculate(minTickBound, maxTickBound);
    };

    const handlePreset = (multiplier: number) => {
        if (tickSpacing === null) {
            return;
        }
        const lowerPrice = currentPriceValue / multiplier;
        const upperPrice = currentPriceValue * multiplier;
        const nextLower = clamp(
            snapDown(priceToTick(lowerPrice, decimalsDiff), tickSpacing),
            minTickBound,
            maxTickBound - tickSpacing,
        );
        const nextUpper = clamp(
            snapUp(priceToTick(upperPrice, decimalsDiff), tickSpacing),
            nextLower + tickSpacing,
            maxTickBound,
        );
        applyTickRangeAndRecalculate(nextLower, nextUpper);
    };

    return (
        <ModalWrapper>
            <ModalTitle>{title}</ModalTitle>
            <Container>
                {!account && (
                    <Alert title="Wallet required" text="Connect wallet to manage positions." />
                )}

                {isModalLoading ? (
                    <PageLoader />
                ) : (
                    <>
                        <Section>
                            {tickSpacing === null || !Number.isFinite(currentTick) ? (
                                <Alert
                                    title="Range unavailable"
                                    text="Pool price data is not loaded yet."
                                />
                            ) : (
                                <>
                                    <CardStack>
                                        <FormRow>
                                            {tokenBalances.has(getAssetString(pool.tokens[0])) && (
                                                <Balance>
                                                    Available:
                                                    <BalanceClickable
                                                        onClick={() => {
                                                            if (!isRangeBelowCurrent) {
                                                                handleAmount0Change(
                                                                    String(
                                                                        tokenBalances.get(
                                                                            getAssetString(
                                                                                pool.tokens[0],
                                                                            ),
                                                                        ) || 0,
                                                                    ),
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        {' '}
                                                        {formatBalance(
                                                            tokenBalances.get(
                                                                getAssetString(pool.tokens[0]),
                                                            ) || 0,
                                                        )}
                                                    </BalanceClickable>
                                                </Balance>
                                            )}
                                            <NumericFormat
                                                value={amount0}
                                                onValueChange={(values, sourceInfo) => {
                                                    if (sourceInfo.source === 'event') {
                                                        handleAmount0Change(values.value);
                                                    }
                                                }}
                                                placeholder={`Enter ${pool.tokens[0].code} amount`}
                                                customInput={Input}
                                                label={`${pool.tokens[0].code} Amount`}
                                                postfix={
                                                    <Asset asset={pool.tokens[0]} logoAndCode />
                                                }
                                                inputMode="decimal"
                                                allowedDecimalSeparators={[',']}
                                                thousandSeparator=","
                                                decimalScale={
                                                    (pool.tokens[0] as { decimal?: number })
                                                        .decimal ?? 7
                                                }
                                                allowNegative={false}
                                                disabled={isRangeBelowCurrent}
                                            />
                                        </FormRow>

                                        <FormRow>
                                            {tokenBalances.has(getAssetString(pool.tokens[1])) && (
                                                <Balance>
                                                    Available:
                                                    <BalanceClickable
                                                        onClick={() => {
                                                            if (!isRangeAboveCurrent) {
                                                                handleAmount1Change(
                                                                    String(
                                                                        tokenBalances.get(
                                                                            getAssetString(
                                                                                pool.tokens[1],
                                                                            ),
                                                                        ) || 0,
                                                                    ),
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        {' '}
                                                        {formatBalance(
                                                            tokenBalances.get(
                                                                getAssetString(pool.tokens[1]),
                                                            ) || 0,
                                                        )}
                                                    </BalanceClickable>
                                                </Balance>
                                            )}
                                            <NumericFormat
                                                value={amount1}
                                                onValueChange={(values, sourceInfo) => {
                                                    if (sourceInfo.source === 'event') {
                                                        handleAmount1Change(values.value);
                                                    }
                                                }}
                                                placeholder={`Enter ${pool.tokens[1].code} amount`}
                                                customInput={Input}
                                                label={`${pool.tokens[1].code} Amount`}
                                                postfix={
                                                    <Asset asset={pool.tokens[1]} logoAndCode />
                                                }
                                                inputMode="decimal"
                                                allowedDecimalSeparators={[',']}
                                                thousandSeparator=","
                                                decimalScale={
                                                    (pool.tokens[1] as { decimal?: number })
                                                        .decimal ?? 7
                                                }
                                                allowNegative={false}
                                                disabled={isRangeAboveCurrent}
                                            />
                                        </FormRow>
                                    </CardStack>

                                    <RangeBlock>
                                        <RangeTitleRow>
                                            <RangeTitle>Price Range</RangeTitle>
                                            <CurrentPrice>
                                                {formatConcentratedPrice(currentPriceValue)}{' '}
                                                {pool.tokens[1].code} per {pool.tokens[0].code}
                                            </CurrentPrice>
                                        </RangeTitleRow>

                                        <Presets>
                                            <PresetButton
                                                $active={activeDepositPreset === 'full'}
                                                onClick={handleFullRange}
                                            >
                                                Full Range
                                            </PresetButton>
                                            <PresetButton
                                                $active={activeDepositPreset === '2'}
                                                onClick={() => handlePreset(2)}
                                            >
                                                x÷2
                                            </PresetButton>
                                            <PresetButton
                                                $active={activeDepositPreset === '1.2'}
                                                onClick={() => handlePreset(1.2)}
                                            >
                                                x÷1.2
                                            </PresetButton>
                                            <PresetButton
                                                $active={activeDepositPreset === '1.01'}
                                                onClick={() => handlePreset(1.01)}
                                            >
                                                x÷1.01
                                            </PresetButton>
                                        </Presets>

                                        <RangeGrid>
                                            <div>
                                                <Label>Min Price</Label>
                                                <PriceControl>
                                                    <StepBtn onClick={handleStepLowerDown}>
                                                        -
                                                    </StepBtn>
                                                    {hasTickRange &&
                                                    tickLower === minTickBound &&
                                                    tickUpper === maxTickBound ? (
                                                        <PriceInput value="0+" readOnly />
                                                    ) : isMinScientific ? (
                                                        <PriceInput
                                                            value={minPriceInput}
                                                            onChange={event =>
                                                                handleMinPriceChange(
                                                                    event.target.value,
                                                                )
                                                            }
                                                            inputMode="decimal"
                                                        />
                                                    ) : (
                                                        <NumericFormat
                                                            value={minPriceInput}
                                                            onChange={({ target }) =>
                                                                handleMinPriceChange(target.value)
                                                            }
                                                            customInput={PriceInput}
                                                            inputMode="decimal"
                                                            thousandSeparator=","
                                                            decimalScale={7}
                                                            allowNegative={false}
                                                            allowedDecimalSeparators={[',']}
                                                        />
                                                    )}
                                                    <StepBtn onClick={handleStepLowerUp}>+</StepBtn>
                                                </PriceControl>
                                            </div>
                                            <div>
                                                <Label>Max Price</Label>
                                                <PriceControl>
                                                    <StepBtn onClick={handleStepUpperDown}>
                                                        -
                                                    </StepBtn>
                                                    {hasTickRange &&
                                                    tickLower === minTickBound &&
                                                    tickUpper === maxTickBound ? (
                                                        <PriceInput value="∞" readOnly />
                                                    ) : isMaxScientific ? (
                                                        <PriceInput
                                                            value={maxPriceInput}
                                                            onChange={event =>
                                                                handleMaxPriceChange(
                                                                    event.target.value,
                                                                )
                                                            }
                                                            inputMode="decimal"
                                                        />
                                                    ) : (
                                                        <NumericFormat
                                                            value={maxPriceInput}
                                                            onChange={({ target }) =>
                                                                handleMaxPriceChange(target.value)
                                                            }
                                                            customInput={PriceInput}
                                                            inputMode="decimal"
                                                            thousandSeparator=","
                                                            decimalScale={7}
                                                            allowNegative={false}
                                                            allowedDecimalSeparators={[',']}
                                                        />
                                                    )}
                                                    <StepBtn onClick={handleStepUpperUp}>+</StepBtn>
                                                </PriceControl>
                                            </div>
                                        </RangeGrid>

                                        <RangeSummary>
                                            <SummaryMain>
                                                <span>
                                                    Selected Range ({pool.tokens[1].code}/
                                                    {pool.tokens[0].code})
                                                </span>
                                                <span>
                                                    {hasTickRange &&
                                                    tickLower === minTickBound &&
                                                    tickUpper === maxTickBound
                                                        ? 'Full Range'
                                                        : `${minPriceInput} - ${maxPriceInput}`}
                                                </span>
                                            </SummaryMain>
                                            <SummarySub>
                                                <span>Ticks</span>
                                                <span>
                                                    {tickLower ?? '-'} to {tickUpper ?? '-'}
                                                </span>
                                            </SummarySub>
                                            {depositEstimate && (
                                                <SummaryRows>
                                                    <SummaryValueRow>
                                                        <span>{pool.tokens[0].code}</span>
                                                        <span>
                                                            {formatBalance(
                                                                Number(depositEstimate.amounts[0]),
                                                                true,
                                                            )}
                                                            <AssetLogo
                                                                asset={pool.tokens[0]}
                                                                isSmall
                                                                isCircle
                                                            />
                                                        </span>
                                                    </SummaryValueRow>
                                                    <SummaryValueRow>
                                                        <span>{pool.tokens[1].code}</span>
                                                        <span>
                                                            {formatBalance(
                                                                Number(depositEstimate.amounts[1]),
                                                                true,
                                                            )}
                                                            <AssetLogo
                                                                asset={pool.tokens[1]}
                                                                isSmall
                                                                isCircle
                                                            />
                                                        </span>
                                                    </SummaryValueRow>
                                                    <SummaryValueRow>
                                                        <span>Liquidity position</span>
                                                        <span>
                                                            {depositEstimate.liquidityLoading ? (
                                                                <DotsLoader />
                                                            ) : (
                                                                depositEstimate.liquidityDisplay
                                                            )}
                                                        </span>
                                                    </SummaryValueRow>
                                                </SummaryRows>
                                            )}
                                        </RangeSummary>
                                    </RangeBlock>
                                </>
                            )}

                            {rangeError && <Alert title="Invalid range" text={rangeError} />}
                        </Section>

                        <StickyButtonWrapper>
                            <Button
                                fullWidth
                                isBig
                                onClick={deposit}
                                pending={pending}
                                disabled={isDepositDisabled}
                            >
                                Deposit
                            </Button>
                        </StickyButtonWrapper>
                    </>
                )}
            </Container>
        </ModalWrapper>
    );
};

export default ConcentratedDepositModal;
