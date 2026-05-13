import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { getPoolInfo } from 'api/amm';

import { MINUTE } from 'constants/intervals';

import { getConcentratedRangeMetrics } from 'helpers/amm-concentrated-position-range';
import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';

import useConcentratedUserPositions from 'hooks/useConcentratedUserPositions';
import { useUpdateIndex } from 'hooks/useUpdateIndex';

import { PoolProcessed, PoolUserProcessed } from 'types/amm';
import { Token } from 'types/token';

import IconDeposit from 'assets/icons/actions/icon-deposit-16.svg';
import IconWithdraw from 'assets/icons/actions/icon-withdraw-16.svg';
import Info from 'assets/icons/status/icon-info-16.svg';

import AssetLogo from 'basics/AssetLogo';
import { PageLoader } from 'basics/loaders';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { COLORS } from 'styles/style-constants';

import useConcentratedPositionControls from 'pages/amm/components/ConcentratedLiquidity/hooks/useConcentratedPositionControls';

import {
    ActionButton,
    Actions,
    Container,
    CurrentPrice,
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
    Position,
    PositionInfo,
    PositionName,
    ValueBlock,
    RangeBlock,
    StatusBadge,
    StatusDot,
    Title,
    TokenAmount,
    TokenCode,
    TokenSeparator,
    TokensValue,
} from './MyLiquidityConcentratedPositions.styled';

const formatTokenAmounts = (tokens: Token[], amounts: string[]) =>
    tokens.map((token, index) => ({
        token,
        amount: formatBalance(amounts[index] || '0', true, false, token.decimal),
    }));

interface MyLiquidityConcentratedPositionsProps {
    pool: PoolUserProcessed;
}

const MyLiquidityConcentratedPositions = ({
    pool,
}: MyLiquidityConcentratedPositionsProps): React.ReactNode => {
    const updateIndex = useUpdateIndex(5 * MINUTE);

    // `PoolUserProcessed` returned by the user-pools endpoint doesn't always
    // include `current_tick`/`sqrt_price_x96`, but those fields are required to
    // render the current price and to compute the price-range marker. Fetch the
    // full pool info on mount and merge the result over the row data.
    const [poolInfo, setPoolInfo] = useState<PoolProcessed | null>(null);

    useEffect(() => {
        let cancelled = false;
        getPoolInfo(pool.address)
            .then(info => {
                if (!cancelled) {
                    setPoolInfo(info);
                }
            })
            .catch(() => undefined);
        return () => {
            cancelled = true;
        };
    }, [pool.address, updateIndex]);

    // The hook only needs the same fields that PoolProcessed exposes (tokens,
    // address, current_tick, tick_spacing); PoolUserProcessed is a superset, so
    // the cast is safe.
    const poolForPositions = useMemo<PoolProcessed>(
        () => ({
            ...(pool as unknown as PoolProcessed),
            current_tick: poolInfo?.current_tick ?? pool.current_tick,
            sqrt_price_x96: poolInfo?.sqrt_price_x96 ?? pool.sqrt_price_x96,
            tick_spacing: poolInfo?.tick_spacing ?? pool.tick_spacing,
        }),
        [pool, poolInfo],
    );
    const { positions, loading } = useConcentratedUserPositions(poolForPositions, updateIndex);
    const { currentPriceLabel, openDepositModal, openWithdrawModal } =
        useConcentratedPositionControls({
            pool,
            pricePool: poolForPositions,
        });

    return (
        <Container>
            <Header>
                <Title>Your positions</Title>
                <CurrentPrice>
                    Current price: <span>{currentPriceLabel}</span>
                </CurrentPrice>
            </Header>

            {loading && !positions.length ? (
                <EmptyState>
                    <PageLoader />
                </EmptyState>
            ) : null}

            {!loading && !positions.length ? <EmptyState>No positions found</EmptyState> : null}

            {positions.map((position, index) => {
                const range = getConcentratedRangeMetrics(poolForPositions, position);
                const tokenAmounts = formatTokenAmounts(pool.tokens, position.tokenEstimates);
                const feeAmounts = formatTokenAmounts(
                    pool.tokens,
                    position.feeEstimates ?? pool.tokens.map(() => '0'),
                );

                return (
                    <Position key={position.key}>
                        <PositionInfo>
                            <PositionName>Position #{index + 1}</PositionName>
                            <StatusBadge $inRange={range.inRange}>
                                <StatusDot $inRange={range.inRange} />
                                {range.inRange ? 'IN RANGE' : 'OUT OF RANGE'}
                            </StatusBadge>
                        </PositionInfo>

                        <ValueBlock>
                            <LiquidityValue>
                                ${formatBalance(position.liquidityUsd, true)}
                            </LiquidityValue>
                            <TokensValue>
                                {tokenAmounts.map(({ token, amount }, tokenIndex) => (
                                    <React.Fragment key={getAssetString(token)}>
                                        {tokenIndex > 0 ? <TokenSeparator>/</TokenSeparator> : null}
                                        <TokenAmount>
                                            <AssetLogo asset={token} size={1.6} isCircle />
                                            {amount} <TokenCode>{token.code}</TokenCode>
                                        </TokenAmount>
                                    </React.Fragment>
                                ))}
                            </TokensValue>
                        </ValueBlock>

                        <Metric $wide>
                            <MetricLabel>Fees:</MetricLabel>
                            <FeeValue $inline>
                                <FeeTotal>${formatBalance(position.feesUsd, true)}</FeeTotal>
                                <Tooltip
                                    showOnHover
                                    content={
                                        <FeeTooltipContent>
                                            {feeAmounts.map(({ token, amount }) => (
                                                <FeeTooltipRow key={getAssetString(token)}>
                                                    <FeeTooltipToken>
                                                        <AssetLogo
                                                            asset={token}
                                                            size={1.6}
                                                            isCircle
                                                        />
                                                        <span>{token.code}</span>
                                                    </FeeTooltipToken>
                                                    <FeeTooltipAmount>{amount}</FeeTooltipAmount>
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

                        <RangeBlock
                            baseCode={pool.tokens[0].code}
                            counterCode={pool.tokens[1].code}
                            range={range}
                        />

                        <Actions>
                            <ActionButton
                                $primary
                                type="button"
                                onClick={() => openDepositModal(position)}
                                title="Add liquidity"
                            >
                                <IconDeposit />
                            </ActionButton>
                            <ActionButton
                                type="button"
                                onClick={() => openWithdrawModal(position.key)}
                                title="Remove liquidity"
                            >
                                <IconWithdraw />
                            </ActionButton>
                        </Actions>
                    </Position>
                );
            })}
        </Container>
    );
};

export default MyLiquidityConcentratedPositions;
