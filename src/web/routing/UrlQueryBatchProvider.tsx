import * as React from 'react';
import { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function stringifyQueryKeepColon(params: URLSearchParams) {
    // URLSearchParams encodes ":" as %3A. We want to keep ":" unescaped in query.
    const parts: string[] = [];
    params.forEach((value, key) => {
        const k = encodeURIComponent(key).replace(/%3A/gi, ':');
        const v = encodeURIComponent(value).replace(/%3A/gi, ':');
        parts.push(`${k}=${v}`);
    });
    return parts.join('&');
}

type UpdateSearchFn = (mutate: (params: URLSearchParams) => void, withReplace?: boolean) => void;

const UrlQueryBatchContext = createContext<UpdateSearchFn | null>(null);

export function UrlQueryBatchProvider({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Shared batching state for all URL updates under this provider
    const pendingParamsRef = useRef<URLSearchParams | null>(null);
    const flushScheduledRef = useRef(false);
    const navigateWithReplace = useRef(false);

    const flush = useCallback(() => {
        const pending = pendingParamsRef.current;
        const withReplace = navigateWithReplace.current;
        pendingParamsRef.current = null;
        flushScheduledRef.current = false;
        navigateWithReplace.current = false;

        if (!pending) return;

        const nextSearch = stringifyQueryKeepColon(pending);
        const currentSearch = location.search.startsWith('?')
            ? location.search.slice(1)
            : location.search;

        // Avoid redundant navigation
        if (nextSearch === currentSearch) return;

        navigate(
            {
                pathname: location.pathname,
                search: nextSearch ? `?${nextSearch}` : '',
            },
            {
                replace: withReplace,
            },
        );
    }, [navigate, location.pathname, location.search]);

    const updateSearch: UpdateSearchFn = useCallback(
        (mutate, withReplace) => {
            // Start from pending changes if present, otherwise from current URL
            const base = pendingParamsRef.current ?? new URLSearchParams(location.search);

            if (withReplace) {
                navigateWithReplace.current = true;
            }

            const next = new URLSearchParams(base);
            mutate(next);

            pendingParamsRef.current = next;

            // Flush once per tick (microtask)
            if (!flushScheduledRef.current) {
                flushScheduledRef.current = true;
                queueMicrotask(flush);
            }
        },
        [location.search, flush],
    );

    const value = useMemo(() => updateSearch, [updateSearch]);

    return <UrlQueryBatchContext.Provider value={value}>{children}</UrlQueryBatchContext.Provider>;
}

export function useBatchedSearchUpdate() {
    const ctx = useContext(UrlQueryBatchContext);
    if (!ctx) {
        throw new Error('useBatchedSearchUpdate must be used within UrlQueryBatchProvider');
    }
    return ctx;
}
