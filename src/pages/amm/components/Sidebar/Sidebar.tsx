import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { flexRowSpaceBetween, respondDown } from '../../../../common/mixins';
import Button from '../../../../common/basics/Button';
import { ModalService, SorobanService } from '../../../../common/services/globalServices';
import DepositToPool from '../DepositToPool/DepositToPool';
import WithdrawFromPool from '../WithdrawFromPool/WithdrawFromPool';
import useAuthStore from '../../../../store/authStore/useAuthStore';
import ChooseLoginMethodModal from '../../../../common/modals/ChooseLoginMethodModal';
import { useEffect, useState } from 'react';
import PageLoader from '../../../../common/basics/PageLoader';
import { formatBalance } from '../../../../common/helpers/helpers';
import Asset from '../../../vote/components/AssetDropdown/Asset';
import { PoolExtended } from '../../api/types';

const Container = styled.aside`
    float: right;
    position: sticky;
    right: 10%;
    top: 2rem;
    padding: 4.5rem 5rem;
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 0.5rem;
    background: ${COLORS.white};
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: -18rem;
    min-width: 35rem;
    z-index: 102;

    ${respondDown(Breakpoints.lg)`
         float: unset;
         position: relative;
         width: calc(100% - 3.2rem);
         margin-top: 0;
         right: unset;
         margin: 1.6rem;
         box-shadow: unset;
    `}
`;

const SidebarRow = styled.div`
    ${flexRowSpaceBetween};
    align-items: center;
    color: ${COLORS.grayText};

    span {
        display: flex;
        align-items: center;
        gap: 0.8rem;
    }

    span:first-child {
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.paragraphText};
    }
`;

const Sidebar = ({ pool }: { pool: PoolExtended }) => {
    const { isLogged, account } = useAuthStore();
    const [accountShare, setAccountShare] = useState(null);

    useEffect(() => {
        if (!account) {
            setAccountShare(null);
            return;
        }
        SorobanService.getTokenBalance(pool.share_token_address, account.accountId()).then(
            (res) => {
                setAccountShare(res);
            },
        );
    }, [account]);
    const openDepositModal = () => {
        if (!isLogged) {
            return ModalService.openModal(ChooseLoginMethodModal, {
                callback: () => ModalService.openModal(DepositToPool, { pool, accountShare }),
            });
        }
        ModalService.openModal(DepositToPool, { pool, accountShare });
    };
    const openWithdrawModal = () => {
        if (!isLogged) {
            return ModalService.openModal(ChooseLoginMethodModal, {});
        }
        ModalService.openModal(WithdrawFromPool, { pool });
    };
    return (
        <Container>
            {isLogged && accountShare === null ? (
                <PageLoader />
            ) : (
                <>
                    {isLogged && (
                        <>
                            <SidebarRow>
                                <span>Shares: </span>
                                <span>
                                    {formatBalance(accountShare, true)} (
                                    {Number(pool.total_share)
                                        ? formatBalance(
                                              (100 * accountShare) /
                                                  (Number(pool.total_share) / 1e7),
                                              true,
                                          )
                                        : '0'}
                                    %)
                                </span>
                            </SidebarRow>
                            {pool.assets.map((asset, index) => (
                                <SidebarRow>
                                    <span>Pooled {asset.code}:</span>
                                    <span>
                                        {Number(pool.total_share)
                                            ? formatBalance(
                                                  ((Number(pool.reserves[index]) / 1e7) *
                                                      accountShare) /
                                                      (Number(pool.total_share) / 1e7),
                                                  true,
                                              )
                                            : '0'}{' '}
                                        <Asset asset={asset} onlyLogoSmall />
                                    </span>
                                </SidebarRow>
                            ))}
                        </>
                    )}

                    <Button
                        fullWidth
                        onClick={() => openDepositModal()}
                        disabled={pool.deposit_killed}
                    >
                        Deposit
                    </Button>
                    <Button
                        fullWidth
                        onClick={() => openWithdrawModal()}
                        disabled={Number(accountShare) === 0}
                    >
                        Withdraw
                    </Button>
                </>
            )}
        </Container>
    );
};

export default Sidebar;
