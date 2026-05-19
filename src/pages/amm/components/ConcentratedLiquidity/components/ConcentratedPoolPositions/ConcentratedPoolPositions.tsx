import * as React from 'react';

import { MINUTE } from 'constants/intervals';

import { getConcentratedRangeMetrics } from 'helpers/amm-concentrated-position-range';
import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';

import useConcentratedUserPositions from 'hooks/useConcentratedUserPositions';
import { useUpdateIndex } from 'hooks/useUpdateIndex';

import useAuthStore from 'store/authStore/useAuthStore';

import { PoolExtended } from 'types/amm';
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
    Card,
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
    StatusBadge,
    StatusDot,
    Title,
    TokenAmount,
    TokenCode,
    TokenSeparator,
    TokensValue,
} from './ConcentratedPoolPositions.styled';

const formatTokenAmounts = (tokens: Token[], amounts: string[]) =>
    tokens.map((token, index) => ({
        token,
        amount: formatBalance(amounts[index] || '0', true, false, token.decimal),
    }));

const ConcentratedPoolPositions = ({ pool }: { pool: PoolExtended }): React.ReactNode => {
    const { account } = useAuthStore();
    const updateIndex = useUpdateIndex(5 * MINUTE);
    const { positions, loading } = useConcentratedUserPositions(pool, updateIndex);
    const { currentPriceLabel, openDepositModal, openWithdrawModal } =
        useConcentratedPositionControls({ pool });

    if (!account) {
        return null;
    }

    return (
        <Card>
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

            {positions.length ? (
                <Positions>
                    {positions.map((position, index) => {
                        const range = getConcentratedRangeMetrics(pool, position);
                        const tokenAmounts = formatTokenAmounts(
                            pool.tokens,
                            position.tokenEstimates,
                        );
                        const feeAmounts = formatTokenAmounts(
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
                                    <Range
                                        baseCode={pool.tokens[0].code}
                                        counterCode={pool.tokens[1].code}
                                        range={range}
                                    />
                                </Details>

                                <Actions>
                                    <ActionButton
                                        $primary
                                        type="button"
                                        onClick={() => openDepositModal(position)}
                                    >
                                        <IconDeposit />
                                        Add liquidity
                                    </ActionButton>
                                    <ActionButton
                                        type="button"
                                        onClick={() => openWithdrawModal(position.key)}
                                    >
                                        <IconWithdraw />
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
