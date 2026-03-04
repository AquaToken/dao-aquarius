import * as React from 'react';
import { NumericFormat } from 'react-number-format';

import { CONCENTRATED_DEPOSIT_PRESETS } from 'constants/amm';

import { formatConcentratedPrice } from 'helpers/amm-concentrated';

import { DepositEstimate, PoolExtended } from 'types/amm';

import Alert from 'basics/Alert';

import {
    CurrentPrice,
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
    StepBtn,
    SummaryMain,
    SummarySub,
} from './ConcentratedDepositModal.styled';
import DepositEstimateSummary from './DepositEstimateSummary';
type DepositPresetKey = 'full' | '2' | '1.2' | '1.01';

export type DepositPriceRangeSectionProps = {
    pool: PoolExtended;
    isEmptyPool: boolean;
    hasBothPositiveAmounts: boolean;
    referencePriceValue: number;
    activeDepositPreset: DepositPresetKey | null;
    canUseRangeControls: boolean;
    hasTickRange: boolean;
    tickLower: number | null;
    tickUpper: number | null;
    minTickBound: number;
    maxTickBound: number;
    isMinScientific: boolean;
    isMaxScientific: boolean;
    minPriceInput: string;
    maxPriceInput: string;
    disableLowerUpByReference: boolean;
    disableUpperDownByReference: boolean;
    depositEstimate: DepositEstimate | null;
    onFullRange: () => void;
    onPreset: (multiplier: number) => void;
    onStepLowerDown: () => void;
    onStepLowerUp: () => void;
    onStepUpperDown: () => void;
    onStepUpperUp: () => void;
    onMinPriceChange: (value: string) => void;
    onMaxPriceChange: (value: string) => void;
};

const DepositPriceRangeSection = ({
    pool,
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
    onFullRange,
    onPreset,
    onStepLowerDown,
    onStepLowerUp,
    onStepUpperDown,
    onStepUpperUp,
    onMinPriceChange,
    onMaxPriceChange,
}: DepositPriceRangeSectionProps): React.ReactNode => (
    <RangeBlock>
        <RangeTitleRow>
            <RangeTitle>Price Range</RangeTitle>
            <CurrentPrice>
                {Number.isFinite(referencePriceValue)
                    ? formatConcentratedPrice(referencePriceValue)
                    : '-'}{' '}
                {pool.tokens[1].code} per {pool.tokens[0].code}
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
                    <PresetButton
                        $active={activeDepositPreset === 'full'}
                        onClick={onFullRange}
                        disabled={!canUseRangeControls}
                    >
                        Full Range
                    </PresetButton>
                    {CONCENTRATED_DEPOSIT_PRESETS.map(preset => (
                        <PresetButton
                            key={preset.key}
                            $active={activeDepositPreset === preset.key}
                            onClick={() => onPreset(preset.multiplier)}
                            disabled={!canUseRangeControls}
                        >
                            {preset.label}
                        </PresetButton>
                    ))}
                </Presets>

                <RangeGrid>
                    <div>
                        <Label>Min Price</Label>
                        <PriceControl>
                            <StepBtn onClick={onStepLowerDown} disabled={!canUseRangeControls}>
                                -
                            </StepBtn>
                            {hasTickRange &&
                            tickLower === minTickBound &&
                            tickUpper === maxTickBound ? (
                                <PriceInput value="0+" readOnly disabled={!canUseRangeControls} />
                            ) : isMinScientific ? (
                                <PriceInput
                                    value={minPriceInput}
                                    onChange={event => onMinPriceChange(event.target.value)}
                                    inputMode="decimal"
                                    disabled={!canUseRangeControls}
                                />
                            ) : (
                                <NumericFormat
                                    value={minPriceInput}
                                    onChange={({ target }) => onMinPriceChange(target.value)}
                                    customInput={PriceInput}
                                    inputMode="decimal"
                                    thousandSeparator=","
                                    decimalScale={7}
                                    allowNegative={false}
                                    allowedDecimalSeparators={[',']}
                                    disabled={!canUseRangeControls}
                                />
                            )}
                            <StepBtn
                                onClick={onStepLowerUp}
                                disabled={!canUseRangeControls || disableLowerUpByReference}
                            >
                                +
                            </StepBtn>
                        </PriceControl>
                    </div>
                    <div>
                        <Label>Max Price</Label>
                        <PriceControl>
                            <StepBtn
                                onClick={onStepUpperDown}
                                disabled={!canUseRangeControls || disableUpperDownByReference}
                            >
                                -
                            </StepBtn>
                            {hasTickRange &&
                            tickLower === minTickBound &&
                            tickUpper === maxTickBound ? (
                                <PriceInput value="∞" readOnly disabled={!canUseRangeControls} />
                            ) : isMaxScientific ? (
                                <PriceInput
                                    value={maxPriceInput}
                                    onChange={event => onMaxPriceChange(event.target.value)}
                                    inputMode="decimal"
                                    disabled={!canUseRangeControls}
                                />
                            ) : (
                                <NumericFormat
                                    value={maxPriceInput}
                                    onChange={({ target }) => onMaxPriceChange(target.value)}
                                    customInput={PriceInput}
                                    inputMode="decimal"
                                    thousandSeparator=","
                                    decimalScale={7}
                                    allowNegative={false}
                                    allowedDecimalSeparators={[',']}
                                    disabled={!canUseRangeControls}
                                />
                            )}
                            <StepBtn onClick={onStepUpperUp} disabled={!canUseRangeControls}>
                                +
                            </StepBtn>
                        </PriceControl>
                    </div>
                </RangeGrid>

                <RangeSummary>
                    <SummaryMain>
                        <span>
                            Selected Range ({pool.tokens[1].code}/{pool.tokens[0].code})
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
                    <DepositEstimateSummary pool={pool} depositEstimate={depositEstimate} />
                </RangeSummary>
            </>
        )}
    </RangeBlock>
);

export default DepositPriceRangeSection;
