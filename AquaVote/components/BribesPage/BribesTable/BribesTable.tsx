import * as React from 'react';
import styled from 'styled-components';
import { flexAllCenter, flexRowSpaceBetween, respondDown } from '../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../common/styles';
import Button from '../../../../common/basics/Button';
import Plus from '../../../../common/assets/img/icon-plus.svg';
import {
    TableBody,
    TableBodyRow,
    TableCell,
    TableHead,
    TableHeadRow,
} from '../../MainPage/Table/Table';
import Pair from '../../common/Pair';
import Asset from '../../AssetDropdown/Asset';
import { MainRoutes } from '../../../routes';
import { useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { StellarService } from '../../../../common/services/globalServices';
import PageLoader from '../../../../common/basics/PageLoader';
import { processBribes } from '../../../api/api';
import { formatBalance, getDateString } from '../../../../common/helpers/helpers';
import useAssetsStore from '../../../store/assetsStore/useAssetsStore';

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

const convertUTCToLocalDateIgnoringTimezone = (utcDate: Date) => {
    return new Date(
        utcDate.getUTCFullYear(),
        utcDate.getUTCMonth(),
        utcDate.getUTCDate(),
        utcDate.getUTCHours(),
        utcDate.getUTCMinutes(),
        utcDate.getUTCSeconds(),
        utcDate.getUTCMilliseconds(),
    );
};

const BribesTable = () => {
    const history = useHistory();

    const [claimableBalances, setClaimableBalances] = useState(null);
    const [bribes, setBribes] = useState(null);
    const [claimsLoaded, setClaimsLoaded] = useState(false);

    const { processNewAssets } = useAssetsStore();

    const processAssetsFromPairs = (pairs) => {
        const assets = pairs.reduce((acc, item) => {
            return [
                ...acc,
                { code: item.asset1_code, issuer: item.asset1_issuer },
                { code: item.asset2_code, issuer: item.asset2_issuer },
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

    if (!bribes) {
        return (
            <LoaderContainer>
                <PageLoader />
            </LoaderContainer>
        );
    }

    return (
        <Container>
            <TitleBlock>
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
                {bribes.map((item) => {
                    const [code, issuer] = item.asset.split(':');
                    const DAY = 24 * 60 * 60 * 1000;
                    const claimDateUTC = convertUTCToLocalDateIgnoringTimezone(
                        new Date(item.claimDate),
                    );
                    const startDate = new Date(
                        claimDateUTC.setDate(
                            claimDateUTC.getDate() + ((7 - claimDateUTC.getDay()) % 7) + 1,
                        ),
                    );
                    startDate.setHours(0);
                    startDate.setMinutes(0);
                    startDate.setSeconds(0);
                    startDate.setMilliseconds(0);
                    const start = startDate.getTime();
                    const end = start + 7 * DAY;
                    return (
                        <TableBodyRow key={item.paging_token}>
                            <PairCell>
                                <Pair
                                    base={{ code: item.asset1_code, issuer: item.asset1_issuer }}
                                    counter={{ code: item.asset2_code, issuer: item.asset2_issuer }}
                                    mobileVerticalDirections
                                />
                            </PairCell>
                            <BribeAssetCell>
                                <label>Reward asset:</label>
                                <WebAsset asset={{ code, issuer }} />
                                <MobileAsset asset={{ code, issuer }} inRow withMobileView />
                            </BribeAssetCell>
                            <Cell>
                                <label>Reward per day:</label>
                                {formatBalance(+item.amount / 7, true)} {code}
                            </Cell>

                            <Cell>
                                <label>Period:</label>
                                {getDateString(start, {
                                    withoutYear: true,
                                })}{' '}
                                - {getDateString(end)}
                            </Cell>
                        </TableBodyRow>
                    );
                })}
            </TableBody>
        </Container>
    );
};

export default BribesTable;
