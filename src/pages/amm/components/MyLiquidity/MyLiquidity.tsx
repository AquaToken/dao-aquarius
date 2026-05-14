import BigNumber from 'bignumber.js';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { getUserPools } from 'api/amm';

import { POOL_TYPE } from 'constants/amm';
import { AppRoutes } from 'constants/routes';

import { loadConcentratedUserPositions } from 'helpers/amm-concentrated-user-positions';
import { apyValueToDisplay, contractValueToAmount } from 'helpers/amount';
import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';
import { getPercentValue } from 'helpers/number';
import { calculateBoostValue, calculateDailyRewards } from 'helpers/rewards';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { useUpdateIndex } from 'hooks/useUpdateIndex';
import { useUrlParam } from 'hooks/useUrlParam';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import {
    ModalService,
    SorobanService,
    StellarService,
    ToastService,
} from 'services/globalServices';

import { PoolIncentives, PoolRewardsInfo, PoolUserProcessed, RewardType } from 'types/amm';
import { SorobanToken, Token } from 'types/token';

import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';

import IconClaim from 'assets/icons/actions/icon-claim-17x16.svg';
import ArrowDown from 'assets/icons/arrows/arrow-down-16.svg';
import Lock from 'assets/icons/objects/icon-lock-16.svg';
import Info from 'assets/icons/status/icon-info-16.svg';

import AssetLogo from 'basics/AssetLogo';
import Button from 'basics/buttons/Button';
import Select from 'basics/inputs/Select';
import ToggleGroup from 'basics/inputs/ToggleGroup';
import Label from 'basics/Label';
import { CircleLoader, DotsLoader } from 'basics/loaders';
import PageLoader from 'basics/loaders/PageLoader';
import Market from 'basics/Market';
import Table, { CellAlign } from 'basics/Table';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import {
    cardBoxShadow,
    flexAllCenter,
    flexRowSpaceBetween,
    respondDown,
    textEllipsis,
} from 'styles/mixins';
import { Breakpoints, COLORS, FONT_SIZE, hexWithOpacity } from 'styles/style-constants';

import { TitleWithTooltip, TooltipInnerHead } from 'pages/amm/components/AllPools/AllPools';
import ExpandedMenu from 'pages/amm/components/MyLiquidity/ExpandedMenu/ExpandedMenu';
import MyLiquidityConcentratedPositions from 'pages/amm/components/MyLiquidity/MyLiquidityConcentratedPositions/MyLiquidityConcentratedPositions';
import MigratePoolButton from 'pages/amm/components/PoolsList/MigratePoolButton/MigratePoolButton';
import RewardsBanner from 'pages/amm/components/RewardsBanner/RewardsBanner';
import RewardsTokens from 'pages/amm/components/RewardsTokens/RewardsTokens';
import TotalApy from 'pages/amm/components/TotalApy/TotalApy';
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
        margin-top: 0;
        ${cardBoxShadow};
    `}

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 0;
        background-color: ${COLORS.gray50};
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

const Actions = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;

    ${respondDown(Breakpoints.xl)`
        width: 100%;
        flex-direction: column;
        align-items: stretch;

        ${Buttons} {
            justify-content: flex-end;
        }
    `}
`;

const NoRowToggle = styled.div`
    display: inline-flex;
    align-items: center;
    min-width: 0;
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
    min-width: 24rem;
    max-width: calc(100vw - 12rem);
`;

const TooltipRow = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 1.4rem;
    line-height: 2rem;
    gap: 2rem;

    span:first-child {
        color: ${COLORS.textGray};
        width: 60%;
        ${textEllipsis};
    }

    span:last-child {
        color: ${COLORS.textTertiary};
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }
`;

const IconInfoStyled = styled(Info)`
    cursor: help;
`;

const LabelInner = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 400;
    ${FONT_SIZE.sm};
`;

const PairWithChevron = styled.div`
    display: grid;
    grid-template-columns: 3.2rem minmax(0, 1fr);
    align-items: center;
    width: 100%;
    min-width: 0;

    ${respondDown(Breakpoints.xl)`
        grid-template-columns: minmax(0, 1fr);
    `}
`;

const ChevronSlot = styled.div`
    width: 3.2rem;
    height: 3.2rem;
    flex: 0 0 auto;

    ${respondDown(Breakpoints.xl)`
        display: none;
    `}
`;

const ChevronButton = styled.button<{ $expanded: boolean }>`
    ${flexAllCenter};
    width: 3.2rem;
    height: 3.2rem;
    padding: 0;
    border: none;
    border-radius: 0.4rem;
    background: ${COLORS.transparent};
    color: ${COLORS.textPrimary};
    cursor: pointer;
    transition:
        background 0.15s ease,
        transform 0.2s ease;

    svg {
        width: 1.6rem;
        height: 1.6rem;
        transition: transform 0.2s ease;
        transform: rotate(${({ $expanded }) => ($expanded ? '180deg' : '0deg')});
    }

    &:hover {
        background: ${COLORS.gray100};
    }
`;

const MobileChevronButton = styled(ChevronButton)`
    display: none;

    ${respondDown(Breakpoints.xl)`
        display: flex;
        width: 100%;
        background: ${COLORS.gray50};

        &:hover {
            background: ${COLORS.gray100};
        }
    `}
`;

const AfterRowWrapper = styled.div`
    width: 100%;
    padding: 0 0 1.6rem;

    ${respondDown(Breakpoints.xl)`
        padding: 0;
    `}
`;

const ROW_PADDING = '0.8rem';

enum FilterValues {
    all = 'all',
    volatile = 'volatile',
    stable = 'stable',
    concentrated = 'concentrated',
    classic = 'classic',
}

export enum MyLiquidityUrlParams {
    filter = 'filter',
}

const FilterOptions = [
    { label: 'All', value: FilterValues.all },
    { label: 'Stable', value: FilterValues.stable },
    { label: 'Volatile', value: FilterValues.volatile },
    { label: 'Concentrated', value: FilterValues.concentrated },
    { label: 'Classic', value: FilterValues.classic },
];

interface MyLiquidityProps {
    setTotal?: (total: number) => void;
    onlyList?: boolean;
    backToAllPools?: () => void;
}

const MyLiquidity = ({ setTotal, onlyList, backToAllPools }: MyLiquidityProps) => {
    const { account } = useAuthStore();

    const [pools, setPools] = useState<PoolUserProcessed[]>(null);
    const [classicPools, setClassicPools] = useState(null);
    const [userRewards, setUserRewards] = useState<Map<string, PoolRewardsInfo>>(new Map());
    const [userIncentives, setUserIncentives] = useState<Map<string, PoolIncentives[]>>(new Map());
    const [isUserRewardsLoaded, setIsUserRewardsLoaded] = useState(false);
    const [rewardsSum, setRewardsSum] = useState(0);
    const [incentivesSum, setIncentivesSum] = useState(new Map());
    const [isUserIncentivesLoaded, setIsUserIncentivesLoaded] = useState(false);
    const [claimPendingId, setClaimPendingId] = useState(null);
    const [concentratedData, setConcentratedData] = useState<
        Map<string, { tokenEstimates: string[]; liquidityUsd: number; rawLiquidity: string }>
    >(new Map());
    const [expandedPools, setExpandedPools] = useState<Set<string>>(new Set());

    const togglePoolExpanded = (poolAddress: string) => {
        setExpandedPools(prev => {
            const next = new Set(prev);
            if (next.has(poolAddress)) {
                next.delete(poolAddress);
            } else {
                next.add(poolAddress);
            }
            return next;
        });
    };

    const { value: filter, setValue: setFilter } = useUrlParam<FilterValues>(
        MyLiquidityUrlParams.filter,
        FilterValues.all,
    );

    const updateIndex = useUpdateIndex(5000);

    const filteredPools = useMemo(() => {
        if (!classicPools || !pools) return null;

        if (filter === FilterValues.classic) {
            return classicPools;
        }
        if (filter === FilterValues.volatile) {
            return pools.filter(({ pool_type }) => pool_type === POOL_TYPE.constant);
        }
        if (filter === FilterValues.stable) {
            return pools.filter(({ pool_type }) => pool_type === POOL_TYPE.stable);
        }
        if (filter === FilterValues.concentrated) {
            return pools.filter(({ pool_type }) => pool_type === POOL_TYPE.concentrated);
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
                map.set(pools[index].address, reward);
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
                if (!incentives) return;

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

    useEffect(() => {
        if (!account || !pools) {
            setConcentratedData(new Map());
            return;
        }

        const concentratedPools = pools.filter(
            ({ pool_type }) => pool_type === POOL_TYPE.concentrated,
        );

        if (!concentratedPools.length) {
            setConcentratedData(new Map());
            return;
        }

        let cancelled = false;

        Promise.all(
            concentratedPools.map(pool =>
                loadConcentratedUserPositions(pool, account.accountId())
                    .then(({ positions, rawLiquidity }) => ({
                        address: pool.address,
                        tokenEstimates: pool.tokens.map((_, index) =>
                            positions
                                .reduce(
                                    (acc, position) =>
                                        acc.plus(position.tokenEstimates[index] || '0'),
                                    new BigNumber(0),
                                )
                                .toFixed(),
                        ),
                        liquidityUsd: positions.reduce(
                            (acc, position) => acc + (position.liquidityUsd || 0),
                            0,
                        ),
                        rawLiquidity,
                    }))
                    .catch(() => ({
                        address: pool.address,
                        tokenEstimates: pool.tokens.map(() => '0'),
                        liquidityUsd: 0,
                        rawLiquidity: '0',
                    })),
            ),
        ).then(results => {
            if (cancelled) return;
            const map = new Map<
                string,
                { tokenEstimates: string[]; liquidityUsd: number; rawLiquidity: string }
            >();
            results.forEach(({ address, tokenEstimates, liquidityUsd, rawLiquidity }) => {
                map.set(address, { tokenEstimates, liquidityUsd, rawLiquidity });
            });
            setConcentratedData(map);
        });

        return () => {
            cancelled = true;
        };
    }, [pools, account, updateIndex]);

    const { totalLiquidity, poolsLiquidity } = useMemo(() => {
        const map = new Map<string, number>();

        if (!pools || !classicPools) {
            return { totalLiquidity: 0, poolsLiquidity: map };
        }

        const totalSorobanUsd = pools.reduce((acc, pool) => {
            if (pool.pool_type === POOL_TYPE.concentrated) {
                const usd = concentratedData.get(pool.address)?.liquidityUsd ?? 0;
                map.set(pool.address, usd);
                acc += usd;
                return acc;
            }

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

            map.set(
                pool.id,
                (balance / totalShare) * liquidity * StellarService.price.priceLumenUsd,
            );

            acc += (balance / totalShare) * liquidity;
            return acc;
        }, 0);

        const totalClassicUsd = totalClassicXlm * StellarService.price.priceLumenUsd;
        const total = totalClassicUsd + totalSorobanUsd;

        if (setTotal) {
            setTotal(total);
        }
        return { totalLiquidity: total, poolsLiquidity: map };
    }, [pools, classicPools, concentratedData]);

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
                    <ListTitle>Liquidity Positions</ListTitle>
                    <ListTotal>
                        <span>Total: </span>
                        <span>${formatBalance(totalLiquidity, true)}</span>
                    </ListTotal>
                </ListHeader>
            )}

            <ToggleGroupStyled value={filter} options={FilterOptions} onChange={setFilter} />

            <SelectWrapper>
                <SelectStyled value={filter} options={FilterOptions} onChange={setFilter} />
            </SelectWrapper>

            {isUserRewardsLoaded && isUserIncentivesLoaded && (
                <RewardsBanner
                    rewardsSum={rewardsSum}
                    userRewardsCount={userRewards.size}
                    incentivesSum={incentivesSum}
                    userIncentivesCount={
                        [...userIncentives.values()].filter(incentives =>
                            incentives.some(incentive =>
                                Boolean(Number(incentive.info.user_reward)),
                            ),
                        ).length
                    }
                />
            )}

            {!filteredPools ? (
                <PageLoader />
            ) : filteredPools.length ? (
                <Table
                    mobileBreakpoint={Breakpoints.xl}
                    head={[
                        {
                            children: 'Pool',
                            flexSize: 4,
                        },
                        { children: 'Pooled', align: CellAlign.Right },
                        {
                            children: (
                                <TitleWithTooltip>
                                    Daily Rewards
                                    <Tooltip
                                        showOnHover
                                        content={
                                            <TooltipInnerHead>
                                                Amount of AQUA your position earns daily from
                                                Aquarius reward zone emissions.
                                            </TooltipInnerHead>
                                        }
                                        position={TOOLTIP_POSITION.top}
                                    >
                                        <Info />
                                    </Tooltip>
                                </TitleWithTooltip>
                            ),
                            align: CellAlign.Right,
                            flexSize: 1.2,
                        },

                        {
                            children: 'Ready To Claim',
                            align: CellAlign.Left,
                            flexSize: 1.5,
                            style: {
                                marginLeft: '5rem',
                            },
                        },
                        {
                            children: 'Total APR',
                            align: CellAlign.Left,
                            flexSize: 2.5,
                            style: { paddingLeft: '5rem' },
                        },
                        { children: '' },
                    ]}
                    body={filteredPools.map(pool => {
                        const userRewardsForPool = userRewards.get(pool.address);

                        const isRewardsExpired =
                            userRewardsForPool?.exp_at &&
                            userRewardsForPool?.exp_at * 1000 < Date.now();

                        const boostValue = calculateBoostValue(
                            +userRewardsForPool?.working_balance,
                            contractValueToAmount(pool.balance),
                        );

                        const dailyRewards =
                            userRewardsForPool && !isRewardsExpired
                                ? calculateDailyRewards(
                                      +userRewardsForPool?.tps,
                                      +userRewardsForPool?.working_balance,
                                      +userRewardsForPool?.working_supply,
                                  )
                                : 0;

                        const incentivesForPool = userIncentives
                            .get(pool.address)
                            ?.filter(incentive => !!Number(incentive.info.user_reward));

                        const userRewardsValue = +userRewards.get(pool.address)?.to_claim;

                        const isConcentratedLoading =
                            pool.pool_type === POOL_TYPE.concentrated &&
                            !concentratedData.has(pool.address);

                        const isConcentrated = pool.pool_type === POOL_TYPE.concentrated;
                        const isExpanded = isConcentrated && expandedPools.has(pool.address);

                        const marketCell = (
                            <Market
                                assets={pool.tokens}
                                mobileVerticalDirections
                                withoutLink
                                poolType={pool.pool_type as POOL_TYPE}
                                isRewardsOn={Boolean(Number(pool.reward_tps))}
                                poolAddress={pool.address}
                                fee={pool.fee}
                            />
                        );

                        return {
                            key: pool.address || pool.id,
                            style: {
                                padding: ROW_PADDING,
                            },
                            onRowClick: isConcentrated
                                ? (event: React.MouseEvent<HTMLDivElement>) => {
                                      if (
                                          (event.target as HTMLElement).closest(
                                              '[data-no-row-toggle="true"]',
                                          )
                                      ) {
                                          return;
                                      }
                                      togglePoolExpanded(pool.address);
                                  }
                                : undefined,
                            afterRow: isExpanded ? (
                                <AfterRowWrapper data-no-row-toggle="true">
                                    <MyLiquidityConcentratedPositions pool={pool} />
                                </AfterRowWrapper>
                            ) : null,
                            rowItems: [
                                {
                                    children: (
                                        <PairWithChevron>
                                            <ChevronSlot>
                                                {isConcentrated ? (
                                                    <ChevronButton
                                                        type="button"
                                                        $expanded={isExpanded}
                                                        aria-label={
                                                            isExpanded
                                                                ? 'Collapse positions'
                                                                : 'Expand positions'
                                                        }
                                                        aria-expanded={isExpanded}
                                                        tabIndex={-1}
                                                    >
                                                        <ArrowDown />
                                                    </ChevronButton>
                                                ) : null}
                                            </ChevronSlot>
                                            <NoRowToggle data-no-row-toggle="true">
                                                {marketCell}
                                            </NoRowToggle>
                                        </PairWithChevron>
                                    ),
                                    flexSize: 4,
                                },
                                {
                                    children: poolsLiquidity.has(pool.address || pool.id) ? (
                                        <Pooled>
                                            <span>
                                                {isConcentratedLoading ? (
                                                    <DotsLoader />
                                                ) : (
                                                    `$${formatBalance(
                                                        poolsLiquidity.get(pool.address || pool.id),
                                                        true,
                                                    )}`
                                                )}
                                            </span>
                                            <Tooltip
                                                content={
                                                    <TooltipInner>
                                                        {pool.tokens.map((asset, index) => {
                                                            const isConcentrated =
                                                                pool.pool_type ===
                                                                POOL_TYPE.concentrated;
                                                            const concentratedAmount =
                                                                isConcentrated
                                                                    ? Number(
                                                                          concentratedData.get(
                                                                              pool.address,
                                                                          )?.tokenEstimates[
                                                                              index
                                                                          ] || '0',
                                                                      )
                                                                    : 0;
                                                            const amount = isConcentrated
                                                                ? concentratedAmount
                                                                : (+contractValueToAmount(
                                                                      pool.reserves[index],
                                                                      (
                                                                          pool.tokens[
                                                                              index
                                                                          ] as SorobanToken
                                                                      ).decimal,
                                                                  ) *
                                                                      +pool.balance) /
                                                                  +pool.total_share;

                                                            return (
                                                                <TooltipRow
                                                                    key={getAssetString(asset)}
                                                                >
                                                                    <span>Pooled {asset.code}</span>
                                                                    <span>
                                                                        {isConcentratedLoading ? (
                                                                            <DotsLoader />
                                                                        ) : (
                                                                            formatBalance(
                                                                                amount,
                                                                                true,
                                                                            )
                                                                        )}
                                                                        <AssetLogo
                                                                            asset={asset}
                                                                            isSmall
                                                                            isCircle
                                                                        />
                                                                    </span>
                                                                </TooltipRow>
                                                            );
                                                        })}
                                                        <TooltipRow>
                                                            <span>Shares</span>
                                                            <span>
                                                                {isConcentratedLoading ? (
                                                                    <DotsLoader />
                                                                ) : pool.pool_type ===
                                                                  POOL_TYPE.concentrated ? (
                                                                    formatBalance(
                                                                        Number(
                                                                            contractValueToAmount(
                                                                                concentratedData.get(
                                                                                    pool.address,
                                                                                )?.rawLiquidity ||
                                                                                    '0',
                                                                                pool.share_token_decimals,
                                                                            ),
                                                                        ),
                                                                        true,
                                                                        true,
                                                                        pool.share_token_decimals,
                                                                    )
                                                                ) : (
                                                                    formatBalance(
                                                                        pool.balance / 1e7,
                                                                        true,
                                                                    )
                                                                )}
                                                                {pool.pool_type !==
                                                                    POOL_TYPE.concentrated && (
                                                                    <>
                                                                        {' '}
                                                                        (
                                                                        {+getPercentValue(
                                                                            pool.balance,
                                                                            pool.total_share,
                                                                            2,
                                                                        ) > 0.01
                                                                            ? formatBalance(
                                                                                  +getPercentValue(
                                                                                      pool.balance,
                                                                                      pool.total_share,
                                                                                      2,
                                                                                  ),
                                                                                  true,
                                                                              )
                                                                            : '< 0.01'}
                                                                        %)
                                                                    </>
                                                                )}
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
                                    children:
                                        pool.pool_type !== POOL_TYPE.classic &&
                                        !pool.rewards_enabled ? (
                                            <Label
                                                labelText={
                                                    <LabelInner>
                                                        <Lock /> <span>Disabled</span>
                                                    </LabelInner>
                                                }
                                                background={COLORS.gray100}
                                                color={COLORS.textGray}
                                                withoutBorder
                                                labelSize="medium"
                                                withoutUppercase
                                            />
                                        ) : Number(dailyRewards) ? (
                                            `${formatBalance(dailyRewards, true, true)} AQUA`
                                        ) : (
                                            '-'
                                        ),
                                    label: (
                                        <TitleWithTooltip>
                                            Daily Rewards
                                            <Tooltip
                                                showOnHover
                                                content={
                                                    <TooltipInnerHead>
                                                        Amount of AQUA your position earns daily
                                                        from Aquarius reward zone emissions.
                                                    </TooltipInnerHead>
                                                }
                                                position={TOOLTIP_POSITION.top}
                                            >
                                                <Info />
                                            </Tooltip>
                                        </TitleWithTooltip>
                                    ),
                                    align: CellAlign.Right,
                                    flexSize: 1.2,
                                },
                                {
                                    children:
                                        !!incentivesForPool?.length || !!userRewardsValue ? (
                                            <RewardsTokens
                                                pool={pool}
                                                myRewards={userRewardsValue}
                                                myIncentives={incentivesForPool}
                                            />
                                        ) : (
                                            '-'
                                        ),
                                    label: 'Ready To Claim',
                                    flexSize: 1.5,
                                    align: CellAlign.Left,
                                    style: {
                                        marginLeft: '5rem',
                                    },
                                },
                                {
                                    children: pool.rewards_enabled ? (
                                        <TotalApy pool={pool} userBoost={boostValue} />
                                    ) : (
                                        <Label
                                            labelText={apyValueToDisplay(pool.apy)}
                                            labelSize="extraLarge"
                                            background={hexWithOpacity(COLORS.gray200, 20)}
                                            color={COLORS.textTertiary}
                                            withoutBorder
                                            fontWeight={400}
                                        />
                                    ),
                                    label: 'Total APR',
                                    align: CellAlign.Left,
                                    flexSize: 2.5,
                                    style: {
                                        marginLeft: '5rem',
                                    },
                                },
                                {
                                    children: (
                                        <Actions>
                                            <Buttons data-no-row-toggle="true">
                                                {pool.address ? (
                                                    <Button
                                                        isSquare
                                                        pending={pool.address === claimPendingId}
                                                        disabled={
                                                            (pool.address !== claimPendingId &&
                                                                Boolean(claimPendingId)) ||
                                                            (!Number(
                                                                userRewards.get(pool.address)
                                                                    ?.to_claim,
                                                            ) &&
                                                                !userIncentives
                                                                    .get(pool.address)
                                                                    ?.some(
                                                                        ({ info }) =>
                                                                            !!Number(
                                                                                info.user_reward,
                                                                            ),
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
                                            {isConcentrated ? (
                                                <MobileChevronButton
                                                    type="button"
                                                    $expanded={isExpanded}
                                                    aria-label={
                                                        isExpanded
                                                            ? 'Collapse positions'
                                                            : 'Expand positions'
                                                    }
                                                    aria-expanded={isExpanded}
                                                    onClick={event => {
                                                        event.stopPropagation();
                                                        togglePoolExpanded(pool.address);
                                                    }}
                                                >
                                                    <ArrowDown />
                                                </MobileChevronButton>
                                            ) : null}
                                        </Actions>
                                    ),
                                    align: CellAlign.Right,
                                    mobileStyle: {
                                        width: '100%',
                                    },
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
                                to={AppRoutes.section.amm.link.index}
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
