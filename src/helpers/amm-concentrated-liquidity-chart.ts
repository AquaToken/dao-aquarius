import BigNumber from 'bignumber.js';

import { SorobanService } from 'services/globalServices';

import { ConcentratedPosition, PoolExtended } from 'types/amm';
import {
    DistributionData,
    DistributionItem,
    Segment,
} from 'types/amm-concentrated-liquidity-chart';

import { keyOfPosition } from './amm-concentrated-positions';
import { loadConcentratedUserPositions } from './amm-concentrated-user-positions';

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

const normalizeDistributionItems = (
    items: Array<Omit<DistributionItem, 'liquidity'>>,
): DistributionItem[] => {
    const maxLiquidity = items.reduce((acc, item) => {
        const liquidity = new BigNumber(item.liquidityRaw || '0');

        return liquidity.gt(acc) ? liquidity : acc;
    }, new BigNumber(0));

    if (maxLiquidity.lte(0)) {
        return [];
    }

    return items
        .map(item => ({
            ...item,
            // Keep chart heights proportional without coercing large raw liquidity values to JS numbers.
            liquidity: new BigNumber(item.liquidityRaw || '0').dividedBy(maxLiquidity).toNumber(),
        }))
        .filter(item => item.liquidity > 0);
};

const mapSegmentsToDistributionItems = (segments: Segment[]): DistributionItem[] =>
    normalizeDistributionItems(
        segments.map(segment => ({
            tickLower: segment.tickLower,
            tickUpper: segment.tickUpper,
            liquidityRaw: segment.liquidity.toFixed(),
        })),
    );

const mapHydratedPositionsToDistributionItems = (
    hydrated: ConcentratedPosition[],
): DistributionItem[] => {
    const nonEmptyHydrated = hydrated.filter(item => new BigNumber(item.liquidity || 0).gt(0));
    const unique = new Map(
        nonEmptyHydrated.map(position => [
            keyOfPosition(position),
            {
                tickLower: position.tickLower,
                tickUpper: position.tickUpper,
                liquidityRaw: String(position.liquidity || '0'),
                positionKey: keyOfPosition(position),
            },
        ]),
    );

    return normalizeDistributionItems([...unique.values()]);
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

    return {
        items: mapSegmentsToDistributionItems(segments),
        currentTick,
    };
};

export const fetchUserLiquidityDistributionData = async (
    pool: PoolExtended,
    accountId?: string,
): Promise<DistributionData> => {
    const [slot0, userPositions] = await Promise.all([
        SorobanService.amm.getConcentratedSlot0(pool.address),
        accountId
            ? loadConcentratedUserPositions(pool, accountId)
            : Promise.resolve({ positions: [], rawLiquidity: '0' }),
    ]);

    const resolvedCurrentTick = Number((slot0 as Record<string, unknown>)?.tick);
    const currentTick = Number.isFinite(resolvedCurrentTick) ? resolvedCurrentTick : null;

    if (!accountId) {
        return { items: [], currentTick };
    }
    const positionDetailsEntries = userPositions.positions;

    return {
        items: mapHydratedPositionsToDistributionItems(positionDetailsEntries),
        currentTick,
        positionDetails: positionDetailsEntries,
    };
};
