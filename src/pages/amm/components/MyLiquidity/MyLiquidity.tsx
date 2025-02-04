import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { getUserPools } from 'api/amm';

import { MainRoutes } from 'constants/routes';

import { getAquaAssetData } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { useUpdateIndex } from 'hooks/useUpdateIndex';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import {
    ModalService,
    SorobanService,
    StellarService,
    ToastService,
} from 'services/globalServices';
import { POOL_TYPE } from 'services/soroban.service';
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';

import { PoolRewardsInfo, PoolUserProcessed } from 'types/amm';
import { Int128Parts } from 'types/stellar';

import { flexAllCenter, flexRowSpaceBetween, respondDown } from 'web/mixins';
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';
import { Breakpoints, COLORS } from 'web/styles';

import AquaLogo from 'assets/aqua-logo-small.svg';
import IconClaim from 'assets/icon-claim.svg';

import Button from 'basics/buttons/Button';
import Select from 'basics/inputs/Select';
import ToggleGroup from 'basics/inputs/ToggleGroup';
import { CircleLoader, DotsLoader } from 'basics/loaders';
import PageLoader from 'basics/loaders/PageLoader';
import Market from 'basics/Market';
import Table, { CellAlign } from 'basics/Table';

import NoTrustline from 'components/NoTrustline';

import ExpandedMenu from 'pages/amm/components/MyLiquidity/ExpandedMenu/ExpandedMenu';
import MigratePoolButton from 'pages/amm/components/PoolsList/MigratePoolButton/MigratePoolButton';
import { AnalyticsUrlParams, AnalyticsTabs } from 'pages/amm/pages/Analytics';
import { ProfileTabs, ProfileUrlParams } from 'pages/profile/Profile';
import { ExternalLinkStyled } from 'pages/profile/SdexRewards/SdexRewards';
import { Empty } from 'pages/profile/YourVotes/YourVotes';

const PoolsListBlock = styled.div<{ $onlyList: boolean }>`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.white};
    margin: 4.8rem auto 5rem;

    ${({ $onlyList }) =>
        !$onlyList &&
        `
        padding: 4.8rem;
        border-radius: 0.5rem;
        box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
        margin-top: 0;
    `}

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 1.6rem;
    `}
`;

const ListHeader = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 2rem;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
    `}
`;

const ListTitle = styled.h3`
    font-size: 3.6rem;
    line-height: 4.2rem;
    font-weight: 400;

    ${respondDown(Breakpoints.sm)`
        font-size: 2.8rem;
    `}
`;

const ListTotal = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;

    span:last-child {
        font-weight: 700;
    }
`;

const Section = styled.div`
    flex: 1 0 auto;
    ${flexAllCenter};
`;

const LoginButton = styled(Button)`
    margin-top: 1rem;
`;

const ToggleGroupStyled = styled(ToggleGroup)`
    width: fit-content;
    margin-bottom: 4rem;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const SelectStyled = styled(Select)`
    display: none;
    margin-bottom: 4rem;

    ${respondDown(Breakpoints.md)`
        display: flex;
    `}
`;

const Buttons = styled.div`
    display: flex;
    gap: 0.8rem;
`;

const RewardsWrap = styled.div`
    display: flex;
    background-color: ${COLORS.lightGray};
    padding: 3.2rem;
    border-radius: 0.5rem;
    margin-bottom: 3.2rem;
`;

const AquaLogoStyled = styled(AquaLogo)`
    height: 4.8rem;
    width: 4.8rem;
`;

const Rewards = styled.div`
    display: flex;
    align-items: center;
    gap: 2.4rem;
    width: 100%;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        gap: 2rem;
    `}
`;

const RewardsDescription = styled.div`
    display: flex;
    flex-direction: column;
    color: ${COLORS.grayText};
    font-size: 1.4rem;

    span:first-child {
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.paragraphText};
    }

    ${respondDown(Breakpoints.md)`
        text-align: center;
    `}
`;

const StyledButton = styled(Button)`
    margin-left: auto;

    ${respondDown(Breakpoints.md)`
        margin-left: 0;
    `}
`;

enum FilterValues {
    all = 'all',
    volatile = 'volatile',
    stable = 'stable',
    classic = 'classic',
}

enum UrlParams {
    filter = 'filter',
}

const FilterOptions = [
    { label: 'All', value: FilterValues.all },
    { label: 'Stable', value: FilterValues.stable },
    { label: 'Volatile', value: FilterValues.volatile },
    { label: 'Classic', value: FilterValues.classic },
];

interface MyLiquidityProps {
    setTotal?: (total: number) => void;
    onlyList?: boolean;
    backToAllPools?: () => void;
}

const CLAIM_ALL_ID = 'all';

const MyLiquidity = ({ setTotal, onlyList, backToAllPools }: MyLiquidityProps) => {
    const { account } = useAuthStore();

    const [pools, setPools] = useState<PoolUserProcessed[]>([]);
    const [classicPools, setClassicPools] = useState([]);
    const [userRewards, setUserRewards] = useState(new Map());
    const [rewardsSum, setRewardsSum] = useState(0);
    const [claimPendingId, setClaimPendingId] = useState(null);
    const [filter, setFilter] = useState(null);

    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        const params = new URLSearchParams(location.search);

        if (
            params.get(AnalyticsUrlParams.tab) !== AnalyticsTabs.my &&
            params.get(ProfileUrlParams.tab) !== ProfileTabs.liquidity
        ) {
            return;
        }
        const filterParam = params.get(UrlParams.filter);

        if (filterParam) {
            setFilter(filterParam as FilterValues);
        } else {
            params.append(UrlParams.filter, FilterValues.all);
            setFilter(FilterValues.all);
            history.replace({ search: params.toString() });
        }
    }, [location]);

    const setFilterValue = (value: FilterValues) => {
        const params = new URLSearchParams(location.search);
        params.set(UrlParams.filter, value);
        history.push({ search: params.toString() });
    };

    const updateIndex = useUpdateIndex(5000);

    const { aquaStellarAsset } = getAquaAssetData();

    const filteredPools = useMemo(() => {
        if (filter === FilterValues.classic) {
            return classicPools;
        }
        if (filter === FilterValues.volatile) {
            return pools.filter(({ pool_type }) => pool_type === POOL_TYPE.constant);
        }
        if (filter === FilterValues.stable) {
            return pools.filter(({ pool_type }) => pool_type === POOL_TYPE.stable);
        }
        return [...pools, ...classicPools];
    }, [classicPools, pools, filter]);

    const updateData = () => {
        if (account) {
            getUserPools(account.accountId()).then(res => {
                setPools(res);
            });

            account?.getClassicPools().then(res => {
                setClassicPools(res);
            });
        }
    };

    useEffect(() => {
        if (!account || !pools) {
            setUserRewards(new Map());
            return;
        }
        Promise.all(
            pools.map(({ address }) => SorobanService.getPoolRewards(account.accountId(), address)),
        ).then(res => {
            const map = new Map<string, PoolRewardsInfo>();
            let sum = 0;

            res.forEach((reward, index) => {
                map.set(pools[index].address, reward);
                sum += Number(reward.to_claim);
            });
            setUserRewards(map);
            setRewardsSum(sum);
        });
    }, [pools, account, updateIndex]);

    useEffect(() => {
        updateData();
    }, [account, updateIndex]);

    const totalLiquidity = useMemo(() => {
        const totalXlm = [...pools, ...classicPools].reduce((acc, pool) => {
            const balance = Number(pool.balance) / 1e7;
            const liquidity = Number(pool.liquidity) / 1e7;
            const totalShare = Number(pool.total_share) / 1e7;

            acc += (balance / totalShare) * liquidity;
            return acc;
        }, 0);

        const totalUsd = totalXlm * StellarService.priceLumenUsd;

        if (setTotal) {
            setTotal(totalUsd);
        }
        return totalUsd;
    }, [pools, classicPools]);

    const claim = (poolId: string) => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        setClaimPendingId(poolId);

        SorobanService.getClaimRewardsTx(account.accountId(), poolId)
            .then(tx => account.signAndSubmitTx(tx, true))
            .then((res: { status?: BuildSignAndSubmitStatuses; value: () => Int128Parts }) => {
                if (!res) {
                    return;
                }

                if (
                    (res as { status: BuildSignAndSubmitStatuses }).status ===
                    BuildSignAndSubmitStatuses.pending
                ) {
                    ToastService.showSuccessToast('More signatures required to complete');
                    return;
                }
                const value = SorobanService.i128ToInt(res.value());

                ToastService.showSuccessToast(`Claimed ${formatBalance(+value)} AQUA`);
                setClaimPendingId(null);
            })
            .catch(err => {
                ToastService.showErrorToast(err.message ?? err.toString());
                setClaimPendingId(null);
            });
    };

    const claimAll = () => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        setClaimPendingId(CLAIM_ALL_ID);

        const poolsToClaim = [];

        userRewards.forEach((value, key) => {
            if (Number(value.to_claim)) {
                poolsToClaim.push(key);
            }
        });

        SorobanService.getClaimBatchTx(account.accountId(), poolsToClaim)
            .then(tx => account.signAndSubmitTx(tx, true))
            .then((res: { status?: BuildSignAndSubmitStatuses; value: () => Int128Parts }) => {
                if (!res) {
                    return;
                }

                if (
                    (res as { status: BuildSignAndSubmitStatuses }).status ===
                    BuildSignAndSubmitStatuses.pending
                ) {
                    ToastService.showSuccessToast('More signatures required to complete');
                    return;
                }

                ToastService.showSuccessToast('Claimed successfully');
                setClaimPendingId(null);
            })
            .catch(err => {
                ToastService.showErrorToast(err.message ?? err.toString());
                setClaimPendingId(null);
            });
    };

    console.log(pools, userRewards);

    if (!account) {
        return (
            <Section>
                <Empty>
                    <h3>Log in required.</h3>
                    <span>To use you need to log in.</span>

                    <LoginButton onClick={() => ModalService.openModal(ChooseLoginMethodModal, {})}>
                        Log in
                    </LoginButton>
                </Empty>
            </Section>
        );
    }

    return (
        <PoolsListBlock $onlyList={onlyList}>
            {!onlyList && (
                <ListHeader>
                    <ListTitle>My liquidity positions</ListTitle>
                    <ListTotal>
                        <span>Total: </span>
                        <span>${formatBalance(totalLiquidity, true)}</span>
                    </ListTotal>
                </ListHeader>
            )}
            <ToggleGroupStyled value={filter} options={FilterOptions} onChange={setFilterValue} />
            <SelectStyled value={filter} options={FilterOptions} onChange={setFilterValue} />

            {Boolean(rewardsSum) && (
                <RewardsWrap>
                    <Rewards>
                        <AquaLogoStyled />
                        <RewardsDescription>
                            <span>You have unclaimed rewards</span>
                            <span>for {formatBalance(rewardsSum)} AQUA</span>
                        </RewardsDescription>
                        <StyledButton
                            disabled={Boolean(claimPendingId) && claimPendingId !== CLAIM_ALL_ID}
                            onClick={() => claimAll()}
                            pending={claimPendingId === CLAIM_ALL_ID}
                        >
                            Claim rewards
                        </StyledButton>
                    </Rewards>

                    <NoTrustline asset={aquaStellarAsset} />
                </RewardsWrap>
            )}
            {!filteredPools ? (
                <PageLoader />
            ) : filteredPools.length ? (
                <Table
                    mobileBreakpoint={Breakpoints.lg}
                    head={[
                        {
                            children: 'Pool',
                            flexSize: 3,
                        },
                        { children: 'Base APY' },
                        { children: 'Rewards APY' },
                        { children: 'Daily rewards' },
                        { children: 'Rewards to claim', align: CellAlign.Right },
                        { children: 'Boost', align: CellAlign.Right },
                        { children: 'New boost', align: CellAlign.Right },
                        { children: '' },
                    ]}
                    body={filteredPools.map(pool => ({
                        key: pool.address || pool.id,
                        rowItems: [
                            {
                                children: (
                                    <Market
                                        assets={pool.assets}
                                        mobileVerticalDirections
                                        withoutLink
                                        poolType={pool.pool_type as POOL_TYPE}
                                        isRewardsOn={Boolean(Number(pool.reward_tps))}
                                        poolAddress={pool.address}
                                    />
                                ),
                                flexSize: 3,
                            },
                            {
                                children: pool.apy
                                    ? `${formatBalance(+(pool.apy * 100).toFixed(2), true)}%`
                                    : '-',
                                label: 'Base APY',
                            },
                            {
                                children: pool.rewards_apy
                                    ? `${formatBalance(
                                          +(pool.rewards_apy * 100).toFixed(2),
                                          true,
                                      )}%`
                                    : '-',
                                label: 'Rewards APY',
                            },
                            {
                                children: `${formatBalance(
                                    (+(pool.reward_tps ?? 0) / 1e7) * 60 * 60 * 24,
                                    true,
                                )} AQUA`,
                                label: 'Daily rewards',
                            },
                            {
                                children: userRewards.get(pool.address) ? (
                                    `${formatBalance(
                                        userRewards.get(pool.address)?.to_claim || 0,
                                        true,
                                    )} AQUA`
                                ) : (
                                    <DotsLoader />
                                ),
                                label: 'Rewards to claim',
                                align: CellAlign.Right,
                            },
                            {
                                children: userRewards.get(pool.address) ? (
                                    formatBalance(
                                        userRewards.get(pool.address)?.working_balance /
                                            (pool.balance / 1e7),
                                        true,
                                    )
                                ) : (
                                    <DotsLoader />
                                ),
                                label: 'Boost',
                                align: CellAlign.Right,
                            },
                            {
                                children: userRewards.get(pool.address) ? (
                                    formatBalance(
                                        userRewards.get(pool.address)?.new_working_balance /
                                            (pool.balance / 1e7),
                                        true,
                                    )
                                ) : (
                                    <DotsLoader />
                                ),
                                label: 'New boost',
                                align: CellAlign.Right,
                            },
                            {
                                children: (
                                    <Buttons>
                                        {pool.address ? (
                                            <Button
                                                isSquare
                                                pending={pool.address === claimPendingId}
                                                disabled={
                                                    (pool.address !== claimPendingId &&
                                                        Boolean(claimPendingId)) ||
                                                    !Number(userRewards.get(pool.address)?.to_claim)
                                                }
                                                onClick={() => claim(pool.address)}
                                                title="Claim rewards"
                                            >
                                                {pool.address === claimPendingId ? (
                                                    <CircleLoader isWhite size="small" />
                                                ) : (
                                                    <IconClaim />
                                                )}
                                            </Button>
                                        ) : (
                                            <MigratePoolButton
                                                isSmall
                                                pool={pool}
                                                onUpdate={() => {}}
                                            />
                                        )}
                                        <ExpandedMenu pool={pool} />
                                    </Buttons>
                                ),
                                align: CellAlign.Right,
                            },
                        ],
                    }))}
                />
            ) : (
                <Section>
                    <Empty>
                        <h3>There's nothing here.</h3>
                        <span>It looks like you don’t have any active liquidity positions.</span>

                        <ExternalLinkStyled asDiv>
                            <Link
                                to={MainRoutes.amm}
                                onClick={() => {
                                    if (backToAllPools) {
                                        backToAllPools();
                                    }
                                }}
                            >
                                Browse pools
                            </Link>
                        </ExternalLinkStyled>
                    </Empty>
                </Section>
            )}
        </PoolsListBlock>
    );
};

export default MyLiquidity;
