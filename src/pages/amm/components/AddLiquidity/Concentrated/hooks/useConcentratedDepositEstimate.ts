import { useCallback, useEffect, useRef, useState } from 'react';

import { CONCENTRATED_DEPOSIT_ESTIMATE_DEBOUNCE_MS } from 'constants/amm';

import { parseConcentratedAmount } from 'helpers/amm-concentrated';
import { contractValueToFormattedAmount } from 'helpers/amount';
import { getAssetString } from 'helpers/assets';

import { useDebounce } from 'hooks/useDebounce';

import useAuthStore from 'store/authStore/useAuthStore';

import { SorobanService } from 'services/globalServices';

import { DepositEstimate, PoolExtended } from 'types/amm';

type Params = {
    pool: PoolExtended;
    disableNetworkEstimate?: boolean;
};

export const useConcentratedDepositEstimate = ({
    pool,
    disableNetworkEstimate = false,
}: Params) => {
    const { account } = useAuthStore();
    const liquidityEstimateCallIdRef = useRef(0);
    const [depositEstimate, setDepositEstimate] = useState<DepositEstimate | null>(null);
    const [estimateRequest, setEstimateRequest] = useState<{
        amounts: [string, string];
        tickLower: number;
        tickUpper: number;
    } | null>(null);

    const debouncedEstimateRequest = useDebounce(
        estimateRequest,
        CONCENTRATED_DEPOSIT_ESTIMATE_DEBOUNCE_MS,
        true,
    );

    const setEstimateIfChanged = useCallback((nextValue: DepositEstimate | null) => {
        setDepositEstimate(prev => {
            if (prev === nextValue) {
                return prev;
            }
            if (!prev || !nextValue) {
                return nextValue;
            }

            const isSame =
                prev.liquidityDisplay === nextValue.liquidityDisplay &&
                prev.liquidityLoading === nextValue.liquidityLoading &&
                prev.amounts[0] === nextValue.amounts[0] &&
                prev.amounts[1] === nextValue.amounts[1];

            return isSame ? prev : nextValue;
        });
    }, []);

    const setEstimateRequestIfChanged = useCallback(
        (
            nextValue: {
                amounts: [string, string];
                tickLower: number;
                tickUpper: number;
            } | null,
        ) => {
            setEstimateRequest(prev => {
                if (prev === nextValue) {
                    return prev;
                }
                if (!prev || !nextValue) {
                    return nextValue;
                }

                const isSame =
                    prev.tickLower === nextValue.tickLower &&
                    prev.tickUpper === nextValue.tickUpper &&
                    prev.amounts[0] === nextValue.amounts[0] &&
                    prev.amounts[1] === nextValue.amounts[1];

                return isSame ? prev : nextValue;
            });
        },
        [],
    );

    const updateLocalDepositPreview = useCallback(
        (
            nextAmount0: string,
            nextAmount1: string,
            nextTickLower: number | null,
            nextTickUpper: number | null,
        ) => {
            const nextAmount0Value = parseConcentratedAmount(nextAmount0);
            const nextAmount1Value = parseConcentratedAmount(nextAmount1);

            if (
                nextTickLower === null ||
                nextTickUpper === null ||
                nextTickLower >= nextTickUpper ||
                (nextAmount0Value === null && nextAmount1Value === null)
            ) {
                setEstimateIfChanged(null);
                setEstimateRequestIfChanged(null);
                return;
            }

            const hasAnyAmount =
                (nextAmount0Value?.gt(0) ?? false) || (nextAmount1Value?.gt(0) ?? false);

            if (!hasAnyAmount) {
                setEstimateIfChanged(null);
                setEstimateRequestIfChanged(null);
                return;
            }

            const amounts = [nextAmount0 || '0', nextAmount1 || '0'] as [string, string];
            setEstimateIfChanged({
                amounts,
                liquidityDisplay: '0',
                liquidityLoading: true,
            });
            setEstimateRequestIfChanged({
                amounts,
                tickLower: nextTickLower,
                tickUpper: nextTickUpper,
            });
        },
        [setEstimateIfChanged, setEstimateRequestIfChanged],
    );

    useEffect(() => {
        if (!debouncedEstimateRequest) {
            return;
        }

        const {
            amounts,
            tickLower: requestTickLower,
            tickUpper: requestTickUpper,
        } = debouncedEstimateRequest;

        if (!account) {
            setDepositEstimate({ amounts, liquidityDisplay: '0', liquidityLoading: false });
            return;
        }

        if (disableNetworkEstimate) {
            setDepositEstimate({ amounts, liquidityDisplay: '-', liquidityLoading: false });
            return;
        }

        const callId = ++liquidityEstimateCallIdRef.current;
        const desired = new Map([
            [getAssetString(pool.tokens[0]), amounts[0]],
            [getAssetString(pool.tokens[1]), amounts[1]],
        ]);

        SorobanService.amm
            .estimateDepositPosition(
                account.accountId(),
                pool.address,
                pool.tokens,
                requestTickLower,
                requestTickUpper,
                desired,
            )
            .then(result => {
                if (callId !== liquidityEstimateCallIdRef.current) {
                    return;
                }

                const estimatedAmounts =
                    result?.amounts && result.amounts.length === 2 ? result.amounts : amounts;

                setDepositEstimate({
                    amounts: estimatedAmounts,
                    liquidityDisplay: contractValueToFormattedAmount(
                        result?.liquidity || '0',
                        pool.share_token_decimals,
                        true,
                    ),
                    liquidityLoading: false,
                });
            })
            .catch(() => {
                if (callId !== liquidityEstimateCallIdRef.current) {
                    return;
                }

                setDepositEstimate({ amounts, liquidityDisplay: '0', liquidityLoading: false });
            });
    }, [
        account,
        debouncedEstimateRequest,
        disableNetworkEstimate,
        pool.address,
        pool.share_token_decimals,
        pool.tokens,
    ]);

    return {
        depositEstimate,
        updateLocalDepositPreview,
    };
};
