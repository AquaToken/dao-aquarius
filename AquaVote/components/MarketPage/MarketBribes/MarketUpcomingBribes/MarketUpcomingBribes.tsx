import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../../../common/styles';
import { useEffect, useState } from 'react';
import { getUpcomingBribesForMarket } from '../../../../api/api';
import PageLoader from '../../../../../common/basics/PageLoader';
import { TableBody, TableHead, TableHeadRow } from '../../../MainPage/Table/Table';
import { RightAlignedCell, TableCell } from '../../../MainPage/BribesModal/BribesModal';
import Asset from '../../../AssetDropdown/Asset';
import { StellarService } from '../../../../../common/services/globalServices';
import { formatBalance, getDateString } from '../../../../../common/helpers/helpers';
import { TableBodyRow } from '../MarketCurrentBribes/MarketCurrentBribes';
import { convertUTCToLocalDateIgnoringTimezone } from '../../../AddBribePage/AddBribePage';

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

const Loader = styled.div`
    display: flex;
    padding: 5rem 0;
`;

const Description = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.descriptionText};
    opacity: 0.7;
    margin-bottom: 3.2rem;
`;

const AssetCell = styled(TableCell)`
    flex: 4;
`;

const PeriodCell = styled(RightAlignedCell)`
    flex: 3;
`;

const MarketUpcomingBribes = ({ marketKey }) => {
    const [bribes, setBribes] = useState(null);

    useEffect(() => {
        getUpcomingBribesForMarket(marketKey)
            .then((res) => {
                setBribes(res);
            })
            .catch(() => {
                setBribes([]);
            });
    }, []);

    if (!bribes) {
        return (
            <Loader>
                <PageLoader />
            </Loader>
        );
    }

    if (!bribes.length) {
        return (
            <Container>
                <Description>There are no upcoming bribes yet</Description>
            </Container>
        );
    }

    return (
        <Container>
            <Description>Upcoming bribes</Description>
            <TableHead>
                <TableHeadRow>
                    <AssetCell>Reward asset</AssetCell>
                    <TableCell>Reward per day</TableCell>
                    <RightAlignedCell>AQUA amount</RightAlignedCell>
                    <PeriodCell>Period</PeriodCell>
                </TableHeadRow>
            </TableHead>
            <TableBody>
                {bribes.map((bribe) => {
                    const startUTC = convertUTCToLocalDateIgnoringTimezone(
                        new Date(bribe.start_at),
                    );
                    const stopUTC = convertUTCToLocalDateIgnoringTimezone(new Date(bribe.stop_at));
                    return (
                        <TableBodyRow key={bribe.asset_code + bribe.asset_issuer}>
                            <AssetCell>
                                <label>Reward asset:</label>
                                <Asset
                                    asset={StellarService.createAsset(
                                        bribe.asset_code,
                                        bribe.asset_issuer,
                                    )}
                                    inRow
                                    withMobileView
                                />
                            </AssetCell>
                            <TableCell>
                                <label>Reward per day:</label>
                                {formatBalance(+bribe.amount / 7, true)} {bribe.asset_code}
                            </TableCell>
                            <RightAlignedCell>
                                <label>AQUA amount:</label>
                                {formatBalance(
                                    +bribe.aqua_total_reward_amount_equivalent / 7,
                                    true,
                                )}{' '}
                                AQUA
                            </RightAlignedCell>
                            <PeriodCell>
                                <label>Period:</label>
                                {getDateString(startUTC.getTime(), {
                                    withoutYear: true,
                                })}{' '}
                                - {getDateString(stopUTC.getTime() - 1)}
                            </PeriodCell>
                        </TableBodyRow>
                    );
                })}
            </TableBody>
        </Container>
    );
};

export default MarketUpcomingBribes;
