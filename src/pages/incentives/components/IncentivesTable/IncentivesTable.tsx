import * as React from 'react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { getIncentives } from 'api/incentives';

import { AppRoutes } from 'constants/routes';

import { tpsToDailyAmount } from 'helpers/amount';
import { convertDateStrToTimestamp, getDateString } from 'helpers/date';

import { IncentiveProcessed } from 'types/incentives';

import Asset from 'basics/Asset';
import { ExternalLink } from 'basics/links';
import { PageLoader } from 'basics/loaders';
import Market from 'basics/Market';
import Table from 'basics/Table';

import { EmptyList, respondDown } from 'styles/mixins';
import { Breakpoints, FONT_SIZE } from 'styles/style-constants';

const Wrapper = styled.div`
    padding: 2.4rem 0;
`;

const Empty = styled.div`
    ${EmptyList};
`;

const Period = styled.span`
    ${respondDown(Breakpoints.sm)`
        display: flex;
        flex-direction: column;
        text-align: right;
        ${FONT_SIZE.sm};
    `}
`;

interface Props {
    isActive: boolean;
}

const IncentivesTable = ({ isActive }: Props) => {
    const [incentives, setIncentives] = React.useState<IncentiveProcessed[] | null>(null);

    useEffect(() => {
        getIncentives(isActive).then(setIncentives);
    }, []);

    const navigate = useNavigate();

    const goToPoolPage = (id: string) => {
        navigate(AppRoutes.section.amm.to.pool({ poolAddress: id }));
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
                        { children: 'Period', flexSize: 1.5 },
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
                                    children: (
                                        <Period>
                                            <span>
                                                {getDateString(
                                                    convertDateStrToTimestamp(
                                                        incentive.start_at_str,
                                                    ),
                                                    {
                                                        withoutYear: true,
                                                        withTime: true,
                                                    },
                                                )}{' '}
                                                -{' '}
                                            </span>
                                            <span>
                                                {getDateString(
                                                    convertDateStrToTimestamp(
                                                        incentive.expired_at_str,
                                                    ),
                                                    {
                                                        withTime: true,
                                                    },
                                                )}
                                            </span>
                                        </Period>
                                    ),
                                    label: 'Period:',
                                    flexSize: 1.5,
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
                        <Link to={AppRoutes.section.incentive.link.addIncentive}>
                            Add incentive
                        </Link>
                    </ExternalLink>
                </Empty>
            )}
        </Wrapper>
    );
};

export default IncentivesTable;
