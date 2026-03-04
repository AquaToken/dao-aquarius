import BigNumber from 'bignumber.js';

import { SorobanService } from 'services/globalServices';

import { ConcentratedPosition, PoolExtended } from 'types/amm';

import {
    hydratePositionsLiquidity,
    keyOfPosition,
    normalizePositions,
} from './amm-concentrated-positions';

export type DistributionItem = {
    tickLower: number;
    tickUpper: number;
    liquidity: number;
    isPreview?: boolean;
};

type DistributionData = {
    items: DistributionItem[];
    currentTick: number | null;
};

type Segment = {
    tickLower: number;
    tickUpper: number;
    liquidity: BigNumber;
};

const getUsdPerLiquidity = (pool: PoolExtended) => {
    const totalLiquidityUsd = new BigNumber(pool.liquidity_usd || 0).dividedBy(1e7);
    const totalShareLiquidity = new BigNumber(pool.total_share || pool.active_liquidity || 0);

    return totalShareLiquidity.gt(0)
        ? totalLiquidityUsd.dividedBy(totalShareLiquidity)
        : new BigNumber(0);
};

const buildLiquiditySegmentsFromTickMap = (
    tickMap: Record<string, string>,
    currentTick: number,
    activeLiquidity: string,
) => {
    const ticks = Object.entries(tickMap)
        .map(([tick, liquidityNet]) => ({
            tick: Number(tick),
            liquidityNet: new BigNumber(liquidityNet || 0),
        }))
        .filter(({ tick, liquidityNet }) => Number.isFinite(tick) && liquidityNet.isFinite())
        .sort((a, b) => a.tick - b.tick);

    if (ticks.length < 2) {
        return [] as Segment[];
    }

    const segments: Segment[] = [];
    const currentIndexByTick = ticks.findIndex(item => item.tick >= currentTick);
    const currentIndex =
        currentIndexByTick === -1 ? Math.max(1, ticks.length - 1) : currentIndexByTick;

    let liquidity = new BigNumber(activeLiquidity || 0);

    for (let i = currentIndex - 1; i >= 0; i--) {
        const tickLower = ticks[i].tick;
        const tickUpper = ticks[i + 1]?.tick ?? currentTick;
        if (tickUpper > tickLower && liquidity.gt(0)) {
            segments.unshift({ tickLower, tickUpper, liquidity });
        }
        liquidity = liquidity.minus(ticks[i].liquidityNet);
    }

    liquidity = new BigNumber(activeLiquidity || 0);
    for (let i = currentIndex; i < ticks.length - 1; i++) {
        liquidity = liquidity.plus(ticks[i].liquidityNet);
        const tickLower = ticks[i].tick;
        const tickUpper = ticks[i + 1].tick;
        if (tickUpper > tickLower && liquidity.gt(0)) {
            segments.push({ tickLower, tickUpper, liquidity });
        }
    }

    return segments;
};

const mapSegmentsToDistributionItems = (
    segments: Segment[],
    usdPerLiquidity: BigNumber,
): DistributionItem[] =>
    segments
        .map(segment => ({
            tickLower: segment.tickLower,
            tickUpper: segment.tickUpper,
            liquidity: segment.liquidity.multipliedBy(usdPerLiquidity).toNumber(),
        }))
        .filter(segment => segment.liquidity > 0);

const mapHydratedPositionsToDistributionItems = (
    hydrated: ConcentratedPosition[],
    usdPerLiquidity: BigNumber,
): DistributionItem[] => {
    const nonEmptyHydrated = hydrated.filter(item => Number(item.liquidity || 0) > 0);
    const unique = new Map(
        nonEmptyHydrated.map(position => [
            keyOfPosition(position),
            {
                tickLower: position.tickLower,
                tickUpper: position.tickUpper,
                liquidity: new BigNumber(position.liquidity || 0)
                    .multipliedBy(usdPerLiquidity)
                    .toNumber(),
            },
        ]),
    );

    return [...unique.values()].filter(position => position.liquidity > 0);
};

export const buildPoolLiquidityDistributionData = (pool: PoolExtended): DistributionData => {
    const currentTick = Number(pool.current_tick);
    const tickMap = pool.tick_map;

    if (!tickMap || !Object.keys(tickMap).length || !Number.isFinite(currentTick)) {
        return {
            items: [],
            currentTick: Number.isFinite(currentTick) ? currentTick : null,
        };
    }

    const segments = buildLiquiditySegmentsFromTickMap(
        tickMap,
        currentTick,
        pool.active_liquidity || '0',
    );
    const usdPerLiquidity = getUsdPerLiquidity(pool);

    return {
        items: mapSegmentsToDistributionItems(segments, usdPerLiquidity),
        currentTick,
    };
};

export const fetchUserLiquidityDistributionData = async (
    pool: PoolExtended,
    accountId?: string,
): Promise<DistributionData> => {
    const [slot0, snapshot] = await Promise.all([
        SorobanService.amm.getConcentratedSlot0(pool.address),
        accountId
            ? SorobanService.amm.getUserPositionSnapshot(pool.address, accountId)
            : Promise.resolve(null),
    ]);

    const resolvedCurrentTick = Number((slot0 as Record<string, unknown>)?.tick);
    const currentTick = Number.isFinite(resolvedCurrentTick) ? resolvedCurrentTick : null;

    if (!accountId || !snapshot) {
        return { items: [], currentTick };
    }

    const ranges = normalizePositions(snapshot);
    const hydrated = await hydratePositionsLiquidity(ranges, async range => {
        const position = await SorobanService.amm.getPosition(
            pool.address,
            accountId,
            range.tickLower,
            range.tickUpper,
        );
        return position?.liquidity;
    });

    const usdPerLiquidity = getUsdPerLiquidity(pool);

    return {
        items: mapHydratedPositionsToDistributionItems(hydrated, usdPerLiquidity),
        currentTick,
    };
};
