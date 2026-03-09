import * as React from 'react';

import { formatBalance } from 'helpers/format-number';

import { DepositEstimate, PoolExtended } from 'types/amm';

import AssetLogo from 'basics/AssetLogo';
import DotsLoader from 'basics/loaders/DotsLoader';

import { SummaryRows, SummaryValueRow } from '../../styled/ConcentratedAddLiquidity.styled';
type Props = {
    pool: PoolExtended;
    depositEstimate: DepositEstimate | null;
};

const AddLiquidityEstimateSummary = ({ pool, depositEstimate }: Props): React.ReactNode => {
    if (!depositEstimate) {
        return null;
    }

    return (
        <SummaryRows>
            <SummaryValueRow>
                <span>{pool.tokens[0].code}</span>
                <span>
                    {formatBalance(Number(depositEstimate.amounts[0]), true)}
                    <AssetLogo asset={pool.tokens[0]} isSmall isCircle />
                </span>
            </SummaryValueRow>
            <SummaryValueRow>
                <span>{pool.tokens[1].code}</span>
                <span>
                    {formatBalance(Number(depositEstimate.amounts[1]), true)}
                    <AssetLogo asset={pool.tokens[1]} isSmall isCircle />
                </span>
            </SummaryValueRow>
            <SummaryValueRow>
                <span>Liquidity position</span>
                <span>
                    {depositEstimate.liquidityLoading ? (
                        <DotsLoader />
                    ) : (
                        depositEstimate.liquidityDisplay
                    )}
                </span>
            </SummaryValueRow>
        </SummaryRows>
    );
};

export default AddLiquidityEstimateSummary;
