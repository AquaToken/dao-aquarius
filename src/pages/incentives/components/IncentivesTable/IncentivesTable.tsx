import * as React from 'react';
import { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { getIncentives } from 'api/incentives';

import { AmmRoutes, IncentivesRoutes } from 'constants/routes';

import { tpsToDailyAmount } from 'helpers/amount';
import { convertDateStrToTimestamp, getDateString } from 'helpers/date';

import { IncentiveProcessed } from 'types/incentives';

import { EmptyList } from 'web/mixins';

import Asset from 'basics/Asset';
import { ExternalLink } from 'basics/links';
import { PageLoader } from 'basics/loaders';
import Market from 'basics/Market';
import Table from 'basics/Table';

const Wrapper = styled.div`
    padding: 2.4rem 0;
`;

const Empty = styled.div`
    ${EmptyList};
`;

interface Props {
    isActive: boolean;
}

const IncentivesTable = ({ isActive }: Props) => {
    const [incentives, setIncentives] = React.useState<IncentiveProcessed[] | null>(null);

    useEffect(() => {
        getIncentives(isActive).then(setIncentives);
    }, []);

    const history = useHistory();

    const goToPoolPage = (id: string) => {
        history.push(`${AmmRoutes.analytics}${id}/`);
    };

    if (!incentives) {
        return <PageLoader />;
    }
    return (
        <Wrapper>
            {incentives.length ? (
                <Table
                    head={[
                        { children: 'Pool', flexSize: 2.5 },
                        { children: 'Token' },
                        { children: 'Daily amount' },
                        { children: 'Period' },
                    ]}
                    body={incentives.map(incentive => {
                        const amount = tpsToDailyAmount(
                            incentive.tps,
                            incentive.tokenInstance.decimal,
                        );
                        return {
                            key: incentive.pool_address + incentive.token.address,
                            onRowClick: () => goToPoolPage(incentive.pool_address),
                            rowItems: [
                                {
                                    children: (
                                        <Market
                                            assets={incentive.pool.tokens}
                                            fee={incentive.pool.fee}
                                            poolType={incentive.pool.pool_type}
                                            withoutLink
                                            mobileVerticalDirections
                                        />
                                    ),
                                    flexSize: 2.5,
                                },
                                {
                                    children: <Asset asset={incentive.tokenInstance} logoAndCode />,
                                    label: 'Token',
                                },

                                {
                                    children: `${amount} ${incentive.tokenInstance.code}`,
                                    label: 'Daily amount',
                                },
                                {
                                    children: `${getDateString(
                                        convertDateStrToTimestamp(incentive.start_at_str),
                                        {
                                            withoutYear: true,
                                        },
                                    )} - ${getDateString(
                                        convertDateStrToTimestamp(incentive.expired_at_str) - 1,
                                    )}`,
                                    label: 'Period:',
                                },
                            ],
                        };
                    })}
                />
            ) : (
                <Empty>
                    <h3>There's nothing here.</h3>
                    <span>It looks like there are no upcoming incentives at the moment.</span>

                    <ExternalLink asDiv>
                        <Link to={IncentivesRoutes.addIncentive}>Add incentive</Link>
                    </ExternalLink>
                </Empty>
            )}
        </Wrapper>
    );
};

export default IncentivesTable;
