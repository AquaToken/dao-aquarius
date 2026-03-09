import * as React from 'react';

import { POOL_TYPE } from 'constants/amm';

import { PoolExtended } from 'types/amm';

import { DescriptionRow, PoolRates, RevertIcon } from './AddLiquidity.styled';

type AddLiquidityPoolSummaryProps = {
    pool: PoolExtended;
    liquidityDisplay: string;
    rates: Map<string, string> | null;
    priceIndex: number;
    onRotatePriceIndex: () => void;
};

const AddLiquidityPoolSummary = ({
    pool,
    liquidityDisplay,
    rates,
    priceIndex,
    onRotatePriceIndex,
}: AddLiquidityPoolSummaryProps): React.ReactNode => (
    <>
        <DescriptionRow>
            <span>Type</span>
            <span>{pool.pool_type === 'stable' ? 'Stable' : 'Volatile'}</span>
        </DescriptionRow>
        <DescriptionRow>
            <span>Fee</span>
            <span>{(Number(pool.fee) * 100).toFixed(2)} %</span>
        </DescriptionRow>
        <DescriptionRow>
            <span>Liquidity</span>
            <span>{liquidityDisplay}</span>
        </DescriptionRow>
        {pool.pool_type === POOL_TYPE.constant && Boolean(rates) && (
            <DescriptionRow>
                <span>Pool rates</span>
                <PoolRates onClick={onRotatePriceIndex}>
                    {[...rates.values()][priceIndex]} <RevertIcon />
                </PoolRates>
            </DescriptionRow>
        )}
    </>
);

export default AddLiquidityPoolSummary;
