import * as React from 'react';
import { useEffect, useState } from 'react';

// In case we want to call the renderer every time the timeout expires,
// we don't need to pass the parameter skipTriggerWithEqualValues.
// The returned result will be the same as in useRef = { current - any}.

// If we want the rendering to not occur at the same values at the end of timeout,
// we need to pass the parameter skipTriggerWithEqualValues = true;
// The return value will be in the same form as the value passed to the function call

export function useDebounce<T>(value: T, delay: number, skipTriggerWithEqualValues: true): T;
export function useDebounce<T>(
    value: T,
    delay: number,
    skipTriggerWithEqualValues?: false | undefined,
): { current: T };
export function useDebounce<T>(
    value: T,
    delay: number,
    skipTriggerWithEqualValues?: boolean,
): { current: T } | T {
    const [debouncedValue, setDebouncedValue] = useState(
        skipTriggerWithEqualValues ? value : { current: value },
    );

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(skipTriggerWithEqualValues ? value : { current: value });
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
