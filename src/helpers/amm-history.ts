import { contractValueToAmount } from 'helpers/amount';
import { getAssetFromString } from 'helpers/assets';
import { getDateString } from 'helpers/date';
import getExplorerLink, { ExplorerSection } from 'helpers/explorer-links';
import { formatBalance } from 'helpers/format-number';

import { CombinedSwapEvent, PoolEvent, PoolEventType } from 'types/amm';

/**
 * Builds a unified "swap_combined" event from a list of raw AMM swap events.
 *
 * IMPORTANT:
 *  - amounts are expressed from the POOL'S perspective:
 *        amount > 0 → pool received token → user SENT token
 *        amount < 0 → pool lost token     → user RECEIVED token
 *
 *  - swap chain reconstruction:
 *        positiveAmountToken  --->  negativeAmountToken
 *
 *  - this gives:
 *        source (token user gave)
 *        destination (token user received)
 *        path (list of all intermediate tokens in order)
 */
function buildCombinedSwap(swaps: PoolEvent[]): CombinedSwapEvent | null {
    if (!swaps || swaps.length === 0) return null;
    if (swaps.length === 1) return null;

    type Token = string;

    const edges = new Map<Token, Token>(); // (pos → neg)
    const fromSet = new Set<Token>(); // tokens user gave (positive amounts)
    const toSet = new Set<Token>(); // tokens user received (negative amounts)

    const posAmount = new Map<Token, string>(); // outgoing amounts
    const negAmount = new Map<Token, string>(); // incoming amounts

    // Extract all directed edges and amount mappings
    for (const s of swaps) {
        if (!s.tokens) continue;

        const posIdx = s.amounts.findIndex(a => parseFloat(a) > 0);
        const negIdx = s.amounts.findIndex(a => parseFloat(a) < 0);

        if (posIdx === -1 || negIdx === -1) continue;

        const from = s.tokens[posIdx]; // user gave
        const to = s.tokens[negIdx]; // user received

        edges.set(from, to);
        fromSet.add(from);
        toSet.add(to);

        if (!posAmount.has(from)) posAmount.set(from, s.amounts[posIdx]);
        negAmount.set(to, s.amounts[negIdx]);
    }

    if (edges.size === 0) return null;

    // Determine source token (appears only as positive side)
    const source = [...fromSet].find(t => !toSet.has(t)) ?? [...fromSet][0];
    // Determine destination token (appears only as negative side)
    const dest = [...toSet].find(t => !fromSet.has(t)) ?? [...toSet][0];

    // Amounts relative to user
    const outAmount = posAmount.get(source) ?? '0'; // user spent
    const inAmount = negAmount.get(dest) ?? '0'; // user received

    /**
     * Construct path:
     *     source → hop1 → hop2 → ... → dest
     *
     * Follow edges forward until destination is reached.
     */
    const path: string[] = [];
    const visited = new Set<Token>();
    let current: Token | undefined = source;

    for (let i = 0; i < swaps.length + 5 && current; i++) {
        path.push(current);
        visited.add(current);

        if (current === dest) break;

        const next = edges.get(current);
        if (!next || visited.has(next)) break;

        current = next;
    }

    if (path[path.length - 1] !== dest) path.push(dest);

    // Metadata (ledger, timestamp) is taken from the last event in the group
    const meta = swaps[swaps.length - 1];

    return {
        ...meta,
        event_type: 'swap_combined',
        tokens: [source, dest],
        amounts: [outAmount, inAmount],
        original_swaps: swaps,
        path,
    };
}

/**
 * Processes ONLY fresh, raw backend history (no previous pages).
 * Detects swap groups and combines multi-hop swaps into a single "swap_combined" event.
 */
function processFresh(items: PoolEvent[]): (PoolEvent | CombinedSwapEvent)[] {
    const result: (PoolEvent | CombinedSwapEvent)[] = [];
    const swapGroups = new Map<string, PoolEvent[]>();
    const emitted = new Set<string>();

    // Group swaps by transaction hash
    for (const item of items) {
        if (item.event_type === PoolEventType.swap) {
            const tx = item.transaction_hash;
            if (!swapGroups.has(tx)) swapGroups.set(tx, []);
            swapGroups.get(tx)!.push(item);
        }
    }

    // Iterate in input order; combine only once per transaction
    for (const item of items) {
        if (item.event_type !== PoolEventType.swap) {
            result.push(item);
            continue;
        }

        const tx = item.transaction_hash;
        if (emitted.has(tx)) continue;

        const swaps = swapGroups.get(tx)!;
        if (swaps.length === 1) {
            result.push(swaps[0]);
            emitted.add(tx);
            continue;
        }

        const combined = buildCombinedSwap(swaps);
        if (combined) result.push(combined);
        else result.push(...swaps);

        emitted.add(tx);
    }

    return result.sort((a, b) => b.ledger - a.ledger);
}

/**
 * Pushes events into target[], skipping duplicates.
 * Duplicate key is based on:
 *   transaction_hash + event_type + ledger + tokens + amounts
 *
 * Used when merging previous and new pages.
 */
function appendUnique(
    target: (PoolEvent | CombinedSwapEvent)[],
    events: (PoolEvent | CombinedSwapEvent)[],
) {
    const existing = new Set(
        target.map(
            ev =>
                `${ev.transaction_hash}|${ev.event_type}|${ev.ledger}|${ev.tokens?.join(
                    ',',
                )}|${ev.amounts.join(',')}`,
        ),
    );

    for (const ev of events) {
        const key = `${ev.transaction_hash}|${ev.event_type}|${ev.ledger}|${ev.tokens?.join(
            ',',
        )}|${ev.amounts.join(',')}`;

        if (!existing.has(key)) {
            target.push(ev);
            existing.add(key);
        }
    }
}

/**
 * Processes new history page + optionally merges with previously processed history.
 *
 * DESIGN:
 *   - We DO NOT re-process the whole combined history.
 *   - Only new raw items are processed with processFresh().
 *   - Then, at merge time, we inspect only the boundary where
 *     previous and new parts might belong to the same transaction.
 *
 * BEHAVIOR:
 *   - If a swap chain spans across pages, we recombine it.
 *   - Non-swap events (deposit/withdraw/claim) are appended once.
 *   - One resulting swap_combined per transaction_hash.
 */
export function processHistory(
    items: PoolEvent[],
    previous?: (PoolEvent | CombinedSwapEvent)[],
): (PoolEvent | CombinedSwapEvent)[] {
    // Process new batch first
    const processedNew = processFresh(items);

    // No previous → return new results directly
    if (!previous || previous.length === 0) {
        return processedNew;
    }

    /**
     * Merge phase:
     *
     *   previous + new
     *
     * but ensuring:
     *   - swap chains spanning pages are recombined
     *   - no duplicate events remain
     */

    const byTxPrev = new Map<string, (PoolEvent | CombinedSwapEvent)[]>();
    const byTxNew = new Map<string, (PoolEvent | CombinedSwapEvent)[]>();

    function indexIntoMap(
        map: Map<string, (PoolEvent | CombinedSwapEvent)[]>,
        arr: (PoolEvent | CombinedSwapEvent)[],
    ) {
        for (const ev of arr) {
            const tx = ev.transaction_hash;
            if (!map.has(tx)) map.set(tx, []);
            map.get(tx)!.push(ev);
        }
    }

    indexIntoMap(byTxPrev, previous);
    indexIntoMap(byTxNew, processedNew);

    const final: (PoolEvent | CombinedSwapEvent)[] = [];
    const allTxs = new Set<string>([...Array.from(byTxPrev.keys()), ...Array.from(byTxNew.keys())]);

    for (const tx of allTxs) {
        const prevGroup = byTxPrev.get(tx) ?? [];
        const newGroup = byTxNew.get(tx) ?? [];

        const allEvents = [...prevGroup, ...newGroup];

        const hasSwap = allEvents.some(
            ev => ev.event_type === PoolEventType.swap || ev.event_type === 'swap_combined',
        );

        if (!hasSwap) {
            // No swap-like events → just append unique items
            appendUnique(final, allEvents);
            continue;
        }

        /**
         * For swap chains:
         *   Collect ALL raw swaps:
         *     - raw swap events
         *     - original_swaps from previous swap_combined
         *     - original_swaps from newly combined swaps
         *
         *   Then recombine them into ONE swap_combined.
         */
        const rawSwaps: PoolEvent[] = [];

        for (const ev of allEvents) {
            if (ev.event_type === PoolEventType.swap) {
                rawSwaps.push(ev as PoolEvent);
            } else if (ev.event_type === 'swap_combined') {
                const c = ev as CombinedSwapEvent;
                if (c.original_swaps) rawSwaps.push(...c.original_swaps);
            }
        }

        const combined = buildCombinedSwap(rawSwaps);

        if (combined) final.push(combined);
        else appendUnique(final, allEvents);
    }

    return final.sort((a, b) => b.ledger - a.ledger);
}

/**
 * Normalizes swap or non-swap amounts for UI.
 * Converts contract values → human-readable → printable string.
 */
const normalizeAmounts = (item: PoolEvent | CombinedSwapEvent) => {
    const isSwap = item.event_type === PoolEventType.swap || item.event_type === 'swap_combined';

    // Parse amounts per token
    const prepared = item.amounts.map((raw, index) => {
        const token = getAssetFromString(item.tokens[index]);
        const val = +contractValueToAmount(raw, token.decimal);
        return { val, code: token.code };
    });

    // For swaps we keep both values (outgoing → incoming)
    // For others we drop zero entries
    const list = isSwap ? prepared : prepared.filter(({ val }) => val !== 0);

    return list
        .map(({ val, code }) => {
            const formatted = formatBalance(Math.abs(val), true);
            return `${formatted} ${code}`;
        })
        .join(isSwap ? ' → ' : ', ');
};

/**
 * Produces UI label describing the swap or pool involved.
 */
const normalizeNote = (item: PoolEvent | CombinedSwapEvent) => {
    if (
        [
            PoolEventType.claim,
            PoolEventType.claimIncentives,
            PoolEventType.deposit,
            PoolEventType.withdraw,
        ].includes(item.event_type as PoolEventType)
    ) {
        const poolLabel = item.pool_tokens.map(id => getAssetFromString(id).code).join('/');
        return `Pool: ${poolLabel}`;
    }

    if (item.event_type === PoolEventType.swap || item.event_type === 'swap_combined') {
        return item.tokens.map(id => getAssetFromString(id).code).join(' → ');
    }

    return 'Unknown';
};

/**
 * Human-friendly labels for each event type.
 */
const TYPE_LABELS: Record<string, string> = {
    [PoolEventType.claim]: 'Claim Rewards',
    [PoolEventType.claimIncentives]: 'Claim Incentives',
    [PoolEventType.deposit]: 'Deposit',
    [PoolEventType.withdraw]: 'Withdraw',
    [PoolEventType.swap]: 'Swap',
    swap_combined: 'Swap',
};

/**
 * Final UI representation of a single history item.
 */
export const normalizeHistoryItem = (item: PoolEvent | CombinedSwapEvent) => ({
    ...item,
    key: item.transaction_hash,
    date: getDateString(new Date(item.ledger_close_at_str).getTime(), {
        withTime: true,
    }),
    title: TYPE_LABELS[item.event_type] ?? 'Unknown',
    note: normalizeNote(item),
    amountsStr: normalizeAmounts(item),
    tx: getExplorerLink(ExplorerSection.tx, item.transaction_hash),
});
