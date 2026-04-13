import * as React from 'react';

import { CONCENTRATED_MAX_TICK, CONCENTRATED_MIN_TICK } from 'constants/amm';

import {
    formatConcentratedPriceInputValue,
    snapDown,
    snapUp,
    tickToPrice,
} from 'helpers/amm-concentrated';
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
    compact?: boolean;
    className?: string;
};

const ConcentratedPositionCard = ({
    pool,
    position,
    compact = false,
    className,
}: Props): React.ReactNode => {
    const decimalsDiff = pool.tokens[0].decimal - pool.tokens[1].decimal;
    const tickSpacing = Number(pool.tick_spacing);
    const isFullRange =
        Number.isFinite(tickSpacing) &&
        tickSpacing > 0 &&
        position.tickLower === snapUp(CONCENTRATED_MIN_TICK, tickSpacing) &&
        position.tickUpper === snapDown(CONCENTRATED_MAX_TICK, tickSpacing);

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
                                position.tokenEstimates[index] || '0',
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
                <PositionInfoRow $compact={compact} $alignTop>
                    <PositionInfoLabel $compact={compact}>
                        Price range ({pool.tokens[0].code}/{pool.tokens[1].code})
                    </PositionInfoLabel>
                    <PositionInfoValue $compact={compact} $allowWrap>
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
                        )}
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
