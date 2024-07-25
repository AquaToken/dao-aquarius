import * as React from 'react';
import { useEffect, useState } from 'react';

export function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState({ current: value });

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue({ current: value });
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
