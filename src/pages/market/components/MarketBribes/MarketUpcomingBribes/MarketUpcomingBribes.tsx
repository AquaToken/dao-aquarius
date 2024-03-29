import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../../../common/styles';
import { getUpcomingBribesForMarket } from '../../../../vote/api/api';
import PageLoader from '../../../../../common/basics/PageLoader';
import Asset from '../../../../vote/components/AssetDropdown/Asset';
import { StellarService } from '../../../../../common/services/globalServices';
import { formatBalance, getDateString } from '../../../../../common/helpers/helpers';
import { convertUTCToLocalDateIgnoringTimezone } from '../../../../bribes/pages/AddBribePage';
import Table, { CellAlign } from '../../../../../common/basics/Table';

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
            <Table
                head={[
                    { children: 'Reward asset', flexSize: 4 },
                    { children: 'Reward per day', flexSize: 2 },
                    { children: 'AQUA amount', align: CellAlign.Right, flexSize: 2 },
                    { children: 'Period', flexSize: 3, align: CellAlign.Right },
                ]}
                body={bribes.map((bribe) => {
                    const startUTC = convertUTCToLocalDateIgnoringTimezone(
                        new Date(bribe.start_at),
                    );
                    const stopUTC = convertUTCToLocalDateIgnoringTimezone(new Date(bribe.stop_at));
                    return {
                        key: bribe.asset_code + bribe.asset_issuer + startUTC,
                        isNarrow: true,
                        mobileBackground: COLORS.lightGray,
                        rowItems: [
                            {
                                children: (
                                    <Asset
                                        asset={StellarService.createAsset(
                                            bribe.asset_code,
                                            bribe.asset_issuer,
                                        )}
                                        inRow
                                        withMobileView
                                    />
                                ),
                                label: 'Reward asset:',
                                flexSize: 4,
                            },
                            {
                                children: `${formatBalance(+bribe.amount / 7, true)} ${
                                    bribe.asset_code
                                }`,
                                label: 'Reward per day:',
                                flexSize: 2,
                            },
                            {
                                children: `${formatBalance(
                                    +bribe.aqua_total_reward_amount_equivalent / 7,
                                    true,
                                )} AQUA`,
                                label: 'AQUA amount:',
                                align: CellAlign.Right,
                                flexSize: 2,
                            },
                            {
                                children: `${getDateString(startUTC.getTime(), {
                                    withoutYear: true,
                                })} - ${getDateString(stopUTC.getTime() - 1)}`,
                                label: 'Period:',
                                flexSize: 3,
                                align: CellAlign.Right,
                            },
                        ],
                    };
                })}
            />
        </Container>
    );
};

export default MarketUpcomingBribes;
