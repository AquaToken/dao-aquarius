import { useEffect, useState } from 'react';

import { POOL_TYPE } from 'constants/amm';

import { getAssetString } from 'helpers/assets';

import useAuthStore from 'store/authStore/useAuthStore';

import { SorobanService, ToastService } from 'services/globalServices';

import { PoolExtended } from 'types/amm';
import { TokenType } from 'types/token';

type Params = {
    pool: PoolExtended;
    initialTickSpacing?: number | null;
    skipPoolDataLoading?: boolean;
};

export const useConcentratedPoolData = ({
    pool,
    initialTickSpacing = null,
    skipPoolDataLoading = false,
}: Params) => {
    const { account } = useAuthStore();
    const [slot0, setSlot0] = useState<Record<string, unknown> | null>(null);
    const [tickSpacing, setTickSpacing] = useState<number | null>(null);
    const [tokenBalances, setTokenBalances] = useState<Map<string, string>>(new Map());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!account) {
            setTokenBalances(new Map());
            return;
        }

        Promise.all(
            pool.tokens.map(async token => {
                const raw =
                    token.type === TokenType.soroban
                        ? await account.getAssetBalance(token)
                        : account.getAvailableForSwapBalance(token);

                return [getAssetString(token), String(raw || '0')] as [string, string];
            }),
        ).then(next => {
            setTokenBalances(new Map(next));
        });
    }, [account, pool.tokens]);

    useEffect(() => {
        if (skipPoolDataLoading) {
            setTickSpacing(initialTickSpacing);
            setSlot0(null);
            setLoading(false);
            return;
        }

        if (!account || pool.pool_type !== POOL_TYPE.concentrated) {
            return;
        }

        setLoading(true);

        Promise.all([
            SorobanService.amm.getConcentratedSlot0(pool.address),
            SorobanService.amm.getConcentratedTickSpacing(pool.address),
        ])
            .then(([slot, spacing]) => {
                setSlot0(slot as Record<string, unknown>);
                setTickSpacing(spacing);
            })
            .catch(e => {
                ToastService.showErrorToast(e?.message || 'Failed to load concentrated pool data');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [account, initialTickSpacing, pool.address, pool.pool_type, skipPoolDataLoading]);

    return {
        slot0,
        tickSpacing,
        tokenBalances,
        loading,
    };
};
