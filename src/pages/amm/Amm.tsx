import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { commonMaxWidth, respondDown } from '../../common/mixins';
import { Header, InOffers, Section, Title } from '../profile/AmmRewards/AmmRewards';
import PageLoader from '../../common/basics/PageLoader';
import { ModalService, SorobanService, ToastService } from '../../common/services/globalServices';
import Pair from '../vote/components/common/Pair';
import { formatBalance } from '../../common/helpers/helpers';
import useAuthStore from '../../store/authStore/useAuthStore';
import * as StellarSdk from '@stellar/stellar-sdk';
import BalancesBlock from './BalancesBlock/BalancesBlock';
import AssetDropdown from '../vote/components/AssetDropdown/AssetDropdown';
import { Breakpoints, COLORS } from '../../common/styles';
import Button from '../../common/basics/Button';
import DepositToPool from './DepositToPool/DepositToPool';
import { CONTRACT_STATUS } from '../../common/services/soroban.service';
import Plus from '../../common/assets/img/icon-plus.svg';
import InfoIcon from '../../common/assets/img/icon-info.svg';
import CreatePool from './CreatePool/CreatePool';
import Table from '../../common/basics/Table';
import { useUpdateIndex } from '../../common/hooks/useUpdateIndex';
import WithdrawFromPool from './WithdrawFromPool/WithdrawFromPool';
import Tooltip, { TOOLTIP_POSITION } from '../../common/basics/Tooltip';

const Container = styled.main`
    height: 100%;
    position: relative;
    display: flex;
    flex: 1 0 auto;
    flex-direction: column;
    scroll-behavior: smooth;
    overflow: auto;
`;

const Content = styled.div`
    ${commonMaxWidth};
    width: 100%;
    padding: 6.3rem 4rem 0;
`;

const PairSearch = styled.div`
    height: 17rem;
    width: 100%;
    background: ${COLORS.white};
    box-shadow: 0 20px 30px rgba(0, 6, 54, 0.06);
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4.8rem;
    box-sizing: border-box;
    gap: 5rem;

    ${respondDown(Breakpoints.md)`
        margin-top: 3rem;
        flex-direction: column;
        box-shadow: unset;
        padding: 0;
        margin-bottom: 8rem; 
        background: ${COLORS.transparent};
    `}
`;

const ButtonCell = styled.div`
    flex: 2.5;
    gap: 1rem;
    display: flex;
    align-items: flex-end;
`;

const TooltipInner = styled.div`
    display: flex;
    flex-direction: column;
`;

const PlusIcon = styled(Plus)`
    width: 1.6rem;
    height: 1.6rem;
    margin-left: 1rem;
`;

const CellA = styled.div`
    display: flex;
    gap: 0.5rem;
    align-items: center;
`;

export const USDT = new StellarSdk.Asset(
    'USDT',
    'GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER',
);
export const USDC = new StellarSdk.Asset(
    'USDC',
    'GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER',
);
export const AQUA = new StellarSdk.Asset(
    'AQUA',
    'GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER',
);

const Amm = ({ balances }) => {
    const { account, isLogged } = useAuthStore();

    const [base, setBase] = useState(USDT);
    const [counter, setCounter] = useState(USDC);
    const [pools, setPools] = useState(null);
    const [poolsData, setPoolsData] = useState(null);
    const [userRewards, setUserRewards] = useState(null);

    const [claimPendingId, setClaimPendingId] = useState(null);

    useEffect(() => {
        getPools();
    }, [isLogged, base, counter]);

    useEffect(() => {
        getData();
    }, [pools]);

    const getPools = useCallback(() => {
        setPools(null);
        setPoolsData(null);
        setUserRewards(null);
        if (isLogged) {
            SorobanService.getPools(account?.accountId(), base, counter).then((res) => {
                setPools(res);
            });
        }
    }, [isLogged, base, counter]);

    const getData = useCallback(() => {
        if (!pools) {
            return;
        }

        if (!pools.length) {
            setPoolsData([]);
            return;
        }

        Promise.all(
            pools.map((pool) =>
                SorobanService.getPoolData(account?.accountId(), base, counter, pool),
            ),
        ).then((res) => {
            setPoolsData(res);
        });
    }, [pools]);

    const openCreatePoolModal = () => {
        ModalService.openModal(CreatePool, { base, counter }).then(({ isConfirmed }) => {
            if (isConfirmed) {
                getPools();
            }
        });
    };

    const openDepositModal = (poolId) => {
        ModalService.openModal(DepositToPool, { base, counter, poolId }).then(({ isConfirmed }) => {
            if (isConfirmed) {
                getData();
            }
        });
    };

    const openWithdrawModal = (poolId, share, shareId) => {
        ModalService.openModal(WithdrawFromPool, { base, counter, poolId, share, shareId }).then(
            ({ isConfirmed }) => {
                if (isConfirmed) {
                    getData();
                }
            },
        );
    };

    const claim = (poolId) => {
        setClaimPendingId(poolId);
        SorobanService.claimRewards(account.accountId(), poolId)
            .then((tx) => account.signAndSubmitTx(tx, true))
            .then((res) => {
                const value = SorobanService.i128ToInt(res.value());

                ToastService.showSuccessToast(`Claimed ${formatBalance(value)} AQUA`);

                setClaimPendingId(null);
            });
    };

    const updateIndex = useUpdateIndex(5000);

    useEffect(() => {
        if (!poolsData || !poolsData.length) {
            return;
        }

        const poolsWithRewards = poolsData.filter(({ rewardsData }) => Boolean(rewardsData.tps));

        Promise.all(
            poolsWithRewards.map(({ id }) =>
                SorobanService.getUserRewardsAmount(account.accountId(), id).then((res) => [
                    id,
                    res,
                ]),
            ),
        ).then((res) => {
            setUserRewards(new Map(res));
        });
    }, [poolsData, updateIndex]);

    const assets = useMemo(() => {
        return balances
            ?.filter(({ status }) => status === CONTRACT_STATUS.ACTIVE)
            .map(({ asset }) => asset);
    }, [balances]);

    if (!account || !assets) {
        return <PageLoader />;
    }

    return (
        <Container>
            <Content>
                <BalancesBlock balances={balances} />
                <Header>
                    <Title>Pools</Title>
                    <Button onClick={() => openCreatePoolModal()}>
                        create pool <PlusIcon />
                    </Button>
                </Header>
                <Header>
                    <PairSearch>
                        <AssetDropdown
                            asset={base}
                            onUpdate={setBase}
                            assetsList={assets}
                            exclude={counter}
                            withoutReset
                        />
                        <AssetDropdown
                            asset={counter}
                            onUpdate={setCounter}
                            assetsList={assets}
                            exclude={base}
                            withoutReset
                        />
                    </PairSearch>
                </Header>
                <Section>
                    {!poolsData ? (
                        <PageLoader />
                    ) : poolsData.length ? (
                        <Table
                            head={[
                                { children: 'Pair', flexSize: 2 },
                                { children: 'Fee', flexSize: 0.5 },
                                { children: 'Slippage', flexSize: 0.5 },
                                { children: 'Total locked in pool' },
                                { children: 'Total daily rewards' },
                                { children: 'Account shares' },
                                { children: 'Amount to claim' },
                            ]}
                            body={poolsData.map(
                                ({
                                    id,
                                    base: baseAsset,
                                    counter: counterAsset,
                                    baseAmount,
                                    counterAmount,
                                    share,
                                    rewardsData,
                                    shareId,
                                    info,
                                }) => ({
                                    key: id,
                                    rowItems: [
                                        {
                                            children: (
                                                <Pair
                                                    base={baseAsset}
                                                    counter={counterAsset}
                                                    withoutLink
                                                    mobileVerticalDirections
                                                    customLabel={[info.pool_type, '']}
                                                />
                                            ),
                                            flexSize: 2,
                                        },
                                        { children: `${info.fee / 100} %`, flexSize: 0.5 },
                                        {
                                            children: info.a ? (
                                                <CellA>
                                                    <span>{info.a}</span>
                                                    <Tooltip
                                                        content={
                                                            <TooltipInner>
                                                                <b>Slippage Tolerance Level:</b>
                                                                <span>
                                                                    “A” = 1-1000 -{'>'} very low
                                                                </span>
                                                                <span>
                                                                    “A” = 1001 - 2000 -{'>'} low
                                                                </span>
                                                                <span>
                                                                    “A” = 2001 - 3000 -{'>'} medium
                                                                </span>
                                                                <span>
                                                                    “A” = 3001 - 4000 -{'>'} high
                                                                </span>
                                                                <span>
                                                                    “A” = 4001 - 5000 -{'>'} very
                                                                    high
                                                                </span>
                                                            </TooltipInner>
                                                        }
                                                        position={TOOLTIP_POSITION.top}
                                                        showOnHover
                                                    >
                                                        <InfoIcon />
                                                    </Tooltip>
                                                </CellA>
                                            ) : (
                                                '-'
                                            ),
                                            flexSize: 0.5,
                                        },
                                        {
                                            children: (
                                                <InOffers>
                                                    <div>
                                                        {formatBalance(baseAmount, true)}{' '}
                                                        {baseAsset.code}
                                                    </div>
                                                    <div>
                                                        {formatBalance(counterAmount, true)}{' '}
                                                        {counterAsset.code}
                                                    </div>
                                                </InOffers>
                                            ),
                                        },
                                        {
                                            children: rewardsData.tps
                                                ? `${formatBalance(
                                                      rewardsData.tps * 60 * 60 * 24,
                                                      true,
                                                  )} AQUA`
                                                : '-',
                                        },
                                        { children: share ? formatBalance(share) : '-' },
                                        {
                                            children:
                                                userRewards &&
                                                userRewards.has(id) &&
                                                Boolean(userRewards.get(id))
                                                    ? `${formatBalance(
                                                          userRewards.get(id),
                                                          true,
                                                      )} AQUA`
                                                    : '-',
                                        },
                                    ],
                                    afterRow: (
                                        <ButtonCell>
                                            <Button
                                                onClick={() => openDepositModal(id)}
                                                disabled={
                                                    !account.getAssetBalance(base) ||
                                                    !account.getAssetBalance(counter)
                                                }
                                                isSmall
                                            >
                                                deposit
                                            </Button>
                                            <Button
                                                disabled={!share}
                                                onClick={() =>
                                                    openWithdrawModal(id, share, shareId)
                                                }
                                                isSmall
                                            >
                                                withdraw
                                            </Button>
                                            <Button
                                                disabled={
                                                    !userRewards ||
                                                    !userRewards.has(id) ||
                                                    !userRewards.get(id) ||
                                                    (Boolean(claimPendingId) &&
                                                        claimPendingId !== id)
                                                }
                                                onClick={() => claim(id)}
                                                isSmall
                                                pending={claimPendingId === id}
                                            >
                                                claim
                                            </Button>
                                        </ButtonCell>
                                    ),
                                }),
                            )}
                        />
                    ) : (
                        <h3>There's nothing here.</h3>
                    )}
                </Section>
            </Content>
        </Container>
    );
};

export default Amm;
