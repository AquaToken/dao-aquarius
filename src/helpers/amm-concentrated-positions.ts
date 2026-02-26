import { ConcentratedPosition } from 'types/amm';

export const keyOfPosition = (position: ConcentratedPosition) =>
    `${position.tickLower}:${position.tickUpper}`;

export const normalizePositions = (snapshot: unknown): ConcentratedPosition[] => {
    const result: ConcentratedPosition[] = [];
    const visited = new WeakSet<object>();

    const toFiniteNumber = (value: unknown): number | null => {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }
        if (typeof value === 'bigint') {
            return Number(value);
        }
        if (typeof value === 'string') {
            const parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : null;
        }
        return null;
    };

    const parseTicksFromKey = (key: unknown): [number, number] | null => {
        if (Array.isArray(key) && key.length >= 2) {
            const lower = toFiniteNumber(key[0]);
            const upper = toFiniteNumber(key[1]);
            if (lower !== null && upper !== null) {
                return [lower, upper];
            }
        }
        if (typeof key === 'string') {
            const match = key.match(/-?\d+/g);
            if (match && match.length >= 2) {
                const lower = Number(match[0]);
                const upper = Number(match[1]);
                if (Number.isFinite(lower) && Number.isFinite(upper)) {
                    return [lower, upper];
                }
            }
        }
        return null;
    };

    const pushPosition = (tickLower: unknown, tickUpper: unknown, liquidity: unknown) => {
        const lower = toFiniteNumber(tickLower);
        const upper = toFiniteNumber(tickUpper);
        if (lower === null || upper === null || lower >= upper) {
            return;
        }
        result.push({
            tickLower: lower,
            tickUpper: upper,
            liquidity: String(liquidity ?? '0'),
        });
    };

    const parseObject = (obj: Record<string, unknown>) => {
        pushPosition(
            obj.tick_lower ?? obj.tickLower ?? obj.lower ?? obj.tickLowerIndex,
            obj.tick_upper ?? obj.tickUpper ?? obj.upper ?? obj.tickUpperIndex,
            obj.liquidity ?? obj.amount ?? obj.L ?? obj.value,
        );

        const range = obj.range ?? obj.ticks ?? obj.position;
        if (Array.isArray(range) && range.length >= 2) {
            pushPosition(range[0], range[1], obj.liquidity ?? obj.amount ?? obj.value);
        }
    };

    const visit = (node: unknown) => {
        if (!node) {
            return;
        }

        if (node instanceof Map) {
            for (const [key, value] of node.entries()) {
                const ticks = parseTicksFromKey(key);
                if (ticks) {
                    if (value && typeof value === 'object') {
                        const record = value as Record<string, unknown>;
                        pushPosition(
                            ticks[0],
                            ticks[1],
                            record.liquidity ?? record.amount ?? record.L ?? record.value,
                        );
                    } else {
                        pushPosition(ticks[0], ticks[1], value);
                    }
                }
                visit(value);
            }
            return;
        }

        if (Array.isArray(node)) {
            if (node.length >= 3) {
                pushPosition(node[0], node[1], node[2]);
            }

            if (node.length === 2) {
                const tupleTicks = parseTicksFromKey(node[0]);
                if (tupleTicks) {
                    pushPosition(tupleTicks[0], tupleTicks[1], node[1]);
                }
            }

            node.forEach(visit);
            return;
        }

        if (typeof node === 'object') {
            if (visited.has(node as object)) {
                return;
            }
            visited.add(node as object);

            parseObject(node as Record<string, unknown>);
            Object.values(node as Record<string, unknown>).forEach(visit);
        }
    };

    visit(snapshot);

    const unique = new Map(
        result.map(item => [
            keyOfPosition(item),
            {
                ...item,
                liquidity: String(item.liquidity ?? '0'),
            },
        ]),
    );
    return [...unique.values()];
};
