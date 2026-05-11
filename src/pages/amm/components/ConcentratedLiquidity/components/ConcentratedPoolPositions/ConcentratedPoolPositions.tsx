import BigNumber from 'bignumber.js';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { getNativePrices } from 'api/amm';

import { MINUTE } from 'constants/intervals';

import { clamp, formatConcentratedPriceInputValue, tickToPrice } from 'helpers/amm-concentrated';
import { isFullRangePosition } from 'helpers/amm-concentrated-positions';
import { loadConcentratedUserPositions } from 'helpers/amm-concentrated-user-positions';
import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';

import { useUpdateIndex } from 'hooks/useUpdateIndex';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, StellarService } from 'services/globalServices';

import { PoolExtended } from 'types/amm';
import { UserDistributionPositionDetail } from 'types/amm-concentrated-liquidity-chart';
import { Token } from 'types/token';

import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';

import MinusIcon from 'assets/icons/nav/icon-minus-16.svg';
import PlusIcon from 'assets/icons/nav/icon-plus-16.svg';
import Info from 'assets/icons/status/icon-info-16.svg';

import AssetLogo from 'basics/AssetLogo';
import { PageLoader } from 'basics/loaders';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { COLORS } from 'styles/style-constants';

import AddLiquidityModal from 'pages/amm/components/AddLiquidity/AddLiquidityModal';
import ConcentratedWithdrawModal from 'pages/amm/components/ConcentratedLiquidity/modals/ConcentratedWithdrawModal/ConcentratedWithdrawModal';

import {
    ActionButton,
    Actions,
    ActiveRange,
    Card,
    CurrentMarker,
    CurrentPrice,
    Details,
    DividerVertical,
    EmptyState,
    FeeTooltipAmount,
    FeeTooltipContent,
    FeeTooltipRow,
    FeeTooltipToken,
    FeeTotal,
    FeeValue,
    Header,
    LiquidityValue,
    Metric,
    MetricLabel,
    Metrics,
    Position,
    PositionHeader,
    PositionMain,
    PositionName,
    Positions,
    Range,
    RangeHeader,
    RangeLabel,
    RangeTrack,
    RangeValues,
    StatusBadge,
    StatusDot,
    Title,
    TokenAmount,
    TokenCode,
    TokenSeparator,
    TokensValue,
    TrackLine,
} from './ConcentratedPoolPositions.styled';

type PositionWithFees = UserDistributionPositionDetail & {
    feesUsd: number;
};

type RangeMetrics = {
    inRange: boolean;
    activeLeft: number;
    activeWidth: number;
    markerLeft: number;
    minLabel: string;
    maxLabel: string;
    isFullRange: boolean;
};

const formatPrice = (value: number) => formatConcentratedPriceInputValue(value) || '0';

const calculateAmountsUsd = (
    pool: PoolExtended,
    amounts: string[],
    tokenPrices: Map<string, string>,
) =>
    amounts.reduce((acc, amount, index) => {
        const tokenPriceXlm = new BigNumber(tokenPrices.get(pool.tokens[index].contract) || '0');
        const tokenUsdPrice = tokenPriceXlm.multipliedBy(StellarService.price.priceLumenUsd || 0);

        return acc.plus(new BigNumber(amount || '0').multipliedBy(tokenUsdPrice));
    }, new BigNumber(0));

const getPositionFeesUsd = (
    pool: PoolExtended,
    position: UserDistributionPositionDetail,
    tokenPrices: Map<string, string>,
) =>
    calculateAmountsUsd(
        pool,
        position.feeEstimates ?? pool.tokens.map(() => '0'),
        tokenPrices,
    ).toNumber();

const isPositionInRange = (pool: PoolExtended, position: UserDistributionPositionDetail) => {
    const currentTick = Number(pool.current_tick);

    return (
        Number.isFinite(currentTick) &&
        currentTick >= position.tickLower &&
        currentTick <= position.tickUpper
    );
};

const formatTokenAmounts = (tokens: Token[], amounts: string[]) =>
    tokens.map((token, index) => ({
        token,
        amount: formatBalance(amounts[index] || '0', true, false, token.decimal),
    }));

const formatRoundedTokenAmounts = (tokens: Token[], amounts: string[]) =>
    tokens.map((token, index) => ({
        token,
        amount: formatBalance(amounts[index] || '0', true, false, token.decimal),
    }));

const getRangeMetrics = (
    pool: PoolExtended,
    position: UserDistributionPositionDetail,
): RangeMetrics => {
    const decimalsDiff = pool.tokens[0].decimal - pool.tokens[1].decimal;
    const currentTick = Number(pool.current_tick);
    const tickSpacing = Number(pool.tick_spacing);
    const isFullRange = isFullRangePosition(position, tickSpacing);
    const hasCurrentTick = Number.isFinite(currentTick);
    const inRange = isPositionInRange(pool, position);

    if (isFullRange) {
        return {
            inRange,
            activeLeft: 0,
            activeWidth: 100,
            markerLeft: hasCurrentTick ? 50 : 0,
            minLabel: 'Full Range',
            maxLabel: 'Full Range',
            isFullRange,
        };
    }

    const rangeWidth = Math.max(position.tickUpper - position.tickLower, tickSpacing || 1, 1);
    const domainMin =
        Math.min(position.tickLower, hasCurrentTick ? currentTick : position.tickLower) -
        rangeWidth * 0.2;
    const domainMax =
        Math.max(position.tickUpper, hasCurrentTick ? currentTick : position.tickUpper) +
        rangeWidth * 0.2;
    const domainWidth = Math.max(domainMax - domainMin, 1);
    const toPercent = (tick: number) => clamp(((tick - domainMin) / domainWidth) * 100, 0, 100);
    const activeLeft = toPercent(position.tickLower);
    const activeRight = toPercent(position.tickUpper);

    return {
        inRange,
        activeLeft,
        activeWidth: Math.max(activeRight - activeLeft, 0.5),
        markerLeft: hasCurrentTick ? toPercent(currentTick) : activeLeft,
        minLabel: `Min: ${formatPrice(tickToPrice(position.tickLower, decimalsDiff))}`,
        maxLabel: `Max: ${formatPrice(tickToPrice(position.tickUpper, decimalsDiff))}`,
        isFullRange,
    };
};

const ConcentratedPoolPositions = ({ pool }: { pool: PoolExtended }): React.ReactNode => {
    const { account, isLogged } = useAuthStore();
    const [positions, setPositions] = useState<PositionWithFees[]>([]);
    const [loading, setLoading] = useState(false);
    const updateIndex = useUpdateIndex(5 * MINUTE);

    const decimalsDiff = pool.tokens[0].decimal - pool.tokens[1].decimal;
    const currentTick = Number(pool.current_tick);
    const currentPrice = Number.isFinite(currentTick)
        ? formatPrice(tickToPrice(currentTick, decimalsDiff))
        : '-';

    const tokenContractsKey = pool.tokens.map(token => token.contract).join(':');

    useEffect(() => {
        if (!account) {
            setPositions([]);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);

        getNativePrices()
            .catch(() => new Map())
            .then(prices => {
                const tokenPrices = new Map(
                    [...prices.entries()].map(([key, value]) => [key, value.price]),
                );

                return loadConcentratedUserPositions(pool, account.accountId()).then(
                    ({ positions: loadedPositions }) =>
                        loadedPositions
                            .slice()
                            .sort((a, b) => new BigNumber(b.liquidity).comparedTo(a.liquidity))
                            .map(position => ({
                                ...position,
                                feesUsd: getPositionFeesUsd(pool, position, tokenPrices),
                            })),
                );
            })
            .then(loadedPositions => {
                if (!cancelled) {
                    setPositions(loadedPositions);
                }
            })
            .catch(() => undefined)
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [account, pool.address, tokenContractsKey, updateIndex]);

    const openDepositModal = useCallback(
        (position: UserDistributionPositionDetail) => {
            const modalParams = {
                pool,
                initialConcentratedRange: {
                    tickLower: position.tickLower,
                    tickUpper: position.tickUpper,
                },
            };

            if (!isLogged) {
                ModalService.openModal(ChooseLoginMethodModal, {
                    callback: () =>
                        ModalService.openModal(AddLiquidityModal, modalParams, false, null, true),
                });
                return;
            }

            ModalService.openModal(AddLiquidityModal, modalParams, false, null, true);
        },
        [isLogged, pool],
    );

    const openWithdrawModal = useCallback(
        (initialPositionKey: string) => {
            if (!isLogged) {
                ModalService.openModal(ChooseLoginMethodModal, {
                    callback: () =>
                        ModalService.openModal(ConcentratedWithdrawModal, {
                            pool,
                            initialPositionKey,
                        }),
                });
                return;
            }

            ModalService.openModal(ConcentratedWithdrawModal, { pool, initialPositionKey });
        },
        [isLogged, pool],
    );

    if (!account) {
        return null;
    }

    return (
        <Card>
            <Header>
                <Title>Your positions</Title>
                <CurrentPrice>
                    Current price: <span>{currentPrice}</span>
                </CurrentPrice>
            </Header>

            {loading && !positions.length ? (
                <EmptyState>
                    <PageLoader />
                </EmptyState>
            ) : null}

            {!loading && !positions.length ? <EmptyState>No positions found</EmptyState> : null}

            {positions.length ? (
                <Positions>
                    {positions.map((position, index) => {
                        const range = getRangeMetrics(pool, position);
                        const tokenAmounts = formatTokenAmounts(
                            pool.tokens,
                            position.tokenEstimates,
                        );
                        const feeAmounts = formatRoundedTokenAmounts(
                            pool.tokens,
                            position.feeEstimates ?? pool.tokens.map(() => '0'),
                        );

                        return (
                            <Position key={position.key}>
                                <PositionHeader>
                                    <PositionMain>
                                        <PositionName>Position #{index + 1}</PositionName>
                                        <LiquidityValue>
                                            ${formatBalance(position.liquidityUsd, true)}
                                        </LiquidityValue>
                                        <TokensValue>
                                            {tokenAmounts.map(({ token, amount }, tokenIndex) => (
                                                <React.Fragment key={getAssetString(token)}>
                                                    {tokenIndex > 0 ? (
                                                        <TokenSeparator>/</TokenSeparator>
                                                    ) : null}
                                                    <TokenAmount>
                                                        <AssetLogo
                                                            asset={token}
                                                            size={1.6}
                                                            isCircle
                                                        />
                                                        {amount} <TokenCode>{token.code}</TokenCode>
                                                    </TokenAmount>
                                                </React.Fragment>
                                            ))}
                                        </TokensValue>
                                    </PositionMain>
                                    <StatusBadge $inRange={range.inRange}>
                                        <StatusDot $inRange={range.inRange} />
                                        {range.inRange ? 'IN RANGE' : 'OUT OF RANGE'}
                                    </StatusBadge>
                                </PositionHeader>

                                <Details>
                                    <Metrics>
                                        <Metric>
                                            <MetricLabel>Fees:</MetricLabel>
                                            <FeeValue>
                                                <FeeTotal>
                                                    ${formatBalance(position.feesUsd, true)}
                                                </FeeTotal>
                                                <Tooltip
                                                    showOnHover
                                                    content={
                                                        <FeeTooltipContent>
                                                            {feeAmounts.map(({ token, amount }) => (
                                                                <FeeTooltipRow
                                                                    key={getAssetString(token)}
                                                                >
                                                                    <FeeTooltipToken>
                                                                        <AssetLogo
                                                                            asset={token}
                                                                            size={1.6}
                                                                            isCircle
                                                                        />
                                                                        <span>{token.code}</span>
                                                                    </FeeTooltipToken>
                                                                    <FeeTooltipAmount>
                                                                        {amount}
                                                                    </FeeTooltipAmount>
                                                                </FeeTooltipRow>
                                                            ))}
                                                        </FeeTooltipContent>
                                                    }
                                                    position={TOOLTIP_POSITION.top}
                                                    background={COLORS.white}
                                                >
                                                    <Info />
                                                </Tooltip>
                                            </FeeValue>
                                        </Metric>
                                        <Metric>
                                            <MetricLabel>Shares:</MetricLabel>
                                            <FeeValue>
                                                {formatBalance(position.liquidity, true, true)}
                                            </FeeValue>
                                        </Metric>
                                    </Metrics>
                                    <DividerVertical />
                                    <Range>
                                        <RangeHeader>
                                            <RangeLabel>
                                                Price range: ({pool.tokens[0].code}/
                                                {pool.tokens[1].code})
                                            </RangeLabel>
                                        </RangeHeader>
                                        <RangeTrack>
                                            <TrackLine />
                                            <ActiveRange
                                                $left={range.activeLeft}
                                                $width={range.activeWidth}
                                            />
                                            {!range.isFullRange && (
                                                <CurrentMarker
                                                    $left={range.markerLeft}
                                                    $inRange={range.inRange}
                                                />
                                            )}
                                        </RangeTrack>
                                        <RangeValues>
                                            {range.isFullRange ? (
                                                <span>Full Range</span>
                                            ) : (
                                                <>
                                                    <span>{range.minLabel}</span>
                                                    <span>{range.maxLabel}</span>
                                                </>
                                            )}
                                        </RangeValues>
                                    </Range>
                                </Details>

                                <Actions>
                                    <ActionButton
                                        $primary
                                        type="button"
                                        onClick={() => openDepositModal(position)}
                                    >
                                        <PlusIcon />
                                        Add liquidity
                                    </ActionButton>
                                    <ActionButton
                                        type="button"
                                        onClick={() => openWithdrawModal(position.key)}
                                    >
                                        <MinusIcon />
                                        Remove
                                    </ActionButton>
                                </Actions>
                            </Position>
                        );
                    })}
                </Positions>
            ) : null}
        </Card>
    );
};

export default ConcentratedPoolPositions;
