import * as React from 'react';

export interface MaskedInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function applyDateMask(raw: string): string {
    // Keep only digits and dots
    const v = raw.replace(/[^0-9.]/g, '');

    // Max 8 digits (MMDDYYYY), dots do not count
    const digits = v.replace(/\./g, '').slice(0, 8);

    const dotCount = (v.match(/\./g) || []).length;
    const endsWithDot = v.endsWith('.');

    // Split digits into date parts
    let mm = digits.slice(0, 2); // month
    let dd = digits.slice(2, 4); // day
    const yyyy = digits.slice(4, 8); // year

    let out = '';

    // --- Month ---
    // If month is a single digit and user typed a dot -> pad with leading zero
    if (dotCount >= 1 && mm.length === 1 && endsWithDot) {
        mm = '0' + mm;
    }
    out += mm;

    // Add first dot if:
    // - user typed at least one dot
    // - OR more than 2 digits are entered (day part started)
    if ((dotCount >= 1 || digits.length > 2) && mm.length > 0) {
        out += '.';
    }

    // --- Day ---
    // If day is a single digit and user typed a dot -> pad with leading zero
    if (dotCount >= 2 && dd.length === 1 && endsWithDot) {
        dd = '0' + dd;
    }
    out += dd;

    // Add second dot if:
    // - user typed at least two dots
    // - OR more than 4 digits are entered (year part started)
    if ((dotCount >= 2 || digits.length > 4) && mm.length === 2) {
        out += '.';
    }

    // --- Year ---
    out += yyyy;

    // Keep trailing dot if user explicitly typed it
    if (endsWithDot && !out.endsWith('.') && (dotCount === 1 || dotCount === 2)) {
        out += '.';
    }

    return out;
}

/**
 * HOC: wraps an input component with date mask logic.
 */
export function withDateMask<P>(Component: React.JSXElementConstructor<P & MaskedInputProps>) {
    const Masked = React.forwardRef<HTMLInputElement, P & MaskedInputProps>(
        ({ value, onChange, ...rest }, ref) => {
            const [innerValue, setInnerValue] = React.useState(value ?? '');

            const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const masked = applyDateMask(e.target.value);
                setInnerValue(masked);

                if (onChange) {
                    const syntheticEvent: React.ChangeEvent<HTMLInputElement> = {
                        ...e,
                        target: { ...e.target, value: masked },
                        currentTarget: { ...e.currentTarget, value: masked },
                    };
                    onChange(syntheticEvent);
                }
            };

            React.useEffect(() => {
                if (typeof value === 'string' && value !== innerValue) {
                    setInnerValue(applyDateMask(value));
                }
            }, [value, innerValue]);

            return (
                <Component
                    {...(rest as P)}
                    ref={ref}
                    type="text"
                    value={innerValue}
                    onChange={handleChange}
                    placeholder="MM.DD.YYYY"
                />
            );
        },
    );
    let compName = 'Component';
    if (typeof Component === 'function' && 'displayName' in Component) {
        const c = Component as { displayName?: string; name?: string };
        compName = c.displayName ?? c.name ?? 'Component';
    }

    Masked.displayName = `withDateMask(${compName})`;

    return Masked;
}
