import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { useBatchedSearchUpdate } from '../web/routing/UrlQueryBatchProvider';

export function useScopedSearchParams(allowedKeys: string[]) {
    const updateSearch = useBatchedSearchUpdate();
    const location = useLocation();

    // Always derive current params from the URL
    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

    useEffect(() => {
        const allowed = new Set(allowedKeys);
        let changed = false;

        // Check current URL first (cheap early exit)
        for (const key of Array.from(searchParams.keys())) {
            if (!allowed.has(key)) {
                changed = true;
                break;
            }
        }

        if (!changed) return;

        // Apply actual cleanup via shared batch updater
        updateSearch(params => {
            for (const key of Array.from(params.keys())) {
                if (!allowed.has(key)) {
                    params.delete(key);
                }
            }
        });
    }, [allowedKeys.join(','), searchParams, updateSearch]);
}
