import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getAssetsList } from 'api/amm';

import { contractValueToAmount } from 'helpers/amount';
import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';
import { getTokensFromCache } from 'helpers/token';

import useAssetsStore from 'store/assetsStore/useAssetsStore';
import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, SorobanService } from 'services/globalServices';

import { PoolExtended } from 'types/amm';
import { SorobanToken } from 'types/token';

import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';

import DepositIcon from 'assets/icons/actions/icon-deposit-16.svg';
import WithdrawIcon from 'assets/icons/actions/icon-withdraw-16.svg';

import Asset from 'basics/Asset';
import Button from 'basics/buttons/Button';
import PageLoader from 'basics/loaders/PageLoader';

import { cardBoxShadow, flexRowSpaceBetween, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

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
        color: ${COLORS.textTertiary};
    }

    span:first-child {
        color: ${COLORS.textGray};
    }
`;

const WithdrawIconStyled = styled(WithdrawIcon)`
    margin-right: 0.8rem;

    path {
        stroke: ${COLORS.textGray};
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
    const [source, setSource] = useState(pool.tokens[0]);
    const [destination, setDestination] = useState(pool.tokens[1]);
    const [assetsList, setAssetsList] = useState(getTokensFromCache());

    const { processNewAssets } = useAssetsStore();

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
        getAssetsList().then(res => {
            processNewAssets(res);
            setAssetsList(res);
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
                            {pool.tokens.map((asset, index) => (
                                <SidebarRow key={getAssetString(asset)}>
                                    <span>Pooled {asset.code}:</span>
                                    <span>
                                        {Number(pool.total_share)
                                            ? formatBalance(
                                                  +(
                                                      (Number(
                                                          contractValueToAmount(
                                                              pool.reserves[index],
                                                              (pool.tokens[index] as SorobanToken)
                                                                  .decimal,
                                                          ),
                                                      ) *
                                                          accountShare) /
                                                      (Number(pool.total_share) /
                                                          Math.pow(10, pool.share_token_decimals))
                                                  ).toFixed(
                                                      (pool.tokens[index] as SorobanToken)
                                                          .decimal ?? 7,
                                                  ),
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
                    assetsList={assetsList}
                    isEmbedded
                />
            </Card>
        </Container>
    );
};

export default Sidebar;
