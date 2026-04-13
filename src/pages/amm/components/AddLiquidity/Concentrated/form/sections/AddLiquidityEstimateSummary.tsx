import * as React from 'react';

import { formatBalance } from 'helpers/format-number';

import { DepositEstimate, PoolExtended } from 'types/amm';

import AssetLogo from 'basics/AssetLogo';
import DotsLoader from 'basics/loaders/DotsLoader';

import {
    RangeSummary,
    SummaryAmountItem,
    SummaryAmounts,
    SummaryLabel,
    SummaryRow,
    SummaryRows,
    SummaryValue,
} from '../../styled/ConcentratedAddLiquidity.styled';

type Props = {
    pool: PoolExtended;
    hasTickRange: boolean;
    tickLower: number | null;
    tickUpper: number | null;
    minTickBound: number;
    maxTickBound: number;
    minPriceInput: string;
    maxPriceInput: string;
    depositEstimate: DepositEstimate | null;
};

const AddLiquidityEstimateSummary = ({
    pool,
    hasTickRange,
    tickLower,
    tickUpper,
    minTickBound,
    maxTickBound,
    minPriceInput,
    maxPriceInput,
    depositEstimate,
}: Props): React.ReactNode => (
    <RangeSummary>
        <SummaryRows>
            <SummaryRow>
                <SummaryLabel>
                    Selected range ({pool.tokens[0].code}/{pool.tokens[1].code})
                </SummaryLabel>
                <SummaryValue>
                    {hasTickRange && tickLower === minTickBound && tickUpper === maxTickBound
                        ? 'Full Range'
                        : `${minPriceInput} - ${maxPriceInput}`}
                </SummaryValue>
            </SummaryRow>
            <SummaryRow>
                <SummaryLabel>Ticks</SummaryLabel>
                <SummaryValue>
                    {tickLower ?? '-'} to {tickUpper ?? '-'}
                </SummaryValue>
            </SummaryRow>
            {depositEstimate ? (
                <>
                    <SummaryRow>
                        <SummaryLabel>Amount</SummaryLabel>
                        <SummaryAmounts>
                            <SummaryAmountItem>
                                <span>
                                    {formatBalance(
                                        depositEstimate.amounts[0],
                                        true,
                                        false,
                                        pool.tokens[0].decimal,
                                    )}
                                </span>
                                <AssetLogo asset={pool.tokens[0]} isSmall isCircle />
                            </SummaryAmountItem>
                            <SummaryAmountItem>
                                <span>
                                    {formatBalance(
                                        depositEstimate.amounts[1],
                                        true,
                                        false,
                                        pool.tokens[1].decimal,
                                    )}
                                </span>
                                <AssetLogo asset={pool.tokens[1]} isSmall isCircle />
                            </SummaryAmountItem>
                        </SummaryAmounts>
                    </SummaryRow>
                    <SummaryRow>
                        <SummaryLabel>Liquidity position</SummaryLabel>
                        <SummaryValue>
                            {depositEstimate.liquidityLoading ? (
                                <DotsLoader />
                            ) : (
                                depositEstimate.liquidityDisplay
                            )}
                        </SummaryValue>
                    </SummaryRow>
                </>
            ) : null}
        </SummaryRows>
    </RangeSummary>
);

export default AddLiquidityEstimateSummary;
