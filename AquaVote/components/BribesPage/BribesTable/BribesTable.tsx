import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { flexAllCenter, flexRowSpaceBetween, respondDown } from '../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../common/styles';
import Button from '../../../../common/basics/Button';
import Plus from '../../../../common/assets/img/icon-plus.svg';
import {
    TableBody,
    TableBodyRow,
    TableBodyRowWrap,
    TableCell,
    TableHead,
    TableHeadRow,
} from '../../MainPage/Table/Table';
import Pair from '../../common/Pair';
import Asset from '../../AssetDropdown/Asset';
import { MainRoutes } from '../../../routes';
import { useHistory } from 'react-router-dom';
import { StellarService } from '../../../../common/services/globalServices';
import PageLoader from '../../../../common/basics/PageLoader';
import { BribeSortFields, getBribes } from '../../../api/api';
import { formatBalance, getDateString } from '../../../../common/helpers/helpers';
import useAssetsStore from '../../../store/assetsStore/useAssetsStore';
import Pagination from '../../../../common/basics/Pagination';
import { convertUTCToLocalDateIgnoringTimezone } from '../../AddBribePage/AddBribePage';
import Checkbox from '../../../../common/basics/Checkbox';
import { IconSort } from '../../../../common/basics/Icons';
import Select from '../../../../common/basics/Select';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 8.3rem;

    ${respondDown(Breakpoints.md)`
         margin-top: 3.3rem;
    `}
`;

const TitleBlock = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 5.3rem;

    ${respondDown(Breakpoints.md)`
        margin-bottom: 2.3rem;
    `}
`;

const Title = styled.span`
    font-weight: bold;
    font-size: 5.6rem;
    line-height: 6.4rem;
    color: ${COLORS.buttonBackground};

    ${respondDown(Breakpoints.md)`
        font-weight: normal;
        font-size: 2.9rem;
        line-height: 3.4rem;
    `}
`;

const AddBribeButton = styled(Button)`
    width: 22.2rem;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const PlusIcon = styled(Plus)`
    margin-left: 1.6rem;
`;

const PairCell = styled(TableCell)`
    flex: 3;

    ${respondDown(Breakpoints.md)`
        margin-bottom: 2rem;
    `};
`;

const Cell = styled(TableCell)`
    flex: 1;

    label {
        display: none;
        color: ${COLORS.grayText};
    }

    ${respondDown(Breakpoints.md)`
          ${flexRowSpaceBetween};
          align-items: center;
          margin-bottom: 1.6rem;
          
          label {
              display: block;
           }
      `}
`;

const BribeAssetCell = styled(Cell)`
    flex: 2;
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

const SortingHeader = styled.button`
    background: none;
    border: none;
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    padding: 0;
    margin: 0;
    width: 100%;
    height: 100%;

    display: flex;
    align-items: center;
    justify-content: ${({ position }: { position?: string }) => {
        if (position === 'right') return 'flex-end';
        if (position === 'left') return 'flex-start';
        return 'center';
    }};

    color: ${COLORS.grayText};
    & > svg {
        margin-left: 0.4rem;
    }
    &:hover {
        color: ${COLORS.purple};
    }
`;

const SelectStyled = styled(Select)`
    display: none;
    margin-bottom: 3rem;

    ${respondDown(Breakpoints.md)`
          display: flex;
      `}
`;

const TableLoader = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 10;
    ${flexAllCenter};
    animation: showLoader 0.1s ease-in-out;

    @keyframes showLoader {
        0% {
            background-color: rgba(255, 255, 255, 0);
        }
        100% {
            background-color: rgba(255, 255, 255, 0.8);
        }
    }
`;

const TableBlock = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
`;

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
    { label: 'Sort by: Period ▲', value: BribeSortFields.startAtDown },
    { label: 'Sort by: Period ▼', value: BribeSortFields.startAtUp },
    { label: 'Sort by: Reward ▲', value: BribeSortFields.aquaAmountDown },
    { label: 'Sort by: Reward ▼', value: BribeSortFields.aquaAmountUp },
];

const BribesTable = () => {
    const history = useHistory();

    const [loading, setLoading] = useState(false);
    const [bribes, setBribes] = useState(null);
    const [count, setCount] = useState(null);
    const [sort, setSort] = useState(BribeSortFields.startAtDown);
    const [filterByAmount, setFilterByAmount] = useState(false);

    const [page, setPage] = useState(1);

    const { processNewAssets } = useAssetsStore();

    const processAssetsFromPairs = (bribes) => {
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
        getBribes(PAGE_SIZE, page, sort, !filterByAmount).then((res) => {
            setCount(res.count);
            setBribes(res.bribes);
            processAssetsFromPairs(res.bribes);
            setLoading(false);
        });
    }, [page, filterByAmount, sort]);

    const headerRef = useRef(null);

    useEffect(() => {
        if (!bribes?.length || !headerRef.current) {
            return;
        }
        headerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [page]);

    const changeSort = (newSort) => {
        setSort(newSort);
        setPage(1);
    };

    if (!bribes) {
        return (
            <LoaderContainer>
                <PageLoader />
            </LoaderContainer>
        );
    }

    return (
        <Container>
            <TitleBlock ref={headerRef}>
                <Title>Upcoming Bribes</Title>
                <AddBribeButton onClick={() => history.push(MainRoutes.addBribe)}>
                    <span>create bribe</span>
                    <PlusIcon />
                </AddBribeButton>
            </TitleBlock>

            <CheckboxStyled
                label={'Show bribes smaller than 100,000 AQUA'}
                checked={filterByAmount}
                onChange={(value) => {
                    setFilterByAmount(value);
                    setPage(1);
                }}
            />

            <SelectStyled options={SORT_OPTIONS} value={sort} onChange={changeSort} />

            <TableBlock>
                {bribes && loading && (
                    <TableLoader>
                        <PageLoader />
                    </TableLoader>
                )}
                <TableHead>
                    <TableHeadRow>
                        <PairCell>Market Pair</PairCell>
                        <BribeAssetCell>Reward asset</BribeAssetCell>
                        <Cell>
                            <SortingHeader
                                position="left"
                                onClick={() =>
                                    changeSort(
                                        sort === BribeSortFields.aquaAmountUp
                                            ? BribeSortFields.aquaAmountDown
                                            : BribeSortFields.aquaAmountUp,
                                    )
                                }
                            >
                                Reward per day{' '}
                                <IconSort
                                    isEnabled={
                                        sort === BribeSortFields.aquaAmountUp ||
                                        sort === BribeSortFields.aquaAmountDown
                                    }
                                    isReversed={sort === BribeSortFields.aquaAmountDown}
                                />
                            </SortingHeader>
                        </Cell>
                        <Cell>
                            <SortingHeader
                                onClick={() =>
                                    changeSort(
                                        sort === BribeSortFields.startAtUp
                                            ? BribeSortFields.startAtDown
                                            : BribeSortFields.startAtUp,
                                    )
                                }
                            >
                                Period{' '}
                                <IconSort
                                    isEnabled={
                                        sort === BribeSortFields.startAtUp ||
                                        sort === BribeSortFields.startAtDown
                                    }
                                    isReversed={sort === BribeSortFields.startAtDown}
                                />
                            </SortingHeader>
                        </Cell>
                    </TableHeadRow>
                </TableHead>
                <TableBody>
                    {bribes.map((item) => {
                        const startUTC = convertUTCToLocalDateIgnoringTimezone(
                            new Date(item.start_at),
                        );
                        const stopUTC = convertUTCToLocalDateIgnoringTimezone(
                            new Date(item.stop_at),
                        );
                        const rewardAsset = StellarService.createAsset(
                            item.asset_code,
                            item.asset_issuer,
                        );
                        return (
                            <TableBodyRowWrap key={item.claimable_balance_id}>
                                <TableBodyRow>
                                    <PairCell>
                                        <Pair
                                            base={{
                                                code: item.asset1_code,
                                                issuer: item.asset1_issuer,
                                            }}
                                            counter={{
                                                code: item.asset2_code,
                                                issuer: item.asset2_issuer,
                                            }}
                                            mobileVerticalDirections
                                        />
                                    </PairCell>
                                    <BribeAssetCell>
                                        <label>Reward asset:</label>
                                        <WebAsset asset={rewardAsset} />
                                        <MobileAsset asset={rewardAsset} inRow withMobileView />
                                    </BribeAssetCell>
                                    <Cell>
                                        <label>Reward per day:</label>
                                        {formatBalance(+item.amount / 7, true)} {rewardAsset.code}
                                    </Cell>

                                    <Cell>
                                        <label>Period:</label>
                                        {getDateString(startUTC.getTime(), {
                                            withoutYear: true,
                                        })}{' '}
                                        - {getDateString(stopUTC.getTime() - 1)}
                                    </Cell>
                                </TableBodyRow>
                            </TableBodyRowWrap>
                        );
                    })}
                </TableBody>
            </TableBlock>
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

export default BribesTable;
