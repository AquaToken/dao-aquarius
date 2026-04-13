import BigNumber from 'bignumber.js';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { getAssetsList } from 'api/amm';

import { POOL_TYPE } from 'constants/amm';

import { loadConcentratedUserPositions } from 'helpers/amm-concentrated-user-positions';
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

import AddLiquidityModal from '../AddLiquidity/AddLiquidityModal';
import ConcentratedWithdrawModal from '../ConcentratedLiquidity/modals/ConcentratedWithdrawModal/ConcentratedWithdrawModal';
import LiquidityDistributionChart from '../LiquidityDistributionChart/LiquidityDistributionChart';
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
        stroke: ${COLORS.white};
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

const DistributionCanvas = styled.div`
    width: 100%;
`;

const Sidebar = ({ pool }: { pool: PoolExtended }) => {
    const { isLogged, account } = useAuthStore();
    const [accountShare, setAccountShare] = useState(null);
    const [accountPooledAmounts, setAccountPooledAmounts] = useState<string[] | null>(null);
    const [source, setSource] = useState(pool.tokens[0]);
    const [destination, setDestination] = useState(pool.tokens[1]);
    const [assetsList, setAssetsList] = useState(getTokensFromCache());

    const { processNewAssets } = useAssetsStore();
    const isConcentrated = pool.pool_type === POOL_TYPE.concentrated;

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
            setAccountPooledAmounts(null);
            return;
        }

        if (isConcentrated) {
            loadConcentratedUserPositions(pool, account.accountId())
                .then(({ positions, rawLiquidity }) => {
                    if (!positions.length) {
                        setAccountShare(0);
                        setAccountPooledAmounts(pool.tokens.map(() => '0'));
                        return;
                    }

                    const pooledTotals = pool.tokens.map((_, index) =>
                        positions
                            .reduce(
                                (acc, position) => acc.plus(position.tokenEstimates[index] || '0'),
                                new BigNumber(0),
                            )
                            .toFixed(),
                    );

                    setAccountShare(
                        Number(contractValueToAmount(rawLiquidity, pool.share_token_decimals)),
                    );
                    setAccountPooledAmounts(pooledTotals);
                })
                .catch(() => {
                    setAccountShare(0);
                    setAccountPooledAmounts(pool.tokens.map(() => '0'));
                });
            return;
        }

        SorobanService.token
            .getTokenBalance(pool.share_token_address, account.accountId())
            .then(res => {
                setAccountShare(res);
                setAccountPooledAmounts(null);
            });
    }, [
        account,
        isConcentrated,
        pool.address,
        pool.share_token_address,
        pool.share_token_decimals,
        pool.tokens,
    ]);

    const pooledAmounts = useMemo(
        () =>
            pool.tokens.map((asset, index) => {
                if (isConcentrated) {
                    return Number(accountPooledAmounts?.[index] || '0');
                }

                if (!Number(pool.total_share)) {
                    return 0;
                }

                return +(
                    (Number(
                        contractValueToAmount(
                            pool.reserves[index],
                            (asset as SorobanToken).decimal,
                        ),
                    ) *
                        Number(accountShare || 0)) /
                    Number(contractValueToAmount(pool.total_share, pool.share_token_decimals))
                ).toFixed((asset as SorobanToken).decimal);
            }),
        [
            accountPooledAmounts,
            accountShare,
            isConcentrated,
            pool.reserves,
            pool.share_token_decimals,
            pool.tokens,
            pool.total_share,
        ],
    );

    const openDepositModal = () => {
        if (!isLogged) {
            return ModalService.openModal(ChooseLoginMethodModal, {
                callback: () =>
                    ModalService.openModal(AddLiquidityModal, { pool }, false, null, true),
            });
        }
        ModalService.openModal(AddLiquidityModal, { pool }, false, null, true);
    };
    const openWithdrawModal = () => {
        if (isConcentrated) {
            if (!isLogged) {
                return ModalService.openModal(ChooseLoginMethodModal, {
                    callback: () => ModalService.openModal(ConcentratedWithdrawModal, { pool }),
                });
            }
            ModalService.openModal(ConcentratedWithdrawModal, { pool });
            return;
        }

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
                            {isConcentrated && (
                                <DistributionCanvas>
                                    <LiquidityDistributionChart
                                        pool={pool}
                                        dataSource="user"
                                        compact
                                    />
                                </DistributionCanvas>
                            )}
                            <SidebarRow>
                                <span>Pool shares:</span>
                                <span>
                                    {formatBalance(
                                        accountShare,
                                        true,
                                        isConcentrated,
                                        pool.share_token_decimals,
                                    )}
                                </span>
                            </SidebarRow>
                            {pool.tokens.map((asset, index) => (
                                <SidebarRow key={getAssetString(asset)}>
                                    <span>Pooled {asset.code}:</span>
                                    <span>
                                        {formatBalance(
                                            pooledAmounts[index] || 0,
                                            false,
                                            false,
                                            asset.decimal,
                                        )}{' '}
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
                        disabled={!isConcentrated && pool.deposit_killed}
                    >
                        <DepositIconStyled />
                        Deposit
                    </Button>
                    <Button
                        fullWidth
                        isBig
                        onClick={() => openWithdrawModal()}
                        disabled={!isConcentrated && isLogged && Number(accountShare) === 0}
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
