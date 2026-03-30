import BigNumber from 'bignumber.js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { POOL_TYPE } from 'constants/amm';

import { normalizePositions } from 'helpers/amm-concentrated-positions';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import { SorobanService, ToastService } from 'services/globalServices';

import { PoolExtended } from 'types/amm';

const hasPositiveValue = (value: string) => new BigNumber(value || '0').gt(0);

type ClaimAllFeesOptions = {
    onSuccess?: () => void;
};

type UseConcentratedFeesSummaryOptions = {
    reloadKey?: number;
    showErrors?: boolean;
};

export const useConcentratedFeesSummary = (
    pool: PoolExtended,
    { reloadKey, showErrors = true }: UseConcentratedFeesSummaryOptions = {},
) => {
    const { account } = useAuthStore();
    const tokenContractsKey = useMemo(
        () => pool.tokens.map(token => token.contract).join(':'),
        [pool.tokens],
    );
    const feeTokens = useMemo(() => pool.tokens, [tokenContractsKey]);

    const emptyFees = useMemo(() => feeTokens.map(() => '0'), [feeTokens]);
    const [allFees, setAllFees] = useState<string[]>(emptyFees);
    const [positionsCount, setPositionsCount] = useState(0);
    const [pending, setPending] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setAllFees(emptyFees);
    }, [emptyFees]);

    const load = useCallback(() => {
        if (!account || pool.pool_type !== POOL_TYPE.concentrated) {
            setAllFees(emptyFees);
            setPositionsCount(0);
            setLoading(false);
            return Promise.resolve();
        }

        setLoading(true);

        return Promise.all([
            SorobanService.amm.getAllPositionFees(pool.address, account.accountId(), feeTokens),
            SorobanService.amm.getUserPositionSnapshot(pool.address, account.accountId()),
        ])
            .then(async ([fees, snapshot]) => {
                const positions = normalizePositions(snapshot);

                if (!positions.length) {
                    setAllFees(emptyFees);
                    setPositionsCount(0);
                    return;
                }

                setAllFees(fees);

                if (!fees.some(hasPositiveValue)) {
                    setPositionsCount(0);
                    return;
                }

                const feesByPosition = await Promise.all(
                    positions.map(async position => {
                        try {
                            return await SorobanService.amm.getPositionFees(
                                pool.address,
                                account.accountId(),
                                feeTokens,
                                position.tickLower,
                                position.tickUpper,
                            );
                        } catch {
                            return emptyFees;
                        }
                    }),
                );

                setPositionsCount(
                    feesByPosition.filter(positionFees => positionFees.some(hasPositiveValue))
                        .length,
                );
            })
            .catch(error => {
                if (showErrors) {
                    ToastService.showErrorToast(error?.message || 'Failed to load fees');
                }
                setAllFees(emptyFees);
                setPositionsCount(0);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [account, emptyFees, feeTokens, pool.address, pool.pool_type]);

    useEffect(() => {
        load();
    }, [load, reloadKey]);

    const claimAllFees = useCallback(
        ({ onSuccess }: ClaimAllFeesOptions = {}) => {
            if (!account || pending) {
                return Promise.resolve();
            }

            if (account.authType === LoginTypes.walletConnect) {
                openCurrentWalletIfExist();
            }

            setPending(true);

            return SorobanService.amm
                .getClaimAllPositionFeesTx(account.accountId(), pool.address)
                .then(tx => account.signAndSubmitTx(tx, true))
                .then((res: { status?: BuildSignAndSubmitStatuses }) => {
                    if (!res) {
                        return;
                    }

                    if (res.status === BuildSignAndSubmitStatuses.pending) {
                        ToastService.showSuccessToast('More signatures required to complete');
                        return;
                    }

                    ToastService.showSuccessToast('All position fees claimed');
                    return load().then(() => {
                        onSuccess?.();
                    });
                })
                .catch(error => {
                    ToastService.showErrorToast(error?.message || 'Claim all fees failed');
                })
                .finally(() => {
                    setPending(false);
                });
        },
        [account, load, pending, pool.address],
    );

    return {
        account,
        allFees,
        positionsCount,
        pending,
        loading,
        hasAnyFees: allFees.some(hasPositiveValue),
        claimAllFees,
        reload: load,
    };
};
