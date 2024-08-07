import * as React from 'react';
import { useEffect, useState } from 'react';
import { FilterOptions, getPools, getTotalStats, PoolsSortFields } from '../api/api';
import styled from 'styled-components';
import {
    commonMaxWidth,
    flexAllCenter,
    flexRowSpaceBetween,
    respondDown,
} from '../../../common/mixins';
import PageLoader from '../../../common/basics/PageLoader';
import Button from '../../../common/basics/Button';
import Plus from '../../../common/assets/img/icon-plus.svg';
import Search from '../../../common/assets/img/icon-search.svg';
import Info from '../../../common/assets/img/icon-info.svg';
import { Breakpoints, COLORS } from '../../../common/styles';
import Input from '../../../common/basics/Input';
import ToggleGroup from '../../../common/basics/ToggleGroup';
import Table, { CellAlign } from '../../../common/basics/Table';
import Pair from '../../vote/components/common/Pair';
import { AmmRoutes } from '../../../routes';
import { useHistory } from 'react-router-dom';
import { formatBalance } from '../../../common/helpers/helpers';
import Pagination from '../../../common/basics/Pagination';
import useAuthStore from '../../../store/authStore/useAuthStore';
import { ModalService, StellarService } from '../../../common/services/globalServices';
import ChooseLoginMethodModal from '../../../common/modals/ChooseLoginMethodModal';
import { useDebounce } from '../../../common/hooks/useDebounce';
import { Empty } from '../../profile/YourVotes/YourVotes';
import Select from '../../../common/basics/Select';
import VolumeChart from '../components/VolumeChart/VolumeChart';
import LiquidityChart from '../components/LiquidityChart/LiquidityChart';
import { PoolProcessed } from '../api/types';
import Tooltip, { TOOLTIP_POSITION } from '../../../common/basics/Tooltip';

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
    flex: 1 0 auto;
    background-color: ${COLORS.lightGray};

    ${respondDown(Breakpoints.sm)`
        padding: 2rem 1.6rem 0;
    `}
`;

const Section = styled.div`
    flex: 1 0 auto;
    ${flexAllCenter};
    background-color: ${COLORS.white};
    width: 100%;
    margin-bottom: 5rem;
`;

const Header = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 6.4rem;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        gap: 5rem;
    `}
`;

const Title = styled.h1`
    font-size: 5.6rem;
    font-weight: 700;
    line-height: 6.4rem;
`;

const PlusIcon = styled(Plus)`
    width: 1.6rem;
    height: 1.6rem;
    margin-left: 1rem;
`;

const TableBlock = styled.div`
    padding: 5.2rem 3.2rem;
    width: 100%;

    ${respondDown(Breakpoints.sm)`
        padding: 3rem 1.6rem;
    `}
`;

const TableHeader = styled.div`
    ${flexRowSpaceBetween};

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        gap: 5rem;
    `}
`;

const TableTitle = styled.h3`
    font-size: 3.6rem;
    font-weight: 400;
    line-height: 4.2rem;
`;

const StyledInput = styled(Input)`
    width: 56rem;

    ${respondDown(Breakpoints.sm)`
        width: 100%;
    `}
`;

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

const Charts = styled.div`
    display: flex;
    justify-content: space-evenly;
    gap: 1.6rem;
    padding: 3rem 0;

    ${respondDown(Breakpoints.xl)`
        flex-direction: column;
    `}
`;

const Chart = styled.div`
    ${flexAllCenter};
    background-color: ${COLORS.lightGray};
    padding: 1.6rem;
    border-radius: 0.6rem;
    flex: 1;

    ${respondDown(Breakpoints.xl)`
        flex-direction: column;
        background-color: ${COLORS.white};
    `}
`;

const OPTIONS = [
    { label: 'All', value: FilterOptions.all },
    { label: 'Stable swap', value: FilterOptions.stable },
    { label: 'Constant product', value: FilterOptions.constant },
];

const PAGE_SIZE = 10;
const Analytics = () => {
    const [filter, setFilter] = useState(FilterOptions.all);
    const [sort, setSort] = useState(PoolsSortFields.liquidityUp);
    const [pools, setPools] = useState<PoolProcessed[] | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pending, setPending] = useState(false);
    const [search, setSearch] = useState('');
    const [totalStats, setTotalStats] = useState(null);

    const debouncedSearch = useDebounce(search, 700, true);
    const history = useHistory();

    const { isLogged } = useAuthStore();

    useEffect(() => {
        getTotalStats().then((res) => {
            setTotalStats(res);
        });
    }, []);

    useEffect(() => {
        setPage(1);
    }, [filter]);

    useEffect(() => {
        setPending(true);
        getPools(filter, page, PAGE_SIZE, sort, debouncedSearch).then(({ pools, total }) => {
            setPools(pools);
            setTotal(total);
            setPending(false);
        });
    }, [filter, page, debouncedSearch, sort]);

    const changeSort = (newSort) => {
        setSort(newSort);
        setPage(1);
    };

    const goToPoolPage = (id) => {
        history.push(`${AmmRoutes.analytics}${id}/`);
    };

    const goToCreatePool = () => {
        if (!isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {
                redirectURL: AmmRoutes.create,
            });
            return;
        }
        history.push(`${AmmRoutes.create}`);
    };

    return (
        <Container>
            <Content>
                <Header>
                    <Title>Pools</Title>
                    <Button onClick={() => goToCreatePool()}>
                        create pool <PlusIcon />
                    </Button>
                </Header>

                {totalStats && (
                    <Section>
                        <Charts>
                            <Chart>
                                <VolumeChart
                                    data={totalStats}
                                    isGlobalStat
                                    width={Math.min(576, +window.innerWidth - 64)}
                                    height={320}
                                />
                            </Chart>
                            <Chart>
                                <LiquidityChart
                                    data={totalStats}
                                    width={Math.min(576, +window.innerWidth - 64)}
                                    height={320}
                                />
                            </Chart>
                        </Charts>
                    </Section>
                )}

                <Section>
                    {!pools || !StellarService.priceLumenUsd ? (
                        <PageLoader />
                    ) : (
                        <TableBlock>
                            <TableHeader>
                                <TableTitle>Top pools</TableTitle>
                                <StyledInput
                                    placeholder="Search by token name or token address"
                                    value={search}
                                    onChange={({ target }) => setSearch(target.value)}
                                    postfix={<Search />}
                                />
                            </TableHeader>
                            <ToggleGroupStyled
                                value={filter}
                                options={OPTIONS}
                                onChange={setFilter}
                            />
                            <SelectStyled value={filter} options={OPTIONS} onChange={setFilter} />
                            {pools.length ? (
                                <>
                                    <Table
                                        pending={pending}
                                        head={[
                                            { children: 'Assets', flexSize: 4 },
                                            {
                                                children: 'Fee',
                                                flexSize: 2,
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
                                                    isReversed:
                                                        sort === PoolsSortFields.rewardsDown,
                                                },
                                                flexSize: 2,
                                                align: CellAlign.Right,
                                            },
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
                                                    isReversed:
                                                        sort === PoolsSortFields.liquidityDown,
                                                },
                                                align: CellAlign.Right,
                                                flexSize: 2,
                                            },
                                            {
                                                children: (
                                                    <TitleWithTooltip>
                                                        LP APY
                                                        <Tooltip
                                                            showOnHover
                                                            content={
                                                                <TooltipInner>
                                                                    Projection of annual yield for
                                                                    liquidity providers. The yield
                                                                    is accrued based on the LP token
                                                                    price growth in relation to the
                                                                    deposited tokens, and is
                                                                    generated via swap fees. This
                                                                    type of reward is paid to all
                                                                    liquidity providers in all
                                                                    pools.
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
                                                                    Projection of additional annual
                                                                    rewards in AQUA distributed by
                                                                    Aquarius team. These rewards are
                                                                    paid to liquidity providers to
                                                                    pools that are included to the
                                                                    "rewards zone" - now it's done
                                                                    by the Aquarius team but later
                                                                    will be based on users' voting.
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
                                                    isReversed:
                                                        sort === PoolsSortFields.rewardsApyDown,
                                                },
                                                flexSize: 2,
                                                align: CellAlign.Right,
                                            },
                                        ]}
                                        body={pools.map((pool) => ({
                                            key: pool.address,
                                            onRowClick: () => goToPoolPage(pool.address),
                                            mobileBackground: COLORS.lightGray,
                                            rowItems: [
                                                {
                                                    children: (
                                                        <Pair
                                                            base={pool.assets[0]}
                                                            counter={pool.assets[1]}
                                                            thirdAsset={pool.assets[2]}
                                                            fourthAsset={pool.assets[3]}
                                                            mobileVerticalDirections
                                                            withoutLink
                                                            customLabel={[
                                                                pool.pool_type === 'stable'
                                                                    ? 'Stable swap'
                                                                    : 'Constant product',
                                                                pool.pool_type === 'stable'
                                                                    ? 'Highly effecient AMM model for correlated assets (i.e.stablecoins) that offers lower slippage.'
                                                                    : 'Simple model for general purpose AMM pools (Uniswap v2).',
                                                            ]}
                                                        />
                                                    ),
                                                    flexSize: 4,
                                                },

                                                {
                                                    children: `${(Number(pool.fee) * 100).toFixed(
                                                        2,
                                                    )}%`,
                                                    label: 'Fee:',
                                                    flexSize: 2,
                                                    align: CellAlign.Right,
                                                },
                                                {
                                                    children: pool.reward_tps
                                                        ? `${formatBalance(
                                                              (+pool.reward_tps / 1e7) *
                                                                  60 *
                                                                  60 *
                                                                  24,
                                                              true,
                                                          )} AQUA`
                                                        : '-',
                                                    label: 'Daily reward:',
                                                    flexSize: 2,
                                                    align: CellAlign.Right,
                                                },
                                                {
                                                    children: pool.liquidity
                                                        ? `$${formatBalance(
                                                              (Number(pool.liquidity) / 1e7) *
                                                                  StellarService.priceLumenUsd,
                                                              true,
                                                          )}`
                                                        : '0',
                                                    label: 'TVL:',
                                                    align: CellAlign.Right,
                                                    flexSize: 2,
                                                },
                                                {
                                                    children: `${(Number(pool.apy) * 100).toFixed(
                                                        2,
                                                    )}%`,
                                                    label: (
                                                        <TitleWithTooltip>
                                                            LP APY
                                                            <Tooltip
                                                                showOnHover
                                                                content={
                                                                    <TooltipInner>
                                                                        Projection of annual yield
                                                                        for liquidity providers. The
                                                                        yield is accrued based on
                                                                        the LP token price growth in
                                                                        relation to the deposited
                                                                        tokens, and is generated via
                                                                        swap fees. This type of
                                                                        reward is paid to all
                                                                        liquidity providers in all
                                                                        pools.
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
                                                    children: `${(
                                                        Number(pool.rewards_apy) * 100
                                                    ).toFixed(2)}%`,
                                                    label: (
                                                        <TitleWithTooltip>
                                                            Rewards APY
                                                            <Tooltip
                                                                showOnHover
                                                                content={
                                                                    <TooltipInner>
                                                                        Projection of additional
                                                                        annual rewards in AQUA
                                                                        distributed by Aquarius
                                                                        team. These rewards are paid
                                                                        to liquidity providers to
                                                                        pools that are included to
                                                                        the "rewards zone" - now
                                                                        it's done by the Aquarius
                                                                        team but later will be based
                                                                        on users' voting.
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
                        </TableBlock>
                    )}
                </Section>
            </Content>
        </Container>
    );
};

export default Analytics;
