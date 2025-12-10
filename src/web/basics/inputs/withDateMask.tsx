import * as React from 'react';

export interface MaskedInputProps extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange'
> {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Formats raw input into date format: MM.DD.YYYY.
 * - Accepts both manual and auto dots.
 * - Pads month/day with leading zero when the user types a dot after a single digit.
 *
 * Examples:
 *   "1."      → "01."
 *   "1.2."    → "01.02."
 *   "11111111"→ "11.11.1111"
 *   "11.11"   → "11.11"
 */
function applyDateMask(raw: string): string {
    // Keep only digits and dots
    const v = raw.replace(/[^0-9.]/g, '');

    // Max 8 digits (MMDDYYYY), dots are ignored
    const digits = v.replace(/\./g, '').slice(0, 8);

    const dotCount = (v.match(/\./g) || []).length;
    const endsWithDot = v.endsWith('.');

    // Split digits into date parts
    let mm = digits.slice(0, 2); // month
    let dd = digits.slice(2, 4); // day
    const yyyy = digits.slice(4, 8); // year

    let out = '';

    // --- Month ---
    // If month has one digit and user typed a dot → prepend "0"
    if (dotCount >= 1 && mm.length === 1 && endsWithDot) {
        mm = '0' + mm;
    }
    out += mm;

    // Add the first dot if:
    // - user manually typed a dot
    // - OR there are more than 2 digits (day started)
    if ((dotCount >= 1 || digits.length > 2) && mm.length > 0) {
        out += '.';
    }

    // --- Day ---
    // If day has one digit and user typed a dot → prepend "0"
    if (dotCount >= 2 && dd.length === 1 && endsWithDot) {
        dd = '0' + dd;
    }
    out += dd;

    // Add the second dot if:
    // - user typed two dots
    // - OR more than 4 digits are entered (year started)
    if ((dotCount >= 2 || digits.length > 4) && mm.length === 2) {
        out += '.';
    }

    // --- Year ---
    out += yyyy;

    // Preserve trailing dot if user explicitly typed it
    if (endsWithDot && !out.endsWith('.') && (dotCount === 1 || dotCount === 2)) {
        out += '.';
    }

    return out;
}

/**
 * HOC: wraps an input component with date mask logic.
 * - Handles both manual and auto dots.
 * - Maintains cursor (caret) position even when dots are inserted automatically.
 */
export function withDateMask<P>(Component: React.JSXElementConstructor<P & MaskedInputProps>) {
    const Masked = React.forwardRef<HTMLInputElement, P & MaskedInputProps>(
        ({ value, onChange, ...rest }, ref) => {
            const [innerValue, setInnerValue] = React.useState(value ?? '');
            const inputRef = React.useRef<HTMLInputElement | null>(null);

            // Expose the internal ref to parent components
            React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

            /**
             * Handles user typing and applies date mask.
             * Also restores correct caret position after masking.
             */
            const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const input = e.target;

                // Previous input value before reformatting
                const prev = innerValue;

                // Count how many dots existed before and after masking
                const prevDots = (prev.match(/\./g) || []).length;
                const pos = input.selectionStart ?? prev.length;

                // Apply mask to the raw input
                const masked = applyDateMask(input.value);

                // Count dots after formatting
                const nextDots = (masked.match(/\./g) || []).length;

                // Calculate how many dots were inserted or removed before caret
                const beforeCaretPrev = prev.slice(0, pos);
                const beforeCaretNext = applyDateMask(beforeCaretPrev);

                // Difference in visible length before/after mask up to caret
                const diff = beforeCaretNext.length - beforeCaretPrev.length;

                // Update the input value
                setInnerValue(masked);

                // Restore caret position after React re-renders the input
                requestAnimationFrame(() => {
                    const el = inputRef.current;
                    if (!el) return;

                    // Adjust cursor if dots were inserted before current position
                    const deltaDots = nextDots - prevDots;
                    const newPos = pos + diff + (deltaDots > 0 ? deltaDots : 0);

                    el.setSelectionRange(newPos, newPos);
                });

                // Emit masked value to external onChange
                if (onChange) {
                    const el = e.currentTarget;

                    if (el.value !== masked) {
                        const setter = Object.getOwnPropertyDescriptor(
                            HTMLInputElement.prototype,
                            'value',
                        )?.set;
                        setter?.call(el, masked);
                    }

                    onChange(e);
                }
            };

            /**
             * Keeps internal state in sync with external controlled value.
             */
            React.useEffect(() => {
                if (typeof value === 'string' && value !== innerValue) {
                    setInnerValue(applyDateMask(value));
                }
            }, [value, innerValue]);

            return (
                <Component
                    {...(rest as P)}
                    ref={inputRef}
                    type="text"
                    value={innerValue}
                    onChange={handleChange}
                    placeholder="MM.DD.YYYY"
                />
            );
        },
    );

    // Derive a safe displayName for better debugging in React DevTools
    const compName =
        typeof Component === 'function' && 'name' in Component && Component.name
            ? Component.name
            : 'Component';
    Masked.displayName = `withDateMask(${compName})`;

    return Masked;
}
