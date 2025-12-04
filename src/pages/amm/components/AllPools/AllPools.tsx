import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { FilterOptions, getPools, PoolsSortFields } from 'api/amm';

import { POOL_TYPE } from 'constants/amm';
import { AppRoutes } from 'constants/routes';

import { formatBalance } from 'helpers/format-number';

import { useDebounce } from 'hooks/useDebounce';

import { PoolProcessed } from 'types/amm';

import Input from 'web/basics/inputs/Input';

import Search from 'assets/icons/actions/icon-search-16.svg';
import Info from 'assets/icons/status/icon-info-16.svg';

import Select from 'basics/inputs/Select';
import ToggleGroup from 'basics/inputs/ToggleGroup';
import PageLoader from 'basics/loaders/PageLoader';
import Market from 'basics/Market';
import Pagination from 'basics/Pagination';
import Table, { CellAlign } from 'basics/Table';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { flexRowSpaceBetween, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import RewardsTokens from 'pages/amm/components/RewardsTokens/RewardsTokens';
import TotalApy from 'pages/amm/components/TotalApy/TotalApy';
import { AnalyticsTabs, AnalyticsUrlParams } from 'pages/amm/pages/Analytics';
import { Empty } from 'pages/profile/YourVotes/YourVotes';

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

export const TitleWithTooltip = styled.span`
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

export const TooltipInnerHead = styled.span`
    width: 20rem;
    white-space: pre-wrap;
    font-size: 1.4rem;
    line-height: 2rem;
`;

enum UrlParams {
    sort = 'sort',
    filter = 'filter',
    search = 'search',
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

    const navigate = useNavigate();
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
            navigate(`${location.pathname}?${params.toString()}`, { replace: true });
        }
        const sortParam = params.get(UrlParams.sort);

        if (sortParam) {
            setSort(sortParam as PoolsSortFields);
            setPage(1);
        } else {
            params.append(UrlParams.sort, PoolsSortFields.liquidityUp);
            setSort(PoolsSortFields.liquidityUp);
            navigate(`${location.pathname}?${params.toString()}`, { replace: true });
        }

        const searchParam = params.get(UrlParams.search);

        if (searchParam) {
            setSearch(searchParam);
            setPage(1);
        } else {
            setSearch('');
        }
    }, [location]);

    const setFilterParam = (filterOption: FilterOptions) => {
        const params = new URLSearchParams(location.search);
        params.set(UrlParams.filter, filterOption);
        navigate({ search: params.toString() });
    };

    const setSortParam = (sort: PoolsSortFields) => {
        const params = new URLSearchParams(location.search);
        params.set(UrlParams.sort, sort);
        navigate({ search: params.toString() });
    };

    const setSearchParam = (str: string) => {
        const params = new URLSearchParams(location.search);
        if (!str) {
            params.delete(UrlParams.search);
            navigate({ search: params.toString() });
            return;
        }
        params.set(UrlParams.search, str);
        navigate({ search: params.toString() });
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
            .catch(e => {
                console.log(e);
            });
    }, [filter, page, debouncedSearch, sort]);

    const goToPoolPage = (id: string) => {
        navigate(AppRoutes.section.amm.to.pool({ poolAddress: id }));
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
                    onChange={({ target }) => setSearchParam(target.value)}
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
                                children: 'Volume 24H',
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
                                children: 'Rewards',
                                align: CellAlign.Left,
                                flexSize: 3,
                                style: {
                                    marginLeft: '5rem',
                                },
                            },
                            {
                                children: (
                                    <TitleWithTooltip>
                                        Total APR
                                        <Tooltip
                                            showOnHover
                                            content={
                                                <TooltipInnerHead>
                                                    Total APR is the sum of LP APR, Rewards APR, and
                                                    Incentives APR.
                                                </TooltipInnerHead>
                                            }
                                            position={TOOLTIP_POSITION.top}
                                        >
                                            <Info />
                                        </Tooltip>
                                    </TitleWithTooltip>
                                ),
                                flexSize: 3,
                                align: CellAlign.Left,
                                sort: {
                                    onClick: () =>
                                        setSortParam(
                                            sort === PoolsSortFields.totalApyUp
                                                ? PoolsSortFields.totalApyDown
                                                : PoolsSortFields.totalApyUp,
                                        ),
                                    isEnabled:
                                        sort === PoolsSortFields.totalApyUp ||
                                        sort === PoolsSortFields.totalApyDown,
                                    isReversed: sort === PoolsSortFields.totalApyDown,
                                },
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
                                            assets={pool.tokens}
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
                                    label: 'Volume 24H:',
                                    align: CellAlign.Right,
                                    flexSize: 2,
                                },
                                {
                                    children: <RewardsTokens pool={pool} />,
                                    label: 'Rewards',
                                    align: CellAlign.Left,
                                    flexSize: 3,
                                    style: {
                                        marginLeft: '5rem',
                                    },
                                },
                                {
                                    children: <TotalApy pool={pool} />,
                                    label: (
                                        <TitleWithTooltip>
                                            Total APR
                                            <Tooltip
                                                showOnHover
                                                content={
                                                    <TooltipInnerHead>
                                                        Total APR is the sum of LP APR, Rewards APR,
                                                        and Incentives APR.
                                                    </TooltipInnerHead>
                                                }
                                                position={TOOLTIP_POSITION.top}
                                            >
                                                <Info />
                                            </Tooltip>
                                        </TitleWithTooltip>
                                    ),
                                    flexSize: 3,
                                    align: CellAlign.Left,
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
