import { useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import ChooseLoginMethodModal from 'modals/auth/ChooseLoginMethodModal';

import { useBatchedSearchUpdate } from '../web/routing/UrlQueryBatchProvider';

type Options = {
    /** Values of this param that require authentication (e.g. ["my"]) */
    authRequiredValues?: string[];
    /**
     * If true, do not write default value to URL when param is missing.
     * Also, when param is missing in URL, value will be an empty string ("") instead of defaultValue.
     */
    skipDefaultSync?: boolean;
};

type ParamInput<T extends string> = T | '' | null | undefined | false;
type ParamSetter<T extends string> = (next: ParamInput<T> | ((prev: T) => ParamInput<T>)) => void;

export function useUrlParam<T extends string>(
    paramName: string,
    defaultValue: T,
    options?: Options,
) {
    const location = useLocation();
    const updateSearch = useBatchedSearchUpdate();
    const { isLogged } = useAuthStore();

    // Always derive current params from the URL
    const currentParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

    const authSet = useMemo(
        () => new Set(options?.authRequiredValues ?? []),
        [options?.authRequiredValues],
    );

    const raw = currentParams.get(paramName);

    // URL is the single source of truth:
    // - if param exists in URL -> use it
    // - if param is missing and skipDefaultSync is true -> expose empty string
    // - otherwise -> expose defaultValue
    const value = useMemo(() => {
        if (raw !== null) return raw as T;

        if (options?.skipDefaultSync) return '' as ParamInput<T>;

        return defaultValue;
    }, [raw, defaultValue, options?.skipDefaultSync]) as T | '';

    // Ensure default value is present in URL when param is missing (opt-out via skipDefaultSync)
    useEffect(() => {
        if (options?.skipDefaultSync) return;

        // Only write default if it's truthy and param is missing
        if (raw === null && !!defaultValue) {
            updateSearch(params => {
                if (!params.has(paramName)) {
                    params.set(paramName, String(defaultValue));
                }
            }, true);
        }
    }, [raw, defaultValue, paramName, updateSearch, options?.skipDefaultSync]);

    const setValue: ParamSetter<T> = useCallback(
        next => {
            const current = (currentParams.get(paramName) ?? String(defaultValue)) as T;
            const nextValue = typeof next === 'function' ? next(current) : next;

            const applyValue = () => {
                updateSearch(params => {
                    // If next value is falsy (e.g. "", null, undefined, false), remove the param from URL
                    if (!nextValue) {
                        params.delete(paramName);
                        return;
                    }

                    params.set(paramName, String(nextValue));
                });
            };

            // Auth guard: require login for some values
            if (typeof nextValue === 'string' && authSet.has(nextValue) && !isLogged) {
                ModalService.openModal(ChooseLoginMethodModal, {
                    callback: applyValue,
                });
                return;
            }

            applyValue();
        },
        [authSet, currentParams, defaultValue, isLogged, paramName, updateSearch],
    );

    // Logout case: if user becomes logged out while being on an auth-required value,
    // reset param to its default value (or remove it if skipDefaultSync is true).
    useEffect(() => {
        if (isLogged) return;

        // If current URL value is auth-required, reset it
        if (raw !== null && authSet.has(raw)) {
            updateSearch(params => {
                if (options?.skipDefaultSync) {
                    params.delete(paramName);
                } else {
                    params.set(paramName, String(defaultValue));
                }
            });
        }
    }, [isLogged, raw, authSet, updateSearch, paramName, defaultValue, options?.skipDefaultSync]);

    return { value, setValue, paramName, defaultValue } as const;
}
