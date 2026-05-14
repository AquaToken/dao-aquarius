import { useCallback } from 'react';

import { tickToPrice } from 'helpers/amm-concentrated';
import { formatConcentratedPrice } from 'helpers/amm-concentrated-position-range';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import { PoolProcessed, PoolUserProcessed } from 'types/amm';
import { UserDistributionPositionDetail } from 'types/amm-concentrated-liquidity-chart';

import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';

import AddLiquidityModal from 'pages/amm/components/AddLiquidity/AddLiquidityModal';
import ConcentratedWithdrawModal from 'pages/amm/components/ConcentratedLiquidity/modals/ConcentratedWithdrawModal/ConcentratedWithdrawModal';

type ConcentratedPositionPool = PoolProcessed | PoolUserProcessed;
type CurrentPricePool = Pick<PoolProcessed, 'current_tick' | 'tokens'>;
type PositionRange = Pick<UserDistributionPositionDetail, 'tickLower' | 'tickUpper'>;

const getCurrentPriceLabel = (pool: CurrentPricePool) => {
    const decimalsDiff = pool.tokens[0].decimal - pool.tokens[1].decimal;
    const currentTick = Number(pool.current_tick);
    const currentPrice = Number.isFinite(currentTick)
        ? formatConcentratedPrice(tickToPrice(currentTick, decimalsDiff))
        : '-';

    return currentPrice === '-'
        ? currentPrice
        : `${currentPrice} ${pool.tokens[0].code}/${pool.tokens[1].code}`;
};

const useConcentratedPositionControls = ({
    pool,
    pricePool = pool,
}: {
    pool: ConcentratedPositionPool;
    pricePool?: CurrentPricePool;
}) => {
    const { isLogged } = useAuthStore();
    const currentPriceLabel = getCurrentPriceLabel(pricePool);

    const openDepositModal = useCallback(
        (position: PositionRange) => {
            const modalParams = {
                pool,
                initialConcentratedRange: {
                    tickLower: position.tickLower,
                    tickUpper: position.tickUpper,
                },
            };

            if (!isLogged) {
                ModalService.openModal(ChooseLoginMethodModal, {
                    callback: () =>
                        ModalService.openModal(AddLiquidityModal, modalParams, false, null, true),
                });
                return;
            }

            ModalService.openModal(AddLiquidityModal, modalParams, false, null, true);
        },
        [isLogged, pool],
    );

    const openWithdrawModal = useCallback(
        (initialPositionKey: string) => {
            if (!isLogged) {
                ModalService.openModal(ChooseLoginMethodModal, {
                    callback: () =>
                        ModalService.openModal(ConcentratedWithdrawModal, {
                            pool,
                            initialPositionKey,
                        }),
                });
                return;
            }

            ModalService.openModal(ConcentratedWithdrawModal, { pool, initialPositionKey });
        },
        [isLogged, pool],
    );

    return {
        currentPriceLabel,
        openDepositModal,
        openWithdrawModal,
    };
};

export default useConcentratedPositionControls;
