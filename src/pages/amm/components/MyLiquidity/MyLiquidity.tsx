import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { getUserPools } from 'api/amm';

import { POOL_TYPE } from 'constants/amm';
import { MainRoutes } from 'constants/routes';

import { apyValueToDisplay, contractValueToAmount } from 'helpers/amount';
import { getAssetString } from 'helpers/assets';
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
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';

import { PoolIncentives, PoolRewardsInfo, PoolUserProcessed, RewardType } from 'types/amm';
import { SorobanToken, Token } from 'types/token';

import {
    flexAllCenter,
    flexColumn,
    flexRowSpaceBetween,
    respondDown,
    textEllipsis,
} from 'web/mixins';
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';
import { Breakpoints, COLORS } from 'web/styles';

import IconClaim from 'assets/icon-claim.svg';
import Info from 'assets/icon-info.svg';
import ArrowRightIcon from 'assets/icon-link-arrow.svg';

import ApyBoosted from 'basics/ApyBoosted';
import AssetLogo from 'basics/AssetLogo';
import Button from 'basics/buttons/Button';
import Select from 'basics/inputs/Select';
import ToggleGroup from 'basics/inputs/ToggleGroup';
import { CircleLoader } from 'basics/loaders';
import PageLoader from 'basics/loaders/PageLoader';
import Market from 'basics/Market';
import Table, { CellAlign } from 'basics/Table';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import ExpandedMenu from 'pages/amm/components/MyLiquidity/ExpandedMenu/ExpandedMenu';
import PoolApyTooltip from 'pages/amm/components/PoolApyTooltip/PoolApyTooltip';
import MigratePoolButton from 'pages/amm/components/PoolsList/MigratePoolButton/MigratePoolButton';
import RewardsBanner from 'pages/amm/components/RewardsBanner/RewardsBanner';
import { AnalyticsTabs, AnalyticsUrlParams } from 'pages/amm/pages/Analytics';
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
        padding: 3.2rem 0;
        background-color: ${COLORS.lightGray};
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

const SelectWrapper = styled.div`
    display: none;

    ${respondDown(Breakpoints.md)`
        display: flex;
        padding: 0 1.6rem;
    `}
`;

const SelectStyled = styled(Select)`
    margin-bottom: 4rem;

    ${respondDown(Breakpoints.md)`
        display: flex;
    `}
`;

const Buttons = styled.div`
    display: flex;
    gap: 0.8rem;
`;

const Pooled = styled.div`
    display: flex;
    gap: 0.8rem;
    align-items: center;
`;

const TooltipInner = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    max-width: calc(100vw - 12rem);
`;

const TooltipRow = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 1.4rem;
    line-height: 2rem;
    gap: 2rem;

    span:first-child {
        color: ${COLORS.grayText};
        width: 60%;
        ${textEllipsis};
    }

    span:last-child {
        color: ${COLORS.paragraphText};
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }
`;

const IconInfoStyled = styled(Info)`
    cursor: help;
`;

const ArrowRight = styled(ArrowRightIcon)`
    path {
        fill: ${COLORS.darkBlue};
    }
`;

const RewardsApy = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

const WithTooltip = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

const IncentivesValues = styled.div`
    ${flexColumn};
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

const MyLiquidity = ({ setTotal, onlyList, backToAllPools }: MyLiquidityProps) => {
    const { account } = useAuthStore();

    const [pools, setPools] = useState<PoolUserProcessed[]>([]);
    const [classicPools, setClassicPools] = useState([]);
    const [userRewards, setUserRewards] = useState<Map<string, PoolRewardsInfo>>(new Map());
    const [userIncentives, setUserIncentives] = useState<Map<string, PoolIncentives[]>>(new Map());
    const [isUserRewardsLoaded, setIsUserRewardsLoaded] = useState(false);
    const [rewardsSum, setRewardsSum] = useState(0);
    const [incentivesSum, setIncentivesSum] = useState(new Map());
    const [isUserIncentivesLoaded, setIsUserIncentivesLoaded] = useState(false);
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
        if (!account || !pools || !pools.length) {
            setUserRewards(new Map());
            return;
        }
        Promise.all(
            pools.map(({ address }) =>
                SorobanService.amm.getPoolRewards(account.accountId(), address),
            ),
        ).then(res => {
            const map = new Map<string, PoolRewardsInfo>();
            let sum = 0;

            res.forEach((reward, index) => {
                sum += Number(reward.to_claim);
                if (Number(reward.to_claim)) {
                    map.set(pools[index].address, reward);
                }
            });
            setUserRewards(map);
            setRewardsSum(sum);
            setIsUserRewardsLoaded(true);
        });
    }, [pools, account, updateIndex]);

    useEffect(() => {
        if (!account || !pools || !pools.length) {
            setUserIncentives(new Map());
            return;
        }
        Promise.all(
            pools.map(({ address }) =>
                SorobanService.amm.getPoolIncentives(account.accountId(), address),
            ),
        ).then(res => {
            const map = new Map<string, PoolIncentives[]>();
            const sum = new Map<Token, number>();

            res.forEach((incentives, index) => {
                if (incentives) {
                    map.set(pools[index].address, incentives);
                }

                incentives.forEach(incentive => {
                    const sameToken = [...sum.keys()].find(
                        ({ contract }) => contract === incentive.token.contract,
                    );
                    if (sameToken) {
                        sum.set(sameToken, sum.get(sameToken) + Number(incentive.info.user_reward));
                    } else {
                        sum.set(incentive.token, Number(incentive.info.user_reward));
                    }
                });
            });

            setUserIncentives(map);
            setIncentivesSum(sum);
            setIsUserIncentivesLoaded(true);
        });
    }, [pools, account, updateIndex]);

    useEffect(() => {
        updateData();
    }, [account, updateIndex]);

    const { totalLiquidity, poolsLiquidity } = useMemo(() => {
        const map = new Map<string, number>();
        const totalSorobanUsd = pools.reduce((acc, pool) => {
            const balance = Number(pool.balance) / 1e7;
            const liquidity = Number(pool.liquidity_usd) / 1e7;
            const totalShare = Number(pool.total_share) / 1e7;

            map.set(pool.address, (balance / totalShare) * liquidity);
            acc += (balance / totalShare) * liquidity;
            return acc;
        }, 0);

        const totalClassicXlm = classicPools.reduce((acc, pool) => {
            const balance = Number(pool.balance) / 1e7;
            const liquidity = Number(pool.liquidity) / 1e7;
            const totalShare = Number(pool.total_share) / 1e7;

            map.set(pool.id, (balance / totalShare) * liquidity * StellarService.priceLumenUsd);

            acc += (balance / totalShare) * liquidity;
            return acc;
        }, 0);

        const totalClassicUsd = totalClassicXlm * StellarService.priceLumenUsd;
        const total = totalClassicUsd + totalSorobanUsd;

        if (setTotal) {
            setTotal(total);
        }
        return { totalLiquidity: total, poolsLiquidity: map };
    }, [pools, classicPools]);

    const claim = (poolId: string) => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        setClaimPendingId(poolId);

        const poolsAndTypes = [];

        if (userRewards.get(poolId)?.to_claim) {
            poolsAndTypes.push(`${RewardType.aquaReward}-${poolId}`);
        }

        if (userIncentives.get(poolId)?.some(({ info }) => !!Number(info.user_reward))) {
            poolsAndTypes.push(`${RewardType.incentive}-${poolId}`);
        }

        SorobanService.amm
            .getClaimBatchTx(account.accountId(), poolsAndTypes)
            .then(tx => account.signAndSubmitTx(tx, true))
            .then((res: { status?: BuildSignAndSubmitStatuses }) => {
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

                ToastService.showSuccessToast(`Claimed successfully.`);
                setClaimPendingId(null);
            })
            .catch(err => {
                ToastService.showErrorToast(err.message ?? err.toString());
                setClaimPendingId(null);
            });
    };

    const calculateBoostValue = (rewardsInfo: PoolRewardsInfo, userBalance: string) => {
        if (!rewardsInfo) return 1;
        const tps = +rewardsInfo.tps;
        const wSupply = +rewardsInfo.working_supply;
        const wBalance = +rewardsInfo.working_balance;

        if (!tps || !wSupply || !wBalance) return 1;

        const tpsWithoutBoost = ((+userBalance / 1e7) * tps) / wSupply;
        const expectedTps = (tps * wBalance) / wSupply;

        if (tpsWithoutBoost === 0) return 1;

        return expectedTps / tpsWithoutBoost;
    };

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

            <SelectWrapper>
                <SelectStyled value={filter} options={FilterOptions} onChange={setFilterValue} />
            </SelectWrapper>

            {isUserRewardsLoaded && isUserIncentivesLoaded && (
                <RewardsBanner
                    rewardsSum={rewardsSum}
                    userRewardsCount={userRewards.size}
                    incentivesSum={incentivesSum}
                    userIncentivesCount={userIncentives.size}
                />
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
                        { children: 'Pooled', align: CellAlign.Right },

                        {
                            children: 'Rewards to claim',
                            align: CellAlign.Right,
                            mobileStyle: { textAlign: 'right' },
                        },
                        {
                            children: 'Incentives to claim',
                            align: CellAlign.Right,
                            mobileStyle: { textAlign: 'right' },
                        },
                        { children: 'Total APY', align: CellAlign.Right, flexSize: 2 },
                        { children: '' },
                    ]}
                    body={filteredPools.map(pool => {
                        const boostValue = calculateBoostValue(
                            userRewards.get(pool.address),
                            pool.balance,
                        );
                        const poolRewardsData = userRewards.get(pool.address);

                        const userRewardsValue = poolRewardsData
                            ? (+poolRewardsData.tps *
                                  60 *
                                  60 *
                                  24 *
                                  +poolRewardsData.working_balance) /
                              +poolRewardsData.working_supply
                            : 0;

                        const incentivesForPool = userIncentives.get(pool.address);

                        return {
                            key: pool.address || pool.id,
                            rowItems: [
                                {
                                    children: (
                                        <Market
                                            assets={pool.tokens}
                                            mobileVerticalDirections
                                            withoutLink
                                            poolType={pool.pool_type as POOL_TYPE}
                                            isRewardsOn={Boolean(Number(pool.reward_tps))}
                                            poolAddress={pool.address}
                                            fee={pool.fee}
                                        />
                                    ),
                                    flexSize: 3,
                                },
                                {
                                    children: poolsLiquidity.has(pool.address || pool.id) ? (
                                        <Pooled>
                                            <span>
                                                $
                                                {formatBalance(
                                                    poolsLiquidity.get(pool.address || pool.id),
                                                    true,
                                                )}
                                            </span>
                                            <Tooltip
                                                content={
                                                    <TooltipInner>
                                                        {pool.tokens.map((asset, index) => (
                                                            <TooltipRow key={getAssetString(asset)}>
                                                                <span>Pooled {asset.code}</span>
                                                                <span>
                                                                    {formatBalance(
                                                                        (+contractValueToAmount(
                                                                            pool.reserves[index],
                                                                            (
                                                                                pool.tokens[
                                                                                    index
                                                                                ] as SorobanToken
                                                                            ).decimal,
                                                                        ) *
                                                                            pool.balance) /
                                                                            pool.total_share,
                                                                        true,
                                                                    )}
                                                                    <AssetLogo
                                                                        asset={asset}
                                                                        isSmall
                                                                        isCircle
                                                                    />
                                                                </span>
                                                            </TooltipRow>
                                                        ))}
                                                        <TooltipRow>
                                                            <span>Shares</span>
                                                            <span>
                                                                {formatBalance(
                                                                    pool.balance / 1e7,
                                                                    true,
                                                                )}{' '}
                                                                (
                                                                {+(
                                                                    (100 * pool.balance) /
                                                                    Number(pool.total_share)
                                                                ) > 0.01
                                                                    ? formatBalance(
                                                                          +(
                                                                              (100 * pool.balance) /
                                                                              Number(
                                                                                  pool.total_share,
                                                                              )
                                                                          ).toFixed(2),
                                                                          true,
                                                                      )
                                                                    : '< 0.01'}
                                                                %)
                                                            </span>
                                                        </TooltipRow>
                                                    </TooltipInner>
                                                }
                                                position={
                                                    +window.innerWidth > 1200
                                                        ? TOOLTIP_POSITION.top
                                                        : TOOLTIP_POSITION.left
                                                }
                                                background={COLORS.white}
                                                showOnHover
                                            >
                                                <IconInfoStyled />
                                            </Tooltip>
                                        </Pooled>
                                    ) : (
                                        '-'
                                    ),
                                    label: 'Pooled',
                                    align: CellAlign.Right,
                                },
                                {
                                    children: `${formatBalance(
                                        Number(userRewards.get(pool.address)?.to_claim) || 0,
                                        true,
                                        true,
                                    )} AQUA`,
                                    label: 'Rewards to claim',
                                    align: CellAlign.Right,
                                    mobileStyle: { textAlign: 'right' },
                                },
                                {
                                    children: incentivesForPool?.length ? (
                                        <IncentivesValues>
                                            {incentivesForPool
                                                .filter(
                                                    incentive =>
                                                        !!Number(incentive.info.user_reward),
                                                )
                                                .map(incentive => (
                                                    <span key={incentive.token.contract}>
                                                        {formatBalance(
                                                            +incentive.info.user_reward,
                                                            true,
                                                            true,
                                                        )}{' '}
                                                        {incentive.token.code}
                                                    </span>
                                                ))}
                                        </IncentivesValues>
                                    ) : (
                                        '-'
                                    ),
                                    label: 'Incentives to claim',
                                    align: CellAlign.Right,
                                    mobileStyle: { textAlign: 'right' },
                                },
                                {
                                    children: (
                                        <RewardsApy>
                                            <WithTooltip>
                                                {apyValueToDisplay(pool.total_apy)}
                                            </WithTooltip>

                                            {Boolean(Number(pool.rewards_apy)) &&
                                                boostValue !== 1 && (
                                                    <>
                                                        <ArrowRight />

                                                        <ApyBoosted
                                                            value={
                                                                Number(pool.rewards_apy) *
                                                                    boostValue *
                                                                    100 +
                                                                (Number(pool.apy) * 100 || 0) +
                                                                (Number(pool.incentive_apy) * 100 ||
                                                                    0)
                                                            }
                                                            color="blue"
                                                        />
                                                    </>
                                                )}
                                            <Tooltip
                                                content={
                                                    <PoolApyTooltip
                                                        pool={pool}
                                                        userBoost={boostValue}
                                                        userRewardsValue={userRewardsValue}
                                                        userShareRatio={
                                                            pool.balance / pool.total_share
                                                        }
                                                        incentivesForPool={incentivesForPool}
                                                    />
                                                }
                                                background={COLORS.white}
                                                showOnHover
                                            >
                                                <Info />
                                            </Tooltip>
                                        </RewardsApy>
                                    ),
                                    label: 'Total APY',
                                    align: CellAlign.Right,
                                    flexSize: 2,
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
                                                        (!Number(
                                                            userRewards.get(pool.address)?.to_claim,
                                                        ) &&
                                                            !userIncentives
                                                                .get(pool.address)
                                                                ?.some(
                                                                    ({ info }) =>
                                                                        !!Number(info.user_reward),
                                                                ))
                                                    }
                                                    onClick={() => claim(pool.address)}
                                                    title="Claim rewards and incentives"
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
                        };
                    })}
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
