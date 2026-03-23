import BigNumber from 'bignumber.js';
import * as React from 'react';

import { formatConcentratedPriceInputValue, tickToPrice } from 'helpers/amm-concentrated';
import { contractValueToFormattedAmount } from 'helpers/amount';
import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';

import { PoolExtended } from 'types/amm';

import AssetLogo from 'basics/AssetLogo';

import {
    PositionCard,
    PositionInfoLabel,
    PositionInfoRow,
    PositionInfoRows,
    PositionInfoValue,
    PositionLogoWrap,
    PositionTokenItem,
    PositionTokenRow,
    PositionTokenValue,
} from './ConcentratedPositionCard.styled';

type PositionCardData = {
    tickLower: number;
    tickUpper: number;
    liquidity: string;
    tokenEstimates: string[];
    liquidityUsd: number;
};

type Props = {
    pool: PoolExtended;
    position: PositionCardData;
    minTickBound?: number;
    maxTickBound?: number;
    compact?: boolean;
    className?: string;
};

const ConcentratedPositionCard = ({
    pool,
    position,
    minTickBound,
    maxTickBound,
    compact = false,
    className,
}: Props): React.ReactNode => {
    const decimalsDiff = pool.tokens[0].decimal - pool.tokens[1].decimal;
    const isFullRange =
        minTickBound !== undefined &&
        maxTickBound !== undefined &&
        position.tickLower === minTickBound &&
        position.tickUpper === maxTickBound;
    const sharePercent = new BigNumber(pool.total_share || '0').gt(0)
        ? new BigNumber(position.liquidity || '0').dividedBy(pool.total_share).multipliedBy(100)
        : new BigNumber(0);

    return (
        <PositionCard className={className} $compact={compact}>
            <PositionTokenRow $compact={compact}>
                {pool.tokens.map((asset, index) => (
                    <PositionTokenItem key={getAssetString(asset)}>
                        <PositionLogoWrap>
                            <AssetLogo asset={asset} size={1.6} isCircle />
                        </PositionLogoWrap>
                        <PositionTokenValue $compact={compact}>
                            {formatBalance(
                                Number(position.tokenEstimates[index] || 0),
                                false,
                                false,
                                asset.decimal,
                            )}{' '}
                            {asset.code}
                        </PositionTokenValue>
                    </PositionTokenItem>
                ))}
            </PositionTokenRow>
            <PositionInfoRows $compact={compact}>
                <PositionInfoRow $compact={compact}>
                    <PositionInfoLabel $compact={compact}>
                        Price range ({pool.tokens[0].code}/{pool.tokens[1].code})
                    </PositionInfoLabel>
                    <PositionInfoValue $compact={compact}>
                        {isFullRange
                            ? 'Full Range'
                            : `${formatConcentratedPriceInputValue(
                                  tickToPrice(position.tickLower, decimalsDiff),
                              )} - ${formatConcentratedPriceInputValue(
                                  tickToPrice(position.tickUpper, decimalsDiff),
                              )}`}
                    </PositionInfoValue>
                </PositionInfoRow>
                <PositionInfoRow $compact={compact}>
                    <PositionInfoLabel $compact={compact}>Shares</PositionInfoLabel>
                    <PositionInfoValue $compact={compact}>
                        {contractValueToFormattedAmount(
                            position.liquidity,
                            pool.share_token_decimals,
                            true,
                            true,
                        )}{' '}
                        ({formatBalance(sharePercent.toNumber(), true)}%)
                    </PositionInfoValue>
                </PositionInfoRow>
                <PositionInfoRow $compact={compact}>
                    <PositionInfoLabel $compact={compact}>Liquidity (USD)</PositionInfoLabel>
                    <PositionInfoValue $compact={compact}>
                        ${formatBalance(position.liquidityUsd, true)}
                    </PositionInfoValue>
                </PositionInfoRow>
            </PositionInfoRows>
        </PositionCard>
    );
};

export default ConcentratedPositionCard;
