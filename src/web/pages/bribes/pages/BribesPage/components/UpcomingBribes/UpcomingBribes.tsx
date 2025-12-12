import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BribeSortFields, getUpcomingBribes } from 'api/bribes';

import { BRIBES_PAGE_SIZE } from 'constants/bribes';
import { AppRoutes } from 'constants/routes';

import { convertDateStrToTimestamp, getDateString } from 'helpers/date';
import { formatBalance } from 'helpers/format-number';
import { getIceMaxApy } from 'helpers/ice';
import { createAsset } from 'helpers/token';

import useAssetsStore from 'store/assetsStore/useAssetsStore';

import PageLoader from 'basics/loaders/PageLoader';
import Market from 'basics/Market';
import Pagination from 'basics/Pagination';
import Table, { CellAlign } from 'basics/Table';

import {
    CheckboxStyled,
    Container,
    LoaderContainer,
    MobileAsset,
    SelectStyled,
    WebAsset,
} from './UpcomingBribes.styled';

const SORT_OPTIONS = [
    { label: 'Sort by: Period ▲', value: BribeSortFields.startAtDown },
    { label: 'Sort by: Period ▼', value: BribeSortFields.startAtUp },
    { label: 'Sort by: Reward ▲', value: BribeSortFields.aquaAmountDown },
    { label: 'Sort by: Reward ▼', value: BribeSortFields.aquaAmountUp },
];

const UpcomingBribes = () => {
    const [bribes, setBribes] = useState(null);
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(null);
    const [sort, setSort] = useState(BribeSortFields.startAtDown);
    const [filterByAmount, setFilterByAmount] = useState(false);
    const [page, setPage] = useState(1);

    const navigate = useNavigate();

    const { processNewAssets } = useAssetsStore();

    const containerRef = useRef(null);

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
        getUpcomingBribes(BRIBES_PAGE_SIZE, page, sort, !filterByAmount).then(res => {
            setCount(res.count);
            setBribes(res.bribes);
            processAssetsFromPairs(res.bribes);
            setLoading(false);
        });
    }, [page, filterByAmount, sort]);

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
            <CheckboxStyled
                label="Show bribes smaller than 100,000 AQUA"
                checked={filterByAmount}
                onChange={value => {
                    setFilterByAmount(value);
                    setPage(1);
                }}
            />

            <SelectStyled options={SORT_OPTIONS} value={sort} onChange={changeSort} />

            <Table
                pending={bribes && loading}
                head={[
                    { children: 'Market', flexSize: 3 },
                    {
                        children: 'Bribe APY',
                    },
                    { children: 'Reward asset', flexSize: 2 },
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
                                flexSize: 3,
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
                                flexSize: 2,
                            },
                            {
                                children: `${formatBalance(+item.amount / 7, true)} ${
                                    rewardAsset.code
                                }`,
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
