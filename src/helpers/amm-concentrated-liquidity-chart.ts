import BigNumber from 'bignumber.js';

import { getNativePrices } from 'api/amm';

import { SorobanService, StellarService } from 'services/globalServices';

import { ConcentratedPosition, PoolExtended } from 'types/amm';
import {
    DistributionData,
    DistributionItem,
    Segment,
    UserDistributionPositionDetail,
} from 'types/amm-concentrated-liquidity-chart';

import {
    hydratePositionsLiquidity,
    keyOfPosition,
    normalizePositions,
} from './amm-concentrated-positions';

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

    const nonEmptyPositions = hydrated.filter(item => new BigNumber(item.liquidity || 0).gt(0));
    const prices = await getNativePrices().catch(() => new Map());
    const tokenPrices = new Map([...prices.entries()].map(([key, value]) => [key, value.price]));
    const positionDetailsEntries = await Promise.all(
        nonEmptyPositions.map(async position => {
            try {
                const tokenEstimates = await SorobanService.amm.estimateWithdrawPosition(
                    accountId,
                    pool.address,
                    pool.tokens,
                    position.tickLower,
                    position.tickUpper,
                    String(position.liquidity || '0'),
                );
                const liquidityUsd = tokenEstimates.reduce((acc, amount, index) => {
                    const tokenPriceXlm = new BigNumber(
                        tokenPrices.get(pool.tokens[index].contract) || '0',
                    );
                    const tokenUsdPrice = tokenPriceXlm.multipliedBy(
                        StellarService.price.priceLumenUsd || 0,
                    );

                    return acc.plus(new BigNumber(amount || '0').multipliedBy(tokenUsdPrice));
                }, new BigNumber(0));

                return {
                    key: keyOfPosition(position),
                    tickLower: position.tickLower,
                    tickUpper: position.tickUpper,
                    liquidity: String(position.liquidity || '0'),
                    tokenEstimates,
                    liquidityUsd: liquidityUsd.toNumber(),
                } satisfies UserDistributionPositionDetail;
            } catch {
                return {
                    key: keyOfPosition(position),
                    tickLower: position.tickLower,
                    tickUpper: position.tickUpper,
                    liquidity: String(position.liquidity || '0'),
                    tokenEstimates: pool.tokens.map(() => '0'),
                    liquidityUsd: 0,
                } satisfies UserDistributionPositionDetail;
            }
        }),
    );

    return {
        items: mapHydratedPositionsToDistributionItems(nonEmptyPositions),
        currentTick,
        positionDetails: positionDetailsEntries,
    };
};
