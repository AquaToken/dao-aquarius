import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { MarketRoutes } from 'constants/routes';

import { convertLocalDateToUTCIgnoringTimezone, getDateString } from 'helpers/date';
import { formatBalance } from 'helpers/format-number';

import useAssetsStore from 'store/assetsStore/useAssetsStore';

import { StellarService } from 'services/globalServices';

import Checkbox from 'web/basics/inputs/Checkbox';
import Select from 'web/basics/inputs/Select';
import PageLoader from 'web/basics/loaders/PageLoader';
import { flexAllCenter, flexColumn, respondDown } from 'web/mixins';
import { Breakpoints } from 'web/styles';

import Asset from 'basics/Asset';
import Market from 'basics/Market';
import Pagination from 'basics/Pagination';
import Table, { CellAlign } from 'basics/Table';

import { BribeSortFields, getUpcomingBribes } from 'pages/bribes/api/api';

const Container = styled.div`
    ${flexColumn};
`;

const WebAsset = styled(Asset)`
    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const MobileAsset = styled(Asset)`
    display: none;

    ${respondDown(Breakpoints.md)`
        display: flex;
    `}
`;

const LoaderContainer = styled.div`
    ${flexAllCenter};
    margin: 5rem 0;
`;

const CheckboxStyled = styled(Checkbox)`
    margin-bottom: 3rem;
`;

const SelectStyled = styled(Select)`
    display: none;
    margin-bottom: 3rem;

    ${respondDown(Breakpoints.md)`
          display: flex;
      `}
`;

const PAGE_SIZE = 20;
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

    const history = useHistory();

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
            const rewardAsset = StellarService.createAsset(item.asset_code, item.asset_issuer);
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
        getUpcomingBribes(PAGE_SIZE, page, sort, !filterByAmount).then(res => {
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
        history.push(`${MarketRoutes.main}/${asset1}/${asset2}`);
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
                    const startUTC = convertLocalDateToUTCIgnoringTimezone(new Date(item.start_at));
                    const stopUTC = convertLocalDateToUTCIgnoringTimezone(new Date(item.stop_at));
                    const base = {
                        code: item.asset1_code,
                        issuer: item.asset1_issuer,
                    };
                    const counter = {
                        code: item.asset2_code,
                        issuer: item.asset2_issuer,
                    };
                    const rewardAsset = StellarService.createAsset(
                        item.asset_code,
                        item.asset_issuer,
                    );

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
                                children: `${getDateString(startUTC.getTime(), {
                                    withoutYear: true,
                                })} - ${getDateString(stopUTC.getTime() - 1)}`,
                                label: 'Period:',
                            },
                        ],
                    };
                })}
            />

            <Pagination
                pageSize={PAGE_SIZE}
                totalCount={count}
                onPageChange={setPage}
                currentPage={page}
                itemName="bribes"
            />
        </Container>
    );
};

export default UpcomingBribes;
