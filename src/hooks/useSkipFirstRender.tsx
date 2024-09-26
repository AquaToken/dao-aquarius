import { useEffect, useRef } from 'react';

export const useSkipFirstRender = (fn: () => void, args: unknown[]) => {
    const isMounted = useRef(false);

    useEffect(() => {
        if (isMounted.current) {
            return fn();
        }
    }, args);

    useEffect(() => {
        isMounted.current = true;
    }, []);
};
