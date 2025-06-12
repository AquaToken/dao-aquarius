import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, SorobanService } from 'services/globalServices';

import { PoolExtended } from 'types/amm';

import { cardBoxShadow, flexRowSpaceBetween, respondDown } from 'web/mixins';
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';
import { Breakpoints, COLORS } from 'web/styles';

import DepositIcon from 'assets/icon-deposit.svg';
import WithdrawIcon from 'assets/icon-withdraw.svg';

import Asset from 'basics/Asset';
import Button from 'basics/buttons/Button';
import PageLoader from 'basics/loaders/PageLoader';

import SwapForm from 'pages/swap/components/SwapForm/SwapForm';

import DepositToPool from '../DepositToPool/DepositToPool';
import WithdrawFromPool from '../WithdrawFromPool/WithdrawFromPool';

const Container = styled.aside`
    float: right;
    position: sticky;
    right: 2%;
    top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: -26rem;
    min-width: 35rem;
    max-width: 48rem;
    z-index: 102;

    ${respondDown(Breakpoints.lg)`
         float: unset;
         position: relative;
         min-width: unset;
         width: calc(100% - 3.2rem);
         margin-top: 0;
         right: unset;
         margin: 1.6rem;
         box-shadow: unset;
         max-width: unset;
    `}
`;

const Card = styled.div`
    ${cardBoxShadow};
    background: ${COLORS.white};
    padding: 3.2rem;
    border-radius: 0.5rem;

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 1.6rem;
    `}
`;

const SidebarRow = styled.div`
    ${flexRowSpaceBetween};
    align-items: center;
    font-size: 1.4rem;
    line-height: 2rem;

    span {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        color: ${COLORS.paragraphText};
    }

    span:first-child {
        color: ${COLORS.grayText};
    }
`;

const WithdrawIconStyled = styled(WithdrawIcon)`
    margin-right: 0.8rem;

    path {
        stroke: ${COLORS.grayText};
    }
`;
const DepositIconStyled = styled(DepositIcon)`
    margin-right: 0.8rem;

    path {
        stroke: ${COLORS.white};
    }
`;

const UserShares = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: 2.4rem;
    gap: 1rem;
`;

const Buttons = styled.div`
    display: flex;
    gap: 1.6rem;

    Button {
        padding: unset;
    }
`;

const Sidebar = ({ pool }: { pool: PoolExtended }) => {
    const { isLogged, account } = useAuthStore();
    const [accountShare, setAccountShare] = useState(null);
    const [source, setSource] = useState(pool.assets[0]);
    const [destination, setDestination] = useState(pool.assets[1]);

    const changeSource = asset => {
        if (getAssetString(asset) === getAssetString(destination)) {
            setDestination(source);
        }
        setSource(asset);
    };

    const changeDestination = asset => {
        if (getAssetString(asset) === getAssetString(source)) {
            setSource(destination);
        }
        setDestination(asset);
    };

    useEffect(() => {
        if (!account) {
            setAccountShare(null);
            return;
        }
        SorobanService.getTokenBalance(pool.share_token_address, account.accountId()).then(res => {
            setAccountShare(res);
        });
    }, [account]);
    const openDepositModal = () => {
        if (!isLogged) {
            return ModalService.openModal(ChooseLoginMethodModal, {
                callback: () => ModalService.openModal(DepositToPool, { pool }, false, null, true),
            });
        }
        ModalService.openModal(DepositToPool, { pool }, false, null, true);
    };
    const openWithdrawModal = () => {
        if (!isLogged) {
            return ModalService.openModal(ChooseLoginMethodModal, {});
        }
        ModalService.openModal(WithdrawFromPool, { pool });
    };
    return (
        <Container>
            <Card>
                {isLogged && accountShare === null ? (
                    <PageLoader />
                ) : (
                    isLogged && (
                        <UserShares>
                            <SidebarRow>
                                <span>Pool shares:</span>
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
                                <SidebarRow key={getAssetString(asset)}>
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
                        </UserShares>
                    )
                )}

                <Buttons>
                    <Button
                        fullWidth
                        isBig
                        onClick={() => openDepositModal()}
                        disabled={pool.deposit_killed}
                    >
                        <DepositIconStyled />
                        Deposit
                    </Button>
                    <Button
                        fullWidth
                        isBig
                        secondary
                        onClick={() => openWithdrawModal()}
                        disabled={isLogged && Number(accountShare) === 0}
                    >
                        <WithdrawIconStyled />
                        Withdraw
                    </Button>
                </Buttons>
            </Card>
            <Card>
                <SwapForm
                    base={source}
                    setBase={changeSource}
                    counter={destination}
                    setCounter={changeDestination}
                    isEmbedded
                />
            </Card>
        </Container>
    );
};

export default Sidebar;
