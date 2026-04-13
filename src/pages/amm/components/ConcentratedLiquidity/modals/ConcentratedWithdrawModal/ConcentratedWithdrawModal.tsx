import BigNumber from 'bignumber.js';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { POOL_TYPE } from 'constants/amm';

import { parseConcentratedPercent } from 'helpers/amm-concentrated';
import { keyOfPosition } from 'helpers/amm-concentrated-positions';
import { loadConcentratedUserPositions } from 'helpers/amm-concentrated-user-positions';
import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import { SorobanService, ToastService } from 'services/globalServices';

import { PoolExtended } from 'types/amm';
import { UserDistributionPositionDetail } from 'types/amm-concentrated-liquidity-chart';
import { ModalProps } from 'types/modal';

import Alert from 'basics/Alert';
import AssetLogo from 'basics/AssetLogo';
import Button from 'basics/buttons/Button';
import DotsLoader from 'basics/loaders/DotsLoader';
import PageLoader from 'basics/loaders/PageLoader';
import { ModalTitle, ModalWrapper, StickyButtonWrapper } from 'basics/ModalAtoms';

import {
    WithdrawEstimateDetails,
    WithdrawEstimateRow,
    WithdrawEstimateValue,
    WithdrawFieldsStack,
    WithdrawFormRow,
    WithdrawPercentInput,
    WithdrawRangeInput,
    WithdrawSection,
    WithdrawSectionTitle,
} from './ConcentratedWithdrawModal.styled';

import ConcentratedPositionCard from '../../components/ConcentratedPositionCard/ConcentratedPositionCard';
import ConcentratedPositionsSection from '../../components/ConcentratedPositionsSection/ConcentratedPositionsSection';
import { Container } from '../../components/ConcentratedPositionsSection/ConcentratedPositionsSection.styled';

type ConcentratedWithdrawModalParams = {
    pool: PoolExtended;
};

const ConcentratedWithdrawModal = ({
    params,
}: ModalProps<ConcentratedWithdrawModalParams>): React.ReactNode => {
    const { pool } = params;
    const { account } = useAuthStore();

    const [positions, setPositions] = useState<UserDistributionPositionDetail[]>([]);

    const [withdrawPercent, setWithdrawPercent] = useState('100');
    const [selectedPositionKey, setSelectedPositionKey] = useState<string | null>(null);
    const [withdrawEstimate, setWithdrawEstimate] = useState<string[] | null>(null);
    const [withdrawEstimateLoading, setWithdrawEstimateLoading] = useState(false);

    const [pending, setPending] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = 'Concentrated Withdraw';

    const selectedPosition = useMemo(
        () => positions.find(item => keyOfPosition(item) === selectedPositionKey) || null,
        [positions, selectedPositionKey],
    );

    const isModalLoading = loading || (positions.length > 0 && !selectedPosition);

    const positionSelectOptions = useMemo(
        () =>
            positions.map(position => ({
                value: keyOfPosition(position),
                label: (
                    <ConcentratedPositionCard
                        className="withdraw-position-card"
                        pool={pool}
                        position={{
                            tickLower: position.tickLower,
                            tickUpper: position.tickUpper,
                            liquidity: position.liquidity,
                            tokenEstimates: position.tokenEstimates,
                            liquidityUsd: position.liquidityUsd,
                        }}
                    />
                ),
            })),
        [positions, pool],
    );

    const normalizedWithdrawLiquidity = useMemo(() => {
        if (!selectedPosition) {
            return '';
        }

        const percent = parseConcentratedPercent(withdrawPercent);
        if (!percent || percent.lte(0)) {
            return '0';
        }

        const liquidity = new BigNumber(selectedPosition.liquidity || '0');
        const toBurn = liquidity
            .multipliedBy(percent)
            .dividedBy(100)
            .integerValue(BigNumber.ROUND_FLOOR);

        return toBurn.toFixed(0);
    }, [selectedPosition, withdrawPercent]);

    const withdrawLiquidityError = useMemo(() => {
        if (!selectedPosition) {
            return 'Select position first';
        }

        const percent = parseConcentratedPercent(withdrawPercent);
        if (!percent || percent.lte(0) || percent.gt(100)) {
            return 'Percent must be in range 0..100';
        }

        if (!normalizedWithdrawLiquidity || normalizedWithdrawLiquidity === '0') {
            return 'Selected percent is too low for this position liquidity';
        }

        const entered = new BigNumber(normalizedWithdrawLiquidity);
        const max = new BigNumber(selectedPosition.liquidity || '0');
        if (entered.gt(max)) {
            return 'Liquidity exceeds selected position';
        }

        return null;
    }, [normalizedWithdrawLiquidity, selectedPosition, withdrawPercent]);

    const withdrawMinAmounts = useMemo(
        () =>
            new Map([
                [getAssetString(pool.tokens[0]), '0'],
                [getAssetString(pool.tokens[1]), '0'],
            ]),
        [pool.tokens],
    );

    const load = () => {
        if (!account || pool.pool_type !== POOL_TYPE.concentrated) {
            return;
        }

        setLoading(true);

        loadConcentratedUserPositions(pool, account.accountId())
            .then(({ positions: loadedPositions }) => {
                const nextPositions = [...loadedPositions].sort((a, b) =>
                    new BigNumber(b.liquidity || '0').minus(a.liquidity || '0').toNumber(),
                );
                setPositions(nextPositions);

                if (!nextPositions.length) {
                    setSelectedPositionKey(null);
                    return;
                }

                const selectedExists = nextPositions.some(
                    item => keyOfPosition(item) === selectedPositionKey,
                );
                if (!selectedExists) {
                    setSelectedPositionKey(keyOfPosition(nextPositions[0]));
                }
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

    useEffect(() => {
        if (
            !account ||
            !selectedPosition ||
            !normalizedWithdrawLiquidity ||
            withdrawLiquidityError
        ) {
            setWithdrawEstimate(null);
            setWithdrawEstimateLoading(false);
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setWithdrawEstimateLoading(true);
            SorobanService.amm
                .estimateWithdrawPosition(
                    account.accountId(),
                    pool.address,
                    pool.tokens,
                    selectedPosition.tickLower,
                    selectedPosition.tickUpper,
                    normalizedWithdrawLiquidity,
                )
                .then(setWithdrawEstimate)
                .catch(() => {
                    setWithdrawEstimate(null);
                })
                .finally(() => {
                    setWithdrawEstimateLoading(false);
                });
        }, 400);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [
        account,
        selectedPosition,
        normalizedWithdrawLiquidity,
        withdrawLiquidityError,
        pool.address,
        pool.tokens,
    ]);

    const withdraw = () => {
        if (!account || !selectedPosition || pending) {
            return;
        }
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        if (!normalizedWithdrawLiquidity || withdrawLiquidityError) {
            ToastService.showErrorToast(withdrawLiquidityError || 'Enter liquidity to burn');
            return;
        }

        setPending(true);

        SorobanService.amm
            .getWithdrawPositionTx(
                account.accountId(),
                pool.address,
                pool.tokens,
                selectedPosition.tickLower,
                selectedPosition.tickUpper,
                normalizedWithdrawLiquidity,
                withdrawMinAmounts,
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

                ToastService.showSuccessToast('Position withdrawn');
                setWithdrawEstimate(null);
                setWithdrawPercent('100');
                load();
            })
            .catch(e => {
                ToastService.showErrorToast(e?.message || 'Withdraw failed');
            })
            .finally(() => {
                setPending(false);
            });
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
                        <ConcentratedPositionsSection
                            positionsCount={positions.length}
                            selectedPositionKey={selectedPositionKey}
                            positionSelectOptions={positionSelectOptions}
                            onSelectPosition={value => setSelectedPositionKey(value)}
                        />

                        <WithdrawSection>
                            <WithdrawSectionTitle>Withdraw position</WithdrawSectionTitle>
                            {!selectedPosition ? (
                                <Alert
                                    title="Select position"
                                    text="Choose a specific position above before estimating or withdrawing."
                                />
                            ) : (
                                <WithdrawFieldsStack>
                                    <WithdrawFormRow>
                                        <WithdrawPercentInput
                                            postfix="%"
                                            value={withdrawPercent}
                                            onChange={({ target }) => {
                                                const parsed = parseConcentratedPercent(
                                                    target.value,
                                                );
                                                if (target.value !== '' && !parsed) {
                                                    return;
                                                }
                                                if (parsed && parsed.gt(100)) {
                                                    return;
                                                }
                                                const [integerPart, fractionalPart] =
                                                    target.value.split('.');
                                                const roundedValue =
                                                    fractionalPart && fractionalPart.length > 1
                                                        ? `${integerPart}.${fractionalPart.slice(0, 1)}`
                                                        : target.value;
                                                setWithdrawPercent(roundedValue);
                                            }}
                                            inputMode="decimal"
                                        />
                                        <WithdrawRangeInput
                                            onChange={value => setWithdrawPercent(value.toString())}
                                            value={Number(withdrawPercent || 0)}
                                            withoutCurrentValue
                                        />
                                    </WithdrawFormRow>
                                </WithdrawFieldsStack>
                            )}

                            {selectedPosition && (
                                <WithdrawEstimateDetails>
                                    {pool.tokens.map((asset, index) => (
                                        <WithdrawEstimateRow key={`${asset.code}-${index}`}>
                                            <span>Will receive {asset.code}</span>
                                            <WithdrawEstimateValue>
                                                {withdrawEstimateLoading ? (
                                                    <DotsLoader />
                                                ) : withdrawEstimate ? (
                                                    formatBalance(
                                                        withdrawEstimate[index] || '0',
                                                        false,
                                                        false,
                                                        asset.decimal,
                                                    )
                                                ) : (
                                                    '-'
                                                )}
                                                <AssetLogo asset={asset} isSmall isCircle />
                                            </WithdrawEstimateValue>
                                        </WithdrawEstimateRow>
                                    ))}
                                </WithdrawEstimateDetails>
                            )}

                            {withdrawLiquidityError && (
                                <Alert title="Invalid liquidity" text={withdrawLiquidityError} />
                            )}
                        </WithdrawSection>

                        <StickyButtonWrapper>
                            <Button
                                fullWidth
                                isBig
                                onClick={withdraw}
                                pending={pending}
                                disabled={
                                    !selectedPosition ||
                                    !normalizedWithdrawLiquidity ||
                                    !!withdrawLiquidityError
                                }
                            >
                                Withdraw
                            </Button>
                        </StickyButtonWrapper>
                    </>
                )}
            </Container>
        </ModalWrapper>
    );
};

export default ConcentratedWithdrawModal;
