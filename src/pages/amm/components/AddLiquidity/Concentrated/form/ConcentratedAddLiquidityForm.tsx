import * as React from 'react';
import { useEffect } from 'react';

import { DepositEstimate, PoolExtended } from 'types/amm';

import Alert from 'basics/Alert';
import PageLoader from 'basics/loaders/PageLoader';

import { Container, Section } from '../styled/ConcentratedAddLiquidity.styled';
import { useConcentratedAddLiquidityForm } from '../hooks/useConcentratedAddLiquidityForm';
import AddLiquidityAmountsSection from './sections/AddLiquidityAmountsSection';
import AddLiquidityPriceRangeSection from './sections/AddLiquidityPriceRangeSection';

export type ConcentratedAddLiquidityFormData = {
    amount0: string;
    amount1: string;
    tokenBalances: Map<string, number>;
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
                        </>
                    )}

                    {form.rangeError && <Alert title="Invalid range" text={form.rangeError} />}
                </Section>
            )}
        </Container>
    );
};

export default ConcentratedAddLiquidityForm;
