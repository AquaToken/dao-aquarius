import * as React from 'react';

import { CONCENTRATED_DEPOSIT_PRESETS } from 'constants/amm';

import { formatBalance } from 'helpers/format-number';

import { DepositEstimate, DepositPresetKey, PoolExtended } from 'types/amm';

import Alert from 'basics/Alert';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { COLORS } from 'styles/style-constants';

import LiquidityDistributionChart, {
    type LiquidityDistributionChartHandle,
} from 'pages/amm/components/LiquidityDistributionChart/LiquidityDistributionChart';

import AddLiquidityEstimateSummary from './AddLiquidityEstimateSummary';
import RangePriceInput from './RangePriceInput';

import {
    CurrentPrice,
    PresetButton,
    PresetButtonInner,
    PresetRange,
    PresetTitle,
    Presets,
    PresetTooltipText,
    RangeChartWrap,
    RangeBlock,
    RangeGrid,
    RangeTitle,
    RangeTitleRow,
} from '../../styled/ConcentratedAddLiquidity.styled';

export type AddLiquidityPriceRangeSectionProps = {
    pool: PoolExtended;
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
    onPreset: (presetKey: DepositPresetKey) => void;
    onChartRangeChange: (tickLower: number, tickUpper: number) => void;
    onStepLowerDown: () => void;
    onStepLowerUp: () => void;
    onStepUpperDown: () => void;
    onStepUpperUp: () => void;
    onMinPriceChange: (value: string) => void;
    onMaxPriceChange: (value: string) => void;
};

const AddLiquidityPriceRangeSection = ({
    pool,
    isEmptyPool,
    hasBothPositiveAmounts,
    referencePriceValue,
    currentTick,
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
    onPreset,
    onChartRangeChange,
    onStepLowerDown,
    onStepLowerUp,
    onStepUpperDown,
    onStepUpperUp,
    onMinPriceChange,
    onMaxPriceChange,
}: AddLiquidityPriceRangeSectionProps): React.ReactNode => {
    const chartRef = React.useRef<LiquidityDistributionChartHandle>(null);
    const displayPrice = React.useMemo(() => {
        if (!Number.isFinite(referencePriceValue) || referencePriceValue <= 0) {
            return null;
        }

        return 1 / referencePriceValue;
    }, [referencePriceValue]);

    const handlePresetClick = (presetKey: DepositPresetKey) => {
        onPreset(presetKey);
        window.requestAnimationFrame(() => {
            chartRef.current?.resetView();
        });
    };

    return (
        <RangeBlock>
            <RangeTitleRow>
                <RangeTitle>Price Range</RangeTitle>
                <CurrentPrice>
                    1 {pool.tokens[1].code} ={' '}
                    {displayPrice ? formatBalance(displayPrice, true) : '-'} {pool.tokens[0].code}
                </CurrentPrice>
            </RangeTitleRow>

            {isEmptyPool && !hasBothPositiveAmounts ? (
                <Alert
                    title="Set initial price"
                    text="Enter both token amounts to initialize price and range controls."
                />
            ) : (
                <>
                    <Presets>
                        {CONCENTRATED_DEPOSIT_PRESETS.map(preset => (
                            <Tooltip
                                key={preset.key}
                                showOnHover
                                fullWidth
                                matchTriggerWidth
                                position={TOOLTIP_POSITION.top}
                                background={COLORS.textPrimary}
                                content={
                                    <PresetTooltipText>{preset.description}</PresetTooltipText>
                                }
                            >
                                <PresetButton
                                    type="button"
                                    $active={activeDepositPreset === preset.key}
                                    onClick={() => handlePresetClick(preset.key)}
                                    disabled={!canUseRangeControls}
                                >
                                    <PresetButtonInner $active={activeDepositPreset === preset.key}>
                                        <PresetTitle>{preset.label}</PresetTitle>
                                        {preset.rangeLabel ? (
                                            <PresetRange>{preset.rangeLabel}</PresetRange>
                                        ) : null}
                                    </PresetButtonInner>
                                </PresetButton>
                            </Tooltip>
                        ))}
                    </Presets>

                    <RangeGrid>
                        <RangePriceInput
                            label="Min Price"
                            value={minPriceInput}
                            disabled={!canUseRangeControls}
                            isScientific={isMinScientific}
                            isFullRange={
                                hasTickRange &&
                                tickLower === minTickBound &&
                                tickUpper === maxTickBound
                            }
                            fullRangeValue="0+"
                            incrementDisabled={disableLowerUpByReference}
                            onChange={onMinPriceChange}
                            onStepDown={onStepLowerDown}
                            onStepUp={onStepLowerUp}
                        />

                        <RangePriceInput
                            label="Max Price"
                            value={maxPriceInput}
                            disabled={!canUseRangeControls}
                            isScientific={isMaxScientific}
                            isFullRange={
                                hasTickRange &&
                                tickLower === minTickBound &&
                                tickUpper === maxTickBound
                            }
                            fullRangeValue="∞"
                            decrementDisabled={disableUpperDownByReference}
                            onChange={onMaxPriceChange}
                            onStepDown={onStepUpperDown}
                            onStepUp={onStepUpperUp}
                        />
                    </RangeGrid>

                    <RangeChartWrap>
                        <LiquidityDistributionChart
                            ref={chartRef}
                            pool={pool}
                            title="Range Preview"
                            currentTickOverride={isEmptyPool ? referenceExactTick : currentTick}
                            selectableRange={{
                                tickLower,
                                tickUpper,
                                tickSpacing,
                                minTickBound,
                                maxTickBound,
                                disabled: !canUseRangeControls,
                                onChange: onChartRangeChange,
                            }}
                        />
                    </RangeChartWrap>

                    <AddLiquidityEstimateSummary
                        pool={pool}
                        hasTickRange={hasTickRange}
                        tickLower={tickLower}
                        tickUpper={tickUpper}
                        minTickBound={minTickBound}
                        maxTickBound={maxTickBound}
                        minPriceInput={minPriceInput}
                        maxPriceInput={maxPriceInput}
                        depositEstimate={depositEstimate}
                    />
                </>
            )}
        </RangeBlock>
    );
};

export default AddLiquidityPriceRangeSection;
