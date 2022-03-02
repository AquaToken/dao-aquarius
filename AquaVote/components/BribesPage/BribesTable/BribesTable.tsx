import * as React from 'react';
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
import { useEffect, useRef, useState } from 'react';
import { StellarService } from '../../../../common/services/globalServices';
import PageLoader from '../../../../common/basics/PageLoader';
import { processBribes } from '../../../api/api';
import { formatBalance, getDateString } from '../../../../common/helpers/helpers';
import useAssetsStore from '../../../store/assetsStore/useAssetsStore';
import Pagination from '../../../../common/basics/Pagination';
import { convertUTCToLocalDateIgnoringTimezone } from '../../AddBribePage/AddBribePage';
import {
    endOfWeek,
    isBefore,
    isEqual,
    nextMonday,
    nextSunday,
    startOfDay,
    startOfWeek,
} from 'date-fns';

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
    margin-bottom: 8.3rem;

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

const getBribePeriod = (claim) => {
    const claimDate = convertUTCToLocalDateIgnoringTimezone(new Date(claim));
    const collectDate = startOfDay(nextSunday(startOfWeek(claimDate, { weekStartsOn: 1 })));

    const start =
        isEqual(claimDate, collectDate) || isBefore(claimDate, collectDate)
            ? startOfDay(nextMonday(claimDate))
            : startOfDay(nextMonday(nextMonday(claimDate)));

    const end = endOfWeek(start, { weekStartsOn: 1 });

    return { start, end };
};

const PAGE_SIZE = 20;

const BribesTable = () => {
    const history = useHistory();

    const [claimableBalances, setClaimableBalances] = useState(null);
    const [bribes, setBribes] = useState(null);
    const [claimsLoaded, setClaimsLoaded] = useState(false);

    const [page, setPage] = useState(1);

    const { processNewAssets } = useAssetsStore();

    const processAssetsFromPairs = (pairs) => {
        const assets = pairs.reduce((acc, item) => {
            const [code, issuer] = item.asset.split(':');
            const rewardAsset =
                code === 'native'
                    ? StellarService.createLumen()
                    : StellarService.createAsset(code, issuer);
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
        const limit = 200;
        StellarService.getBribes(limit).then((res) => {
            setClaimableBalances(res.records);

            getNextBribes(res, limit);
        });
    }, []);

    const getNextBribes = (collection, limit) => {
        if (collection.records.length < limit) {
            setClaimsLoaded(true);
            return;
        }

        collection.next().then((res) => {
            setClaimableBalances((prev) => [...prev, ...res.records]);
            getNextBribes(res, limit);
        });
    };

    useEffect(() => {
        if (!claimsLoaded) {
            return;
        }
        processBribes(claimableBalances).then((res) => {
            setBribes(res);
            processAssetsFromPairs(res);
        });
    }, [claimsLoaded]);

    const headerRef = useRef(null);

    useEffect(() => {
        if (!bribes?.length || !headerRef.current) {
            return;
        }
        headerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [page]);

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

            <TableHead>
                <TableHeadRow>
                    <PairCell>Market Pair</PairCell>
                    <BribeAssetCell>Reward asset</BribeAssetCell>
                    <Cell>Reward per day</Cell>
                    <Cell>Period</Cell>
                </TableHeadRow>
            </TableHead>
            <TableBody>
                {bribes
                    .slice((page - 1) * PAGE_SIZE, (page - 1) * PAGE_SIZE + PAGE_SIZE)
                    .map((item) => {
                        const [code, issuer] = item.asset.split(':');
                        const rewardAsset =
                            code === 'native'
                                ? StellarService.createLumen()
                                : StellarService.createAsset(code, issuer);

                        const { start, end } = getBribePeriod(item.claimDate);
                        return (
                            <TableBodyRowWrap key={item.paging_token}>
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
                                        {getDateString(start.getTime(), {
                                            withoutYear: true,
                                        })}{' '}
                                        - {getDateString(end.getTime())}
                                    </Cell>
                                </TableBodyRow>
                            </TableBodyRowWrap>
                        );
                    })}
            </TableBody>
            <Pagination
                pageSize={PAGE_SIZE}
                totalCount={bribes.length}
                onPageChange={setPage}
                currentPage={page}
                itemName="bribes"
            />
        </Container>
    );
};

export default BribesTable;
