import * as React from 'react';
import { useEffect, useMemo } from 'react';

import { getAssetString } from 'helpers/assets';

import { DepositEstimate, PoolExtended } from 'types/amm';

import Alert from 'basics/Alert';
import PageLoader from 'basics/loaders/PageLoader';

import ConcentratedAddLiquidityPoolInfo from './ConcentratedAddLiquidityPoolInfo';
import AddLiquidityAmountsSection from './sections/AddLiquidityAmountsSection';
import AddLiquidityPriceRangeSection from './sections/AddLiquidityPriceRangeSection';

import { useConcentratedAddLiquidityForm } from '../hooks/useConcentratedAddLiquidityForm';
import { Container, Section } from '../styled/ConcentratedAddLiquidity.styled';

export type ConcentratedAddLiquidityFormData = {
    amount0: string;
    amount1: string;
    tokenBalances: Map<string, string>;
    tickLower: number | null;
    tickUpper: number | null;
    rangeError: string | null;
    hasTickRange: boolean;
    areAmountsFilled: boolean;
    isFirstDepositAmountsInvalid: boolean;
    isDepositDisabled: boolean;
    depositEstimate: DepositEstimate | null;
};

type ConcentratedAddLiquidityFormProps = {
    pool: PoolExtended;
    onDataChange?: (data: ConcentratedAddLiquidityFormData) => void;
    initialTickSpacing?: number | null;
    skipPoolDataLoading?: boolean;
    disableNetworkEstimate?: boolean;
};

const ConcentratedAddLiquidityForm = ({
    pool,
    onDataChange,
    initialTickSpacing,
    skipPoolDataLoading,
    disableNetworkEstimate,
}: ConcentratedAddLiquidityFormProps): React.ReactNode => {
    const form = useConcentratedAddLiquidityForm({
        pool,
        initialTickSpacing,
        skipPoolDataLoading,
        disableNetworkEstimate,
    });
    const hasIncentiveTps = Object.values(pool.incentive_tps_per_token || {}).some(
        value => Number(value) > 0,
    );
    const shouldShowPoolInfo = Number(pool.reward_tps) > 0 || hasIncentiveTps;
    const amounts = useMemo(
        () =>
            new Map<string, string>([
                [getAssetString(pool.tokens[0]), form.amount0],
                [getAssetString(pool.tokens[1]), form.amount1],
            ]),
        [pool.tokens, form.amount0, form.amount1],
    );

    useEffect(() => {
        if (!onDataChange) {
            return;
        }

        onDataChange({
            amount0: form.amount0,
            amount1: form.amount1,
            tokenBalances: form.tokenBalances,
            tickLower: form.tickLower,
            tickUpper: form.tickUpper,
            rangeError: form.rangeError,
            hasTickRange: form.hasTickRange,
            areAmountsFilled: form.areAmountsFilled,
            isFirstDepositAmountsInvalid: form.isFirstDepositAmountsInvalid,
            isDepositDisabled: form.isDepositDisabled,
            depositEstimate: form.depositEstimate,
        });
    }, [
        onDataChange,
        form.amount0,
        form.amount1,
        form.tokenBalances,
        form.tickLower,
        form.tickUpper,
        form.rangeError,
        form.hasTickRange,
        form.areAmountsFilled,
        form.isFirstDepositAmountsInvalid,
        form.isDepositDisabled,
        form.depositEstimate,
    ]);

    return (
        <Container>
            {!form.account && (
                <Alert title="Wallet required" text="Connect wallet to manage positions." />
            )}

            {form.isModalLoading ? (
                <PageLoader />
            ) : (
                <Section>
                    {form.showRangeUnavailable ? (
                        <Alert
                            title="Range unavailable"
                            text="Pool price data is not loaded yet."
                        />
                    ) : (
                        <>
                            <AddLiquidityAmountsSection
                                pool={pool}
                                tokenBalances={form.tokenBalances}
                                amount0={form.amount0}
                                amount1={form.amount1}
                                disableAmount0Input={form.disableAmount0Input}
                                disableAmount1Input={form.disableAmount1Input}
                                onAmount0Change={form.handleAmount0Change}
                                onAmount1Change={form.handleAmount1Change}
                            />

                            <AddLiquidityPriceRangeSection
                                pool={pool}
                                isEmptyPool={form.isEmptyPool}
                                hasBothPositiveAmounts={form.hasBothPositiveAmounts}
                                referencePriceValue={form.referencePriceValue}
                                currentTick={form.currentTick}
                                referenceExactTick={form.referenceExactTick}
                                activeDepositPreset={form.activeDepositPreset}
                                canUseRangeControls={form.canUseRangeControls}
                                hasTickRange={form.hasTickRange}
                                tickLower={form.tickLower}
                                tickUpper={form.tickUpper}
                                tickSpacing={form.tickSpacing}
                                minTickBound={form.minTickBound}
                                maxTickBound={form.maxTickBound}
                                isMinScientific={form.isMinScientific}
                                isMaxScientific={form.isMaxScientific}
                                minPriceInput={form.minPriceInput}
                                maxPriceInput={form.maxPriceInput}
                                disableLowerUpByReference={form.disableLowerUpByReference}
                                disableUpperDownByReference={form.disableUpperDownByReference}
                                depositEstimate={form.depositEstimate}
                                onPreset={form.handlePreset}
                                onChartRangeChange={form.handleChartRangeChange}
                                onStepLowerDown={form.handleStepLowerDown}
                                onStepLowerUp={form.handleStepLowerUp}
                                onStepUpperDown={form.handleStepUpperDown}
                                onStepUpperUp={form.handleStepUpperUp}
                                onMinPriceChange={form.handleMinPriceChange}
                                onMaxPriceChange={form.handleMaxPriceChange}
                            />

                            {shouldShowPoolInfo && (
                                <ConcentratedAddLiquidityPoolInfo
                                    pool={pool}
                                    amounts={amounts}
                                    tickLower={form.tickLower}
                                    tickUpper={form.tickUpper}
                                    withPoolInfoCardSpacing
                                />
                            )}
                        </>
                    )}

                    {form.rangeError && <Alert title="Invalid range" text={form.rangeError} />}
                </Section>
            )}
        </Container>
    );
};

export default ConcentratedAddLiquidityForm;
