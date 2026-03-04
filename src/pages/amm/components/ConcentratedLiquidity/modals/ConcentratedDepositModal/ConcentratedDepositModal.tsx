import * as React from 'react';

import { PoolExtended } from 'types/amm';
import { ModalProps } from 'types/modal';

import Alert from 'basics/Alert';
import Button from 'basics/buttons/Button';
import PageLoader from 'basics/loaders/PageLoader';
import { ModalTitle, ModalWrapper, StickyButtonWrapper } from 'basics/ModalAtoms';

import { Container, Section } from './ConcentratedDepositModal.styled';
import DepositAmountsSection from './DepositAmountsSection';
import DepositPriceRangeSection from './DepositPriceRangeSection';
import { useConcentratedDepositForm } from './useConcentratedDepositForm';

type ConcentratedDepositModalParams = {
    pool: PoolExtended;
};

const ConcentratedDepositModal = ({
    params,
    close,
}: ModalProps<ConcentratedDepositModalParams>): React.ReactNode => {
    const { pool } = params;

    const form = useConcentratedDepositForm({ pool, close });

    return (
        <ModalWrapper>
            <ModalTitle>Concentrated Deposit</ModalTitle>
            <Container>
                {!form.account && (
                    <Alert title="Wallet required" text="Connect wallet to manage positions." />
                )}

                {form.isModalLoading ? (
                    <PageLoader />
                ) : (
                    <>
                        <Section>
                            {form.showRangeUnavailable ? (
                                <Alert
                                    title="Range unavailable"
                                    text="Pool price data is not loaded yet."
                                />
                            ) : (
                                <>
                                    <DepositAmountsSection
                                        pool={pool}
                                        tokenBalances={form.tokenBalances}
                                        amount0={form.amount0}
                                        amount1={form.amount1}
                                        disableAmount0Input={form.disableAmount0Input}
                                        disableAmount1Input={form.disableAmount1Input}
                                        onAmount0Change={form.handleAmount0Change}
                                        onAmount1Change={form.handleAmount1Change}
                                    />

                                    <DepositPriceRangeSection
                                        pool={pool}
                                        isEmptyPool={form.isEmptyPool}
                                        hasBothPositiveAmounts={form.hasBothPositiveAmounts}
                                        referencePriceValue={form.referencePriceValue}
                                        activeDepositPreset={form.activeDepositPreset}
                                        canUseRangeControls={form.canUseRangeControls}
                                        hasTickRange={form.hasTickRange}
                                        tickLower={form.tickLower}
                                        tickUpper={form.tickUpper}
                                        minTickBound={form.minTickBound}
                                        maxTickBound={form.maxTickBound}
                                        isMinScientific={form.isMinScientific}
                                        isMaxScientific={form.isMaxScientific}
                                        minPriceInput={form.minPriceInput}
                                        maxPriceInput={form.maxPriceInput}
                                        disableLowerUpByReference={form.disableLowerUpByReference}
                                        disableUpperDownByReference={
                                            form.disableUpperDownByReference
                                        }
                                        depositEstimate={form.depositEstimate}
                                        onFullRange={form.handleFullRange}
                                        onPreset={form.handlePreset}
                                        onStepLowerDown={form.handleStepLowerDown}
                                        onStepLowerUp={form.handleStepLowerUp}
                                        onStepUpperDown={form.handleStepUpperDown}
                                        onStepUpperUp={form.handleStepUpperUp}
                                        onMinPriceChange={form.handleMinPriceChange}
                                        onMaxPriceChange={form.handleMaxPriceChange}
                                    />
                                </>
                            )}

                            {form.rangeError && (
                                <Alert title="Invalid range" text={form.rangeError} />
                            )}
                        </Section>

                        <StickyButtonWrapper>
                            <Button
                                fullWidth
                                isBig
                                onClick={form.deposit}
                                pending={form.pending}
                                disabled={form.isDepositDisabled}
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
