import { ConcentratedPosition, ConcentratedUserPositionSnapshot } from 'types/amm';

export const keyOfPosition = (position: ConcentratedPosition) =>
    `${position.tickLower}:${position.tickUpper}`;

export const normalizePositions = (
    snapshot: ConcentratedUserPositionSnapshot | null | undefined,
): ConcentratedPosition[] => {
    if (!snapshot?.ranges?.length) {
        return [];
    }

    const unique = new Map<string, ConcentratedPosition>();

    snapshot.ranges.forEach(range => {
        const lower = Number(range.tick_lower);
        const upper = Number(range.tick_upper);

        if (!Number.isFinite(lower) || !Number.isFinite(upper) || lower >= upper) {
            return;
        }

        const position: ConcentratedPosition = {
            tickLower: lower,
            tickUpper: upper,
            liquidity: String(range.liquidity ?? '0'),
        };

        unique.set(keyOfPosition(position), position);
    });

    return [...unique.values()];
};

export const hydratePositionsLiquidity = (
    ranges: ConcentratedPosition[],
    resolveLiquidity: (position: ConcentratedPosition) => Promise<string | null | undefined>,
): Promise<ConcentratedPosition[]> => {
    if (!ranges.length) {
        return Promise.resolve(ranges);
    }

    return Promise.all(
        ranges.map(async range => {
            try {
                const liquidity = await resolveLiquidity(range);
                return {
                    ...range,
                    liquidity: String(liquidity ?? range.liquidity ?? '0'),
                };
            } catch {
                return range;
            }
        }),
    );
};
