import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { getUpcomingBribes } from 'api/bribes';

import {
    BRIBES_PAGE_SIZE,
    BRIBES_SORT_OPTIONS,
    BRIBES_TYPES_OPTIONS,
    BribeSortFields,
    BribesTypes,
    BribesWeeksFilters,
    UpcomingBribesParams,
} from 'constants/bribes';
import { AppRoutes } from 'constants/routes';

import { getAquaAssetData, getAssetString } from 'helpers/assets';
import { convertDateStrToTimestamp, getDateString, getWeekStart } from 'helpers/date';
import { formatBalance } from 'helpers/format-number';
import { getIceMaxApy } from 'helpers/ice';
import { createAsset } from 'helpers/token';

import { useUrlParam } from 'hooks/useUrlParam';

import useAssetsStore from 'store/assetsStore/useAssetsStore';

import { Checkbox } from 'basics/inputs';
import { ExternalLink } from 'basics/links';
import PageLoader from 'basics/loaders/PageLoader';
import Market from 'basics/Market';
import Pagination from 'basics/Pagination';
import Table, { CellAlign } from 'basics/Table';

import { Breakpoints } from 'styles/style-constants';

import {
    Amounts,
    Container,
    Empty,
    Filters,
    FilterSelect,
    LoaderContainer,
    MobileAsset,
    SelectStyled,
    WebAsset,
} from './UpcomingBribes.styled';

const BRIBES_WEEKS_OPTIONS = [
    {
        label: 'All',
        value: BribesWeeksFilters.all,
    },
    {
        label: 'Next Week',
        value: getWeekStart(1),
    },
    {
        label: 'In 2 Weeks',
        value: getWeekStart(2),
    },
    {
        label: 'In 3 Weeks',
        value: getWeekStart(3),
    },
];

const UpcomingBribes = () => {
    const [bribes, setBribes] = useState(null);
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(null);
    const [page, setPage] = useState(1);

    const { aquaAssetString } = getAquaAssetData();

    const { value: sort, setValue: setSort } = useUrlParam<BribeSortFields>(
        UpcomingBribesParams.sort,
        BribeSortFields.startAtUp,
    );

    const { value: minBribeAmount, setValue: setMinBribeAmount } = useUrlParam<string>(
        UpcomingBribesParams.minBribeAmount,
        '100000',
    );

    const { value: weekFilter, setValue: setWeekFilter } = useUrlParam<BribesWeeksFilters>(
        UpcomingBribesParams.week,
        BribesWeeksFilters.all,
    );

    const { value: type, setValue: setType } = useUrlParam<BribesTypes>(
        UpcomingBribesParams.type,
        BribesTypes.all,
    );

    const navigate = useNavigate();

    const { processNewAssets } = useAssetsStore();

    const containerRef = useRef(null);

    const location = useLocation();

    // Reset week filter if there not exist in options
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const weekParam = params.get(UpcomingBribesParams.week);

        if (!BRIBES_WEEKS_OPTIONS.some(({ value }) => value === weekParam)) {
            setWeekFilter(BribesWeeksFilters.all);
        }
    }, [location]);

    useEffect(() => {
        if (!bribes?.length || !containerRef.current) {
            return;
        }
        containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [page]);

    const processAssetsFromPairs = bribes => {
        const assets = bribes.reduce((acc, item) => {
            const rewardAsset = createAsset(item.asset_code, item.asset_issuer);
            return [
                ...acc,
                { code: item.asset1_code, issuer: item.asset1_issuer },
                { code: item.asset2_code, issuer: item.asset2_issuer },
                rewardAsset,
            ];
        }, []);

        processNewAssets(assets);
    };

    useEffect(() => {
        setLoading(true);
        getUpcomingBribes(
            BRIBES_PAGE_SIZE,
            page,
            sort as BribeSortFields,
            minBribeAmount,
            weekFilter,
            type as BribesTypes,
        ).then(res => {
            setCount(res.count);
            setBribes(res.bribes);
            processAssetsFromPairs(res.bribes);
            setLoading(false);
        });
    }, [page, minBribeAmount, sort, weekFilter, type]);

    const changeSort = newSort => {
        setSort(newSort);
        setPage(1);
    };

    const goToMarketPage = ({ asset1, asset2 }) => {
        navigate(
            AppRoutes.section.market.to.market({
                base: asset1,
                counter: asset2,
            }),
        );
    };

    if (!bribes) {
        return (
            <LoaderContainer>
                <PageLoader />
            </LoaderContainer>
        );
    }

    return (
        <Container ref={containerRef}>
            <Filters>
                Type:
                <FilterSelect value={type} options={BRIBES_TYPES_OPTIONS} onChange={setType} />
                Week:
                <FilterSelect
                    label="Week"
                    value={weekFilter}
                    options={BRIBES_WEEKS_OPTIONS}
                    onChange={setWeekFilter}
                />
                <Checkbox
                    label="Show bribes smaller than 100,000 AQUA"
                    checked={Number(minBribeAmount) === 0}
                    onChange={value => {
                        setMinBribeAmount(value ? '0' : '100000');
                        setPage(1);
                    }}
                />
            </Filters>

            <SelectStyled options={BRIBES_SORT_OPTIONS} value={sort} onChange={changeSort} />

            {!!bribes && !!bribes.length ? (
                <Table
                    pending={bribes && loading}
                    mobileBreakpoint={Breakpoints.lg}
                    head={[
                        { children: 'Market', flexSize: 2.5 },
                        {
                            children: 'Bribe APY',
                        },
                        { children: 'Reward asset', flexSize: 1.5 },
                        {
                            children: 'Reward per day',
                            sort: {
                                onClick: () =>
                                    changeSort(
                                        sort === BribeSortFields.aquaAmountUp
                                            ? BribeSortFields.aquaAmountDown
                                            : BribeSortFields.aquaAmountUp,
                                    ),
                                isEnabled:
                                    sort === BribeSortFields.aquaAmountUp ||
                                    sort === BribeSortFields.aquaAmountDown,
                                isReversed: sort === BribeSortFields.aquaAmountDown,
                            },
                        },
                        {
                            children: 'Period',
                            align: CellAlign.Center,
                            sort: {
                                onClick: () =>
                                    changeSort(
                                        sort === BribeSortFields.startAtUp
                                            ? BribeSortFields.startAtDown
                                            : BribeSortFields.startAtUp,
                                    ),
                                isEnabled:
                                    sort === BribeSortFields.startAtUp ||
                                    sort === BribeSortFields.startAtDown,
                                isReversed: sort === BribeSortFields.startAtDown,
                            },
                        },
                    ]}
                    body={bribes.map(item => {
                        const startUTC = convertDateStrToTimestamp(item.start_at);
                        const stopUTC = convertDateStrToTimestamp(item.stop_at);
                        const base = createAsset(item.asset1_code, item.asset1_issuer);
                        const counter = createAsset(item.asset2_code, item.asset2_issuer);
                        const rewardAsset = createAsset(item.asset_code, item.asset_issuer);

                        const apy = item.upvote_value
                            ? (item.aqua_total_reward_amount_equivalent /
                                  7 /
                                  Number(item.upvote_value) +
                                  1) **
                                  365 -
                              1
                            : 0;
                        const MAX_APY_VALUE = 1e6; // 1B
                        const apyMax = Math.min(getIceMaxApy({ apy }), MAX_APY_VALUE);

                        return {
                            onRowClick: () => goToMarketPage(item),
                            key: item.claimable_balance_id,
                            rowItems: [
                                {
                                    children: (
                                        <Market
                                            assets={[base, counter]}
                                            mobileVerticalDirections
                                            withoutLink
                                            isAmmBribes={item.is_amm_protocol}
                                            isPrivateBribes={!item.is_amm_protocol}
                                        />
                                    ),
                                    flexSize: 2.5,
                                },
                                {
                                    children: apyMax
                                        ? `up to ${apyMax === MAX_APY_VALUE ? '>' : ''}${formatBalance(
                                              apyMax,
                                              true,
                                          )}%`
                                        : '-',
                                    label: 'Bribe APY:',
                                },
                                {
                                    children: (
                                        <>
                                            <WebAsset asset={rewardAsset} />
                                            <MobileAsset asset={rewardAsset} inRow withMobileView />
                                        </>
                                    ),
                                    label: 'Reward asset:',
                                    flexSize: 1.5,
                                },
                                {
                                    children: (
                                        <Amounts>
                                            <span>
                                                {formatBalance(+item.amount / 7, true)}{' '}
                                                {rewardAsset.code}
                                            </span>
                                            {aquaAssetString !== getAssetString(rewardAsset) && (
                                                <span>
                                                    ≈{' '}
                                                    {formatBalance(
                                                        +item.aqua_total_reward_amount_equivalent /
                                                            7,
                                                        true,
                                                    )}{' '}
                                                    AQUA
                                                </span>
                                            )}
                                        </Amounts>
                                    ),
                                    label: 'Reward per day:',
                                },
                                {
                                    children: `${getDateString(startUTC, {
                                        withoutYear: true,
                                    })} - ${getDateString(stopUTC - 1)}`,
                                    label: 'Period:',
                                },
                            ],
                        };
                    })}
                />
            ) : (
                <Empty>
                    <h3>There's nothing here.</h3>
                    <span>It looks like there are no upcoming bribes.</span>

                    <ExternalLink asDiv>
                        <Link to={AppRoutes.section.bribes.link.addBribe}>Create Bribe</Link>
                    </ExternalLink>
                </Empty>
            )}

            <Pagination
                pageSize={BRIBES_PAGE_SIZE}
                totalCount={count}
                onPageChange={setPage}
                currentPage={page}
                itemName="bribes"
            />
        </Container>
    );
};

export default UpcomingBribes;
