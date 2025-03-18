import * as React from 'react';
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { FilterOptions, getPools, PoolsSortFields } from 'api/amm';

import { AmmRoutes } from 'constants/routes';

import { formatBalance } from 'helpers/format-number';

import { useDebounce } from 'hooks/useDebounce';

import { POOL_TYPE } from 'services/soroban.service';

import { PoolProcessed } from 'types/amm';

import { flexRowSpaceBetween, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Info from 'assets/icon-info.svg';
import Search from 'assets/icon-search.svg';

import Select from 'basics/inputs/Select';
import ToggleGroup from 'basics/inputs/ToggleGroup';
import PageLoader from 'basics/loaders/PageLoader';
import Market from 'basics/Market';
import Pagination from 'basics/Pagination';
import Table, { CellAlign } from 'basics/Table';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { AnalyticsTabs, AnalyticsUrlParams } from 'pages/amm/pages/Analytics';
import { Empty } from 'pages/profile/YourVotes/YourVotes';

import Input from '../../../../web/basics/inputs/Input';

const Header = styled.div`
    ${flexRowSpaceBetween};
    margin-top: 3.2rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        margin-top: 0;
        padding: 1.6rem 0;
    `}
`;

const ToggleGroupStyled = styled(ToggleGroup)`
    width: fit-content;
    margin-top: 3.6rem;
    margin-bottom: 3.2rem;

    ${respondDown(Breakpoints.sm)`
        display: none;
    `}
`;

const SelectStyled = styled(Select)`
    margin-top: 3.6rem;
    display: none;

    ${respondDown(Breakpoints.sm)`
        display: flex;
        margin-bottom: 3.2rem;
        margin-top: 1.6rem;
    `}
`;

const TitleWithTooltip = styled.span`
    display: flex;
    align-items: center;

    svg {
        margin: 0 0.4rem;
    }
`;

const StyledInput = styled(Input)`
    width: 56rem;
    margin-left: 2.4rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
        margin-left: 0;
    `}
`;

const TooltipInner = styled.span`
    width: 20rem;
    white-space: pre-wrap;
`;

enum UrlParams {
    sort = 'sort',
    filter = 'filter',
}

const PAGE_SIZE = 20;

const OPTIONS = [
    { label: 'All', value: FilterOptions.all },
    { label: 'Stable', value: FilterOptions.stable },
    { label: 'Volatile', value: FilterOptions.constant },
];

const AllPools = (): React.ReactNode => {
    const [filter, setFilter] = useState(null);
    const [sort, setSort] = useState(null);
    const [pools, setPools] = useState<PoolProcessed[] | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pending, setPending] = useState(false);
    const [search, setSearch] = useState('');

    const history = useHistory();
    const location = useLocation();

    const debouncedSearch = useDebounce(search, 700, true, () => setPage(1));

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get(AnalyticsUrlParams.tab) !== AnalyticsTabs.top) {
            return;
        }
        const filterParam = params.get(UrlParams.filter);
        if (filterParam) {
            setFilter(filterParam as FilterOptions);
            setPage(1);
        } else {
            params.append(UrlParams.filter, FilterOptions.all);
            setFilter(FilterOptions.all);
            history.replace({ search: params.toString() });
        }
        const sortParam = params.get(UrlParams.sort);
        if (sortParam) {
            setSort(sortParam as PoolsSortFields);
            setPage(1);
        } else {
            params.append(UrlParams.sort, PoolsSortFields.liquidityUp);
            setSort(PoolsSortFields.liquidityUp);
            history.replace({ search: params.toString() });
        }
    }, [location]);

    const setFilterParam = (filterOption: FilterOptions) => {
        const params = new URLSearchParams(location.search);
        params.set(UrlParams.filter, filterOption);
        history.push({ search: params.toString() });
    };

    const setSortParam = (sort: PoolsSortFields) => {
        const params = new URLSearchParams(location.search);
        params.set(UrlParams.sort, sort);
        history.push({ search: params.toString() });
    };

    useEffect(() => {
        if (!sort || !filter) {
            return;
        }
        setPending(true);
        getPools(filter, page, PAGE_SIZE, sort, debouncedSearch)
            .then(({ pools, total }) => {
                setPools(pools);
                setTotal(total);
                setPending(false);
            })
            .catch(() => {});
    }, [filter, page, debouncedSearch, sort]);

    const goToPoolPage = (id: string) => {
        history.push(`${AmmRoutes.analytics}${id}/`);
    };

    return !pools ? (
        <PageLoader />
    ) : (
        <>
            <Header>
                <ToggleGroupStyled value={filter} options={OPTIONS} onChange={setFilterParam} />
                <SelectStyled value={filter} options={OPTIONS} onChange={setFilterParam} />
                <StyledInput
                    placeholder="Search by token name or token address"
                    value={search}
                    onChange={({ target }) => setSearch(target.value)}
                    postfix={<Search />}
                />
            </Header>

            {pools.length ? (
                <>
                    <Table
                        pending={pending}
                        mobileBreakpoint={Breakpoints.lg}
                        head={[
                            { children: 'Pool', flexSize: 6.5 },
                            {
                                children: 'TVL',
                                sort: {
                                    onClick: () =>
                                        setSortParam(
                                            sort === PoolsSortFields.liquidityUp
                                                ? PoolsSortFields.liquidityDown
                                                : PoolsSortFields.liquidityUp,
                                        ),
                                    isEnabled:
                                        sort === PoolsSortFields.liquidityUp ||
                                        sort === PoolsSortFields.liquidityDown,
                                    isReversed: sort === PoolsSortFields.liquidityDown,
                                },
                                align: CellAlign.Right,
                                flexSize: 2,
                            },
                            {
                                children: 'Volume 24h',
                                sort: {
                                    onClick: () =>
                                        setSortParam(
                                            sort === PoolsSortFields.volumeUp
                                                ? PoolsSortFields.volumeDown
                                                : PoolsSortFields.volumeUp,
                                        ),
                                    isEnabled:
                                        sort === PoolsSortFields.volumeUp ||
                                        sort === PoolsSortFields.volumeDown,
                                    isReversed: sort === PoolsSortFields.volumeDown,
                                },
                                align: CellAlign.Right,
                                flexSize: 2,
                            },
                            {
                                children: 'Daily reward',
                                sort: {
                                    onClick: () =>
                                        setSortParam(
                                            sort === PoolsSortFields.rewardsUp
                                                ? PoolsSortFields.rewardsDown
                                                : PoolsSortFields.rewardsUp,
                                        ),
                                    isEnabled:
                                        sort === PoolsSortFields.rewardsUp ||
                                        sort === PoolsSortFields.rewardsDown,
                                    isReversed: sort === PoolsSortFields.rewardsDown,
                                },
                                flexSize: 2,
                                align: CellAlign.Right,
                            },

                            {
                                children: (
                                    <TitleWithTooltip>
                                        Base APY
                                        <Tooltip
                                            showOnHover
                                            content={
                                                <TooltipInner>
                                                    Annual yield projection for liquidity providers,
                                                    based on current trading activity and collected
                                                    fees. Rewards are allocated based on each
                                                    provider’s share of liquidity in the pool.
                                                </TooltipInner>
                                            }
                                            position={TOOLTIP_POSITION.top}
                                        >
                                            <Info />
                                        </Tooltip>
                                    </TitleWithTooltip>
                                ),
                                sort: {
                                    onClick: () =>
                                        setSortParam(
                                            sort === PoolsSortFields.apyUp
                                                ? PoolsSortFields.apyDown
                                                : PoolsSortFields.apyUp,
                                        ),
                                    isEnabled:
                                        sort === PoolsSortFields.apyUp ||
                                        sort === PoolsSortFields.apyDown,
                                    isReversed: sort === PoolsSortFields.apyDown,
                                },
                                flexSize: 2,
                                align: CellAlign.Right,
                            },
                            {
                                children: (
                                    <TitleWithTooltip>
                                        Rewards APY
                                        <Tooltip
                                            showOnHover
                                            content={
                                                <TooltipInner>
                                                    Projected additional annual AQUA rewards for
                                                    liquidity providers in pools within the "rewards
                                                    zone", determined by Aquarius DAO voting.
                                                </TooltipInner>
                                            }
                                            position={TOOLTIP_POSITION.top}
                                        >
                                            <Info />
                                        </Tooltip>
                                    </TitleWithTooltip>
                                ),
                                sort: {
                                    onClick: () =>
                                        setSortParam(
                                            sort === PoolsSortFields.rewardsApyUp
                                                ? PoolsSortFields.rewardsApyDown
                                                : PoolsSortFields.rewardsApyUp,
                                        ),
                                    isEnabled:
                                        sort === PoolsSortFields.rewardsApyUp ||
                                        sort === PoolsSortFields.rewardsApyDown,
                                    isReversed: sort === PoolsSortFields.rewardsApyDown,
                                },
                                flexSize: 2,
                                align: CellAlign.Right,
                            },
                        ]}
                        body={pools.map(pool => ({
                            key: pool.address,
                            onRowClick: () => goToPoolPage(pool.address),
                            mobileBackground: COLORS.white,
                            rowItems: [
                                {
                                    children: (
                                        <Market
                                            assets={pool.assets}
                                            mobileVerticalDirections
                                            withoutLink
                                            poolType={pool.pool_type as POOL_TYPE}
                                            isRewardsOn={Boolean(Number(pool.reward_tps))}
                                            fee={pool.fee}
                                            apyTier={pool.apy_tier}
                                        />
                                    ),
                                    flexSize: 6.5,
                                },
                                {
                                    children: pool.liquidity_usd
                                        ? `$${formatBalance(
                                              Number(pool.liquidity_usd) / 1e7,
                                              true,
                                              true,
                                          )}`
                                        : '0',
                                    label: 'TVL:',
                                    align: CellAlign.Right,
                                    flexSize: 2,
                                },
                                {
                                    children: pool.volume_usd
                                        ? `$${formatBalance(
                                              Number(pool.volume_usd) / 1e7,
                                              true,
                                              true,
                                          )}`
                                        : '0',
                                    label: 'Volume 24h:',
                                    align: CellAlign.Right,
                                    flexSize: 2,
                                },
                                {
                                    children: pool.reward_tps
                                        ? `${formatBalance(
                                              (+pool.reward_tps / 1e7) * 60 * 60 * 24,
                                              true,
                                          )} AQUA`
                                        : '-',
                                    label: 'Daily reward:',
                                    flexSize: 2,
                                    align: CellAlign.Right,
                                },
                                {
                                    children: `${(Number(pool.apy) * 100).toFixed(2)}%`,
                                    label: (
                                        <TitleWithTooltip>
                                            Base APY
                                            <Tooltip
                                                showOnHover
                                                content={
                                                    <TooltipInner>
                                                        Annual yield projection for liquidity
                                                        providers, based on current trading activity
                                                        and collected fees. Rewards are allocated
                                                        based on each provider’s share of liquidity
                                                        in the pool.
                                                    </TooltipInner>
                                                }
                                                position={TOOLTIP_POSITION.top}
                                            >
                                                <Info />
                                            </Tooltip>
                                        </TitleWithTooltip>
                                    ),
                                    flexSize: 2,
                                    align: CellAlign.Right,
                                },
                                {
                                    children: `${(Number(pool.rewards_apy) * 100).toFixed(2)}%`,
                                    label: (
                                        <TitleWithTooltip>
                                            Rewards APY
                                            <Tooltip
                                                showOnHover
                                                content={
                                                    <TooltipInner>
                                                        Projected additional annual AQUA rewards for
                                                        liquidity providers in pools within the
                                                        "rewards zone", determined by Aquarius DAO
                                                        voting.
                                                    </TooltipInner>
                                                }
                                                position={TOOLTIP_POSITION.top}
                                            >
                                                <Info />
                                            </Tooltip>
                                        </TitleWithTooltip>
                                    ),
                                    flexSize: 2,
                                    align: CellAlign.Right,
                                },
                            ],
                        }))}
                    />
                    <Pagination
                        pageSize={PAGE_SIZE}
                        totalCount={total}
                        onPageChange={setPage}
                        currentPage={page}
                        itemName="pools"
                    />{' '}
                </>
            ) : (
                <Empty>
                    <h3>There's nothing here.</h3>
                </Empty>
            )}
        </>
    );
};

export default AllPools;
