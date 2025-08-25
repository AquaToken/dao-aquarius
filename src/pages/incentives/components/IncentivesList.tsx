import * as React from 'react';
import { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { getPoolsWithIncentives } from 'api/amm';

import { DAY } from 'constants/intervals';
import { AmmRoutes, IncentivesRoutes } from 'constants/routes';

import { contractValueToAmount } from 'helpers/amount';
import { getAssetFromString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';

import { PoolProcessed } from 'types/amm';

import { EmptyList, flexAllCenter } from 'web/mixins';

import Asset from 'basics/Asset';
import ExternalLink from 'basics/ExternalLink';
import { PageLoader } from 'basics/loaders';
import Market from 'basics/Market';
import Table from 'basics/Table';

const Wrapper = styled.div`
    padding: 2.4rem 0;
`;

const Empty = styled.div`
    ${EmptyList};
`;

const IncentivesList = () => {
    const [pools, setPools] = React.useState<PoolProcessed[] | null>(null);

    useEffect(() => {
        getPoolsWithIncentives().then(setPools);
    }, []);

    const history = useHistory();

    const goToPoolPage = (id: string) => {
        history.push(`${AmmRoutes.analytics}${id}/`);
    };

    if (!pools) {
        return <PageLoader />;
    }

    return (
        <Wrapper>
            {pools.length ? (
                <Table
                    head={[
                        { children: 'Pool', flexSize: 3 },
                        { children: 'Token' },
                        { children: 'Daily amount' },
                        { children: 'APY' },
                    ]}
                    body={pools.reduce((acc, pool) => {
                        const incentiveTokens = Object.keys(pool.reward_tps_per_token).map(str =>
                            getAssetFromString(str),
                        );

                        const incentiveAmounts = Object.values(pool.reward_tps_per_token).map(
                            (str, i) =>
                                formatBalance(
                                    (+contractValueToAmount(str, incentiveTokens[i].decimal) *
                                        DAY) /
                                        1000,
                                    true,
                                    true,
                                ),
                        );

                        const incentiveAPY = Object.values(pool.rewards_apy_per_token).map(str =>
                            (+str * 100).toFixed(2),
                        );

                        incentiveTokens.map((token, index) =>
                            acc.push({
                                key: pool.address + token.contract,
                                onRowClick: () => goToPoolPage(pool.address),
                                rowItems: [
                                    {
                                        children: (
                                            <Market
                                                assets={pool.tokens}
                                                fee={pool.fee}
                                                poolType={pool.pool_type}
                                                withoutLink
                                            />
                                        ),
                                        flexSize: 3,
                                    },
                                    {
                                        children: <Asset asset={token} logoAndCode />,
                                        label: 'Token',
                                    },

                                    {
                                        children: incentiveAmounts[index],
                                        label: 'Daily amount',
                                    },
                                    {
                                        children: `${incentiveAPY[index]}%`,
                                        label: 'APY',
                                    },
                                ],
                            }),
                        );

                        return acc;
                    }, [])}
                />
            ) : (
                <Empty>
                    <h3>There's nothing here.</h3>
                    <span>It looks like there are no active incentives at the moment.</span>

                    <ExternalLink asDiv>
                        <Link to={IncentivesRoutes.addIncentive}>Add incentive</Link>
                    </ExternalLink>
                </Empty>
            )}
        </Wrapper>
    );
};

export default IncentivesList;
