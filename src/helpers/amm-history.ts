import { contractValueToAmount } from 'helpers/amount';
import { getAssetFromString } from 'helpers/assets';
import { convertUTCToLocalDateIgnoringTimezone, getDateString } from 'helpers/date';
import getExplorerLink, { ExplorerSection } from 'helpers/explorer-links';
import { formatBalance } from 'helpers/format-number';

import { CombinedSwapEvent, PoolEvent, PoolEventType } from 'types/amm';

/**
 * Converts multiple raw swap hops into a single logical swap.
 * Reconstructs the token flow (A→B→C→D), determines final
 * source/destination tokens and amounts, and returns a unified event.
 */
function buildCombinedSwap(swaps: PoolEvent[]): CombinedSwapEvent | null {
    // Single swap → nothing to combine
    if (!swaps || !swaps.length) return null;

    type Token = string;

    // Graph structure: each hop is one directed edge (sent → received)
    const edges = new Map<Token, Token>();
    const fromSet = new Set<Token>(); // tokens user sent
    const toSet = new Set<Token>(); // tokens user received

    // We also track amounts for source/destination tokens
    const posAmount = new Map<Token, string>(); // user outgoing
    const negAmount = new Map<Token, string>(); // user incoming

    // Build edges and collect amounts for all hops
    for (const s of swaps) {
        if (!s.tokens) continue;

        // Find outgoing (positive) and incoming (negative) legs
        const posIdx = s.amounts.findIndex(a => parseFloat(a) > 0);
        const negIdx = s.amounts.findIndex(a => parseFloat(a) < 0);
        if (posIdx === -1 || negIdx === -1) continue;

        const from = s.tokens[posIdx]; // user sent this token
        const to = s.tokens[negIdx]; // user received this token

        // Create hop: from → to
        edges.set(from, to);
        fromSet.add(from);
        toSet.add(to);

        // Record amounts (first outgoing, last incoming)
        if (!posAmount.has(from)) posAmount.set(from, s.amounts[posIdx]);
        negAmount.set(to, s.amounts[negIdx]);
    }

    // If no valid hops detected → nothing to combine
    if (edges.size === 0) return null;

    // Source = token that only appears as outgoing
    const source = [...fromSet].find(t => !toSet.has(t)) ?? [...fromSet][0];

    // Destination = token that only appears as incoming
    const dest = [...toSet].find(t => !fromSet.has(t)) ?? [...toSet][0];

    // Final amounts for user (outgoing/incoming)
    const outAmount = posAmount.get(source) ?? '0';
    const inAmount = negAmount.get(dest) ?? '0';

    // Reconstruct full hop ordering: source → hop1 → hop2 → ... → dest
    const path: string[] = [];
    const visited = new Set<Token>();
    let current: Token | undefined = source;

    // Follow edges until we reach the final destination
    for (let i = 0; i < swaps.length + 5 && current; i++) {
        path.push(current);
        visited.add(current);

        if (current === dest) break;

        const next = edges.get(current);
        if (!next || visited.has(next)) break;
        current = next;
    }

    // Ensure final token exists in path
    if (path[path.length - 1] !== dest) path.push(dest);

    // Metadata: ledger/time — identical across all swaps; take the last one
    const meta = swaps[swaps.length - 1];

    return {
        ...meta,
        event_type: 'swap_combined',
        tokens: [source, dest], // final user-level swap pair
        amounts: [outAmount, inAmount], // user out/in amounts
        original_swaps: swaps, // raw hops for debugging
        path, // ordered chain A→B→C→D
    };
}

/**
 * Converts raw AMM events into a normalized page:
 *   • Directly emits all non-swap events.
 *   • Groups swaps by transaction and collapses multi-hop sequences.
 *   • Produces one entry per transaction and sorts by ledger desc.
 *
 * Optimized for a single linear scan with minimal overhead.
 */
function processFresh(items: PoolEvent[]): (PoolEvent | CombinedSwapEvent)[] {
    const result: (PoolEvent | CombinedSwapEvent)[] = [];
    const swapGroups = new Map<string, PoolEvent[]>();

    // First pass: emit non-swaps, collect swaps by transaction_hash
    for (let i = 0; i < items.length; i++) {
        const ev = items[i];

        // Non-swap events are appended immediately
        if (ev.event_type !== PoolEventType.swap) {
            result.push(ev);
            continue;
        }

        // Swap events are stored for later reconstruction
        const tx = ev.transaction_hash;
        let group = swapGroups.get(tx);
        if (!group) {
            group = [];
            swapGroups.set(tx, group);
        }
        group.push(ev);
    }

    // Second pass: process each swap group
    for (const swaps of swapGroups.values()) {
        // Multi-hop swap → build a single combined event
        const combined = buildCombinedSwap(swaps);
        result.push(combined);
    }

    // Final ordering: newest events first
    return result.sort((a, b) => b.ledger - a.ledger);
}

/**
 * Merges a new history page with the previous one.
 * Only handles the rare case when a multi-hop swap is split across pages.
 */
export function processHistory(
    items: PoolEvent[],
    previous?: (PoolEvent | CombinedSwapEvent)[],
): (PoolEvent | CombinedSwapEvent)[] {
    // First convert the new raw API page into normalized events
    const fresh = processFresh(items);

    // No previous history → nothing to merge
    if (!previous || previous.length === 0) {
        return fresh;
    }

    // Boundary elements: possible point where a multi-hop swap was split
    const prevLast = previous[previous.length - 1];
    const freshFirst = fresh[0];

    // Determine if both boundary events are swaps (raw or combined)
    const isPrevSwap =
        prevLast.event_type === PoolEventType.swap || prevLast.event_type === 'swap_combined';

    const isFreshSwap =
        freshFirst.event_type === PoolEventType.swap || freshFirst.event_type === 'swap_combined';

    /**
     * Fast exit:
     * If these two events are not swap-like OR their tx_hash differs,
     * then the new page does not continue a multi-hop swap from the
     * previous page → simply concatenate histories.
     */
    if (!isPrevSwap || !isFreshSwap || prevLast.transaction_hash !== freshFirst.transaction_hash) {
        return [...previous, ...fresh];
    }

    // We now KNOW that a multi-hop swap was split across pages
    const tx = prevLast.transaction_hash;

    // Re-collect ALL original swap events from both pages for this transaction
    const raw: PoolEvent[] = [];

    // Collect raw swaps from previous tail (last 4)
    for (const ev of previous.slice(-4)) {
        if (ev.transaction_hash !== tx) continue;
        if (ev.event_type === PoolEventType.swap) raw.push(ev);
        if (ev.event_type === 'swap_combined') raw.push(...ev.original_swaps!);
    }

    // Collect raw swaps from fresh head (first 4)
    for (const ev of fresh.slice(0, 4)) {
        if (ev.transaction_hash !== tx) continue;
        if (ev.event_type === PoolEventType.swap) raw.push(ev);
        if (ev.event_type === 'swap_combined') raw.push(...ev.original_swaps!);
    }

    // Build one correct combined multi-hop swap from all raw hops
    const combined = buildCombinedSwap(raw)!;

    // Remove outdated swap fragments for this transaction
    const cleanedPrevious = previous.filter(ev => ev.transaction_hash !== tx);
    const cleanedFresh = fresh.filter(ev => ev.transaction_hash !== tx);

    // Insert the new combined version between the cleaned sections
    return [...cleanedPrevious, combined, ...cleanedFresh].sort((a, b) => b.ledger - a.ledger);
}

/**
 * Produces readable amounts string for UI.
 * For swaps: A → B
 * For pool actions: filter out zero legs.
 */
const normalizeAmounts = (item: PoolEvent | CombinedSwapEvent) => {
    const prepared = item.amounts.map((raw, index) => {
        const token = getAssetFromString(item.tokens[index]);
        const val = +contractValueToAmount(raw, token.decimal);
        return { val, code: token.code };
    });

    const list = prepared.filter(({ val }) => val !== 0);

    return list
        .map(({ val, code }) => {
            const formatted = formatBalance(Math.abs(val), true);
            return `${formatted} ${code}`;
        })
        .join(' → ');
};

/**
 * Describes the operation route in UI.
 * Combined swaps: source → dest
 * Raw swaps: only non-zero legs
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

    if (item.event_type === 'swap_combined') {
        return item.tokens.map(id => getAssetFromString(id).code).join(' → ');
    }

    if (item.event_type === PoolEventType.swap) {
        const posIdx = item.amounts.findIndex(a => parseFloat(a) > 0);
        const negIdx = item.amounts.findIndex(a => parseFloat(a) < 0);

        return [item.tokens[posIdx], item.tokens[negIdx]]
            .map(id => getAssetFromString(id).code)
            .join(' → ');
    }

    return 'Unknown';
};

const TYPE_LABELS: Record<string, string> = {
    [PoolEventType.claim]: 'Claim Rewards',
    [PoolEventType.claimIncentives]: 'Claim Incentives',
    [PoolEventType.deposit]: 'Deposit',
    [PoolEventType.withdraw]: 'Withdraw',
    [PoolEventType.swap]: 'Swap',
    swap_combined: 'Swap',
};

/**
 * Full UI-ready item structure.
 */
export const normalizeHistoryItem = (item: PoolEvent | CombinedSwapEvent) => ({
    ...item,
    key: item.transaction_hash,
    date: getDateString(
        convertUTCToLocalDateIgnoringTimezone(new Date(item.ledger_close_at_str)).getTime(),
        { withTime: true },
    ),
    title: TYPE_LABELS[item.event_type] ?? 'Unknown',
    note: normalizeNote(item),
    amountsStr: normalizeAmounts(item),
    tx: getExplorerLink(ExplorerSection.tx, item.transaction_hash),
});
