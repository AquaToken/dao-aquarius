import BigNumber from 'bignumber.js';
import { useMemo } from 'react';

import { CONCENTRATED_MAX_TICK, CONCENTRATED_MIN_TICK } from 'constants/amm';

import { snapDown, snapUp } from 'helpers/amm-concentrated';

import useAuthStore from 'store/authStore/useAuthStore';

import { DepositEstimate, DepositPresetKey, PoolExtended } from 'types/amm';

import { useConcentratedDepositEstimate } from './useConcentratedDepositEstimate';
import { useConcentratedPoolData } from './useConcentratedPoolData';
import { useConcentratedRangeFormState } from './useConcentratedRangeFormState';

type Params = {
    pool: PoolExtended;
    initialTickSpacing?: number | null;
    skipPoolDataLoading?: boolean;
    disableNetworkEstimate?: boolean;
};

type ReturnValue = {
    account: ReturnType<typeof useAuthStore>['account'];
    isModalLoading: boolean;
    showRangeUnavailable: boolean;
    tokenBalances: Map<string, string>;
    amount0: string;
    amount1: string;
    areAmountsFilled: boolean;
    isFirstDepositAmountsInvalid: boolean;
    disableAmount0Input: boolean;
    disableAmount1Input: boolean;
    handleAmount0Change: (value: string) => void;
    handleAmount1Change: (value: string) => void;
    isEmptyPool: boolean;
    hasBothPositiveAmounts: boolean;
    referencePriceValue: number;
    currentTick: number | null;
    referenceExactTick: number | null;
    activeDepositPreset: DepositPresetKey | null;
    canUseRangeControls: boolean;
    hasTickRange: boolean;
    tickLower: number | null;
    tickUpper: number | null;
    tickSpacing: number | null;
    minTickBound: number;
    maxTickBound: number;
    isMinScientific: boolean;
    isMaxScientific: boolean;
    minPriceInput: string;
    maxPriceInput: string;
    disableLowerUpByReference: boolean;
    disableUpperDownByReference: boolean;
    depositEstimate: DepositEstimate | null;
    handlePreset: (presetKey: DepositPresetKey) => void;
    handleChartRangeChange: (nextLower: number, nextUpper: number) => void;
    handleStepLowerDown: () => void;
    handleStepLowerUp: () => void;
    handleStepUpperDown: () => void;
    handleStepUpperUp: () => void;
    handleMinPriceChange: (value: string) => void;
    handleMaxPriceChange: (value: string) => void;
    rangeError: string | null;
    isDepositDisabled: boolean;
};

export const useConcentratedAddLiquidityForm = ({
    pool,
    initialTickSpacing = null,
    skipPoolDataLoading = false,
    disableNetworkEstimate = false,
}: Params): ReturnValue => {
    const { account } = useAuthStore();

    const { slot0, tickSpacing, tokenBalances, loading } = useConcentratedPoolData({
        pool,
        initialTickSpacing,
        skipPoolDataLoading,
    });

    const isEmptyPool = new BigNumber(pool.total_share || pool.liquidity || '0').lte(0);
    const currentTick = Number(slot0?.tick);

    const [minTickBound, maxTickBound] = useMemo(() => {
        if (tickSpacing === null) {
            return [0, 0];
        }

        return [
            snapUp(CONCENTRATED_MIN_TICK, tickSpacing),
            snapDown(CONCENTRATED_MAX_TICK, tickSpacing),
        ];
    }, [tickSpacing]);

    const { depositEstimate, updateLocalDepositPreview } = useConcentratedDepositEstimate({
        pool,
        disableNetworkEstimate,
    });

    const rangeState = useConcentratedRangeFormState({
        pool,
        isEmptyPool,
        currentTick,
        tickSpacing,
        minTickBound,
        maxTickBound,
        onPreviewChange: updateLocalDepositPreview,
    });

    const showRangeUnavailable =
        tickSpacing === null || (!isEmptyPool && !Number.isFinite(currentTick));
    const isDepositDisabled =
        !rangeState.areAmountsFilled ||
        rangeState.isFirstDepositAmountsInvalid ||
        !rangeState.canUseRangeControls ||
        !rangeState.hasTickRange ||
        !!rangeState.rangeError ||
        !depositEstimate ||
        depositEstimate.liquidityLoading;

    return {
        account,
        isModalLoading: loading,
        showRangeUnavailable,
        tokenBalances,
        amount0: rangeState.amount0,
        amount1: rangeState.amount1,
        areAmountsFilled: rangeState.areAmountsFilled,
        isFirstDepositAmountsInvalid: rangeState.isFirstDepositAmountsInvalid,
        disableAmount0Input: rangeState.disableAmount0Input,
        disableAmount1Input: rangeState.disableAmount1Input,
        handleAmount0Change: rangeState.handleAmount0Change,
        handleAmount1Change: rangeState.handleAmount1Change,
        isEmptyPool,
        hasBothPositiveAmounts: rangeState.hasBothPositiveAmounts,
        referencePriceValue: rangeState.referencePriceValue,
        currentTick: Number.isFinite(currentTick) ? currentTick : null,
        referenceExactTick: rangeState.referenceExactTick,
        activeDepositPreset: rangeState.activeDepositPreset,
        canUseRangeControls: rangeState.canUseRangeControls,
        hasTickRange: rangeState.hasTickRange,
        tickLower: rangeState.tickLower,
        tickUpper: rangeState.tickUpper,
        tickSpacing,
        minTickBound,
        maxTickBound,
        isMinScientific: rangeState.isMinScientific,
        isMaxScientific: rangeState.isMaxScientific,
        minPriceInput: rangeState.minPriceInput,
        maxPriceInput: rangeState.maxPriceInput,
        disableLowerUpByReference: rangeState.disableLowerUpByReference,
        disableUpperDownByReference: rangeState.disableUpperDownByReference,
        depositEstimate,
        handlePreset: rangeState.handlePreset,
        handleChartRangeChange: rangeState.handleChartRangeChange,
        handleStepLowerDown: rangeState.handleStepLowerDown,
        handleStepLowerUp: rangeState.handleStepLowerUp,
        handleStepUpperDown: rangeState.handleStepUpperDown,
        handleStepUpperUp: rangeState.handleStepUpperUp,
        handleMinPriceChange: rangeState.handleMinPriceChange,
        handleMaxPriceChange: rangeState.handleMaxPriceChange,
        rangeError: rangeState.rangeError,
        isDepositDisabled,
    };
};
