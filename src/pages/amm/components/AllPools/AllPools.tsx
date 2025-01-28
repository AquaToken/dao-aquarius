import * as React from 'react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { FilterOptions, getPools, PoolsSortFields } from 'api/amm';

import { AmmRoutes } from 'constants/routes';

import { formatBalance } from 'helpers/format-number';

import { POOL_TYPE } from 'services/soroban.service';

import { PoolProcessed } from 'types/amm';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Info from 'assets/icon-info.svg';

import Select from 'basics/inputs/Select';
import ToggleGroup from 'basics/inputs/ToggleGroup';
import PageLoader from 'basics/loaders/PageLoader';
import Market from 'basics/Market';
import Pagination from 'basics/Pagination';
import Table, { CellAlign } from 'basics/Table';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { Empty } from 'pages/profile/YourVotes/YourVotes';

const ToggleGroupStyled = styled(ToggleGroup)`
    width: fit-content;
    margin-top: 3.6rem;

    ${respondDown(Breakpoints.sm)`
        display: none;
    `}
`;

const SelectStyled = styled(Select)`
    margin-top: 3.6rem;
    display: none;
    ${respondDown(Breakpoints.sm)`
        display: flex;
        margin-bottom: 3.6rem;
    `}
`;

const TitleWithTooltip = styled.span`
    display: flex;
    align-items: center;

    svg {
        margin: 0 0.4rem;
    }
`;

const TooltipInner = styled.span`
    width: 20rem;
    white-space: pre-wrap;
`;

const PAGE_SIZE = 20;

const OPTIONS = [
    { label: 'All', value: FilterOptions.all },
    { label: 'Stable', value: FilterOptions.stable },
    { label: 'Volatile', value: FilterOptions.constant },
];

interface AllPoolsProps {
    search: string;
}

const AllPools = ({ search }: AllPoolsProps): React.ReactNode => {
    const [filter, setFilter] = useState(FilterOptions.all);
    const [sort, setSort] = useState(PoolsSortFields.liquidityUp);
    const [pools, setPools] = useState<PoolProcessed[] | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pending, setPending] = useState(false);

    const history = useHistory();

    useEffect(() => {
        setPage(1);
    }, [filter]);

    useEffect(() => {
        setPending(true);
        getPools(filter, page, PAGE_SIZE, sort, search).then(({ pools, total }) => {
            setPools(pools);
            setTotal(total);
            setPending(false);
        });
    }, [filter, page, search, sort]);

    const changeSort = (newSort: PoolsSortFields) => {
        setSort(newSort);
        setPage(1);
    };

    const goToPoolPage = (id: string) => {
        history.push(`${AmmRoutes.analytics}${id}/`);
    };
    return !pools ? (
        <PageLoader />
    ) : (
        <>
            <ToggleGroupStyled value={filter} options={OPTIONS} onChange={setFilter} />
            <SelectStyled value={filter} options={OPTIONS} onChange={setFilter} />
            {pools.length ? (
                <>
                    <Table
                        pending={pending}
                        head={[
                            { children: 'Pool', flexSize: 6 },
                            {
                                children: 'TVL',
                                sort: {
                                    onClick: () =>
                                        changeSort(
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
                                children: 'Fee',
                                flexSize: 1.5,
                                align: CellAlign.Right,
                            },
                            {
                                children: 'Daily reward',
                                sort: {
                                    onClick: () =>
                                        changeSort(
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
                                        changeSort(
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
                                        changeSort(
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
                            mobileBackground: COLORS.lightGray,
                            rowItems: [
                                {
                                    children: (
                                        <Market
                                            assets={pool.assets}
                                            mobileVerticalDirections
                                            withoutLink
                                            poolType={pool.pool_type as POOL_TYPE}
                                            isRewardsOn={Boolean(Number(pool.reward_tps))}
                                        />
                                    ),
                                    flexSize: 6,
                                },
                                {
                                    children: pool.liquidity_usd
                                        ? `$${formatBalance(
                                              Number(pool.liquidity_usd) / 1e7,
                                              true,
                                          )}`
                                        : '0',
                                    label: 'TVL:',
                                    align: CellAlign.Right,
                                    flexSize: 2,
                                },
                                {
                                    children: `${(Number(pool.fee) * 100).toFixed(2)}%`,
                                    label: 'Fee:',
                                    flexSize: 1.5,
                                    align: CellAlign.Right,
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
