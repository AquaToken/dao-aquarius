import BigNumber from 'bignumber.js';

export type DistributionItem = {
    tickLower: number;
    tickUpper: number;
    liquidityRaw: string;
    liquidity: number;
    isPreview?: boolean;
    positionKey?: string;
};

export type UserDistributionPositionDetail = {
    key: string;
    tickLower: number;
    tickUpper: number;
    liquidity: string;
    tokenEstimates: string[];
    liquidityUsd: number;
};

export type DistributionData = {
    items: DistributionItem[];
    currentTick: number | null;
    positionDetails?: UserDistributionPositionDetail[];
};

export type Segment = {
    tickLower: number;
    tickUpper: number;
    liquidity: BigNumber;
};
