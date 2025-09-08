import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { POOL_TYPE } from 'constants/amm';
import { WithdrawTypes } from 'constants/withdraw';

import useAuthStore from 'store/authStore/useAuthStore';

import { SorobanService } from 'services/globalServices';

import { PoolExtended } from 'types/amm';
import { ModalProps } from 'types/modal';

import { COLORS } from 'web/styles';

import { ToggleGroup } from 'basics/inputs';
import PageLoader from 'basics/loaders/PageLoader';
import { ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import BalancedWithdraw from 'pages/amm/components/WithdrawFromPool/BalancedWithdraw/BalancedWithdraw';
import CustomWithdraw from 'pages/amm/components/WithdrawFromPool/CustomWithdraw/CustomWithdraw';
import SingleTokenWithdraw from 'pages/amm/components/WithdrawFromPool/SingleTokenWithdraw/SingleTokenWithdraw';

export const PairContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.lightGray};
    border-radius: 0.6rem;
    padding: 2.4rem;
    margin: 4rem 0 1.6rem;
`;

const ToggleGroupStyled = styled(ToggleGroup)`
    margin-top: 2.8rem;
    margin-bottom: 2.8rem;
`;

const OPTIONS = [
    { label: 'Balanced', value: WithdrawTypes.balanced },
    { label: 'One Coin', value: WithdrawTypes.single },
    { label: 'Custom', value: WithdrawTypes.custom },
];

const WithdrawFromPool = ({ params, close }: ModalProps<{ pool: PoolExtended }>) => {
    const { pool } = params;
    const [accountShare, setAccountShare] = useState(null);
    const [type, setType] = useState<WithdrawTypes>(WithdrawTypes.balanced);

    const [totalShares, setTotalShares] = useState(null);
    const [reserves, setReserves] = useState(null);
    const [incentives, setIncentives] = useState(null);
    const [rewards, setRewards] = useState(null);

    const { account } = useAuthStore();

    useEffect(() => {
        SorobanService.amm.getTotalShares(pool.address).then(res => {
            setTotalShares(res);
        });
    }, []);

    useEffect(() => {
        SorobanService.amm.getPoolReserves(pool.tokens, pool.address).then(setReserves);
    }, []);

    useEffect(() => {
        SorobanService.amm.getPoolIncentives(account.accountId(), pool.address).then(setIncentives);
    }, []);

    useEffect(() => {
        SorobanService.amm.getPoolRewards(account.accountId(), pool.address).then(res => {
            setRewards(Number(res.to_claim));
        });
    }, []);

    useEffect(() => {
        if (!account) {
            setAccountShare(null);
            return;
        }
        SorobanService.token
            .getTokenBalance(pool.share_token_address, account.accountId())
            .then(res => {
                setAccountShare(res);
            });
    }, [account]);

    return (
        <ModalWrapper $width="60rem">
            {accountShare === null ? (
                <PageLoader />
            ) : (
                <>
                    <ModalTitle>
                        Remove liquidity {pool.tokens.map(({ code }) => code).join('/')}
                    </ModalTitle>

                    {pool.pool_type === POOL_TYPE.stable && (
                        <ToggleGroupStyled value={type} options={OPTIONS} onChange={setType} />
                    )}

                    {type === WithdrawTypes.balanced && (
                        <BalancedWithdraw
                            pool={pool}
                            rewards={rewards}
                            reserves={reserves}
                            totalShares={totalShares}
                            accountShare={accountShare}
                            close={close}
                            incentives={incentives}
                        />
                    )}

                    {type === WithdrawTypes.single && (
                        <SingleTokenWithdraw
                            pool={pool}
                            rewards={rewards}
                            accountShare={accountShare}
                            close={close}
                            incentives={incentives}
                        />
                    )}

                    {type === WithdrawTypes.custom && (
                        <CustomWithdraw
                            pool={pool}
                            rewards={rewards}
                            accountShare={accountShare}
                            close={close}
                            incentives={incentives}
                        />
                    )}
                </>
            )}
        </ModalWrapper>
    );
};

export default WithdrawFromPool;
