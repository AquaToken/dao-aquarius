import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getPoolsWithAssets } from 'api/amm';

import { AmmRoutes } from 'constants/routes';

import { Asset } from 'types/stellar';

import { PageLoader } from 'basics/loaders';

import PoolsList from 'pages/amm/components/PoolsList/PoolsList';
import { ExternalLinkStyled, Section } from 'pages/profile/AmmRewards/AmmRewards';
import { Empty } from 'pages/profile/YourVotes/YourVotes';

interface Props {
    assets: Asset[];
}

const SorobanAmmStats = ({ assets }: Props) => {
    const [pools, setPools] = useState(null);

    useEffect(() => {
        getPoolsWithAssets(assets).then(res => {
            setPools(res);
        });
    }, []);

    if (!pools) {
        return <PageLoader />;
    }

    if (!pools.length) {
        return (
            <Section>
                <Empty>
                    <h3>There's nothing here.</h3>

                    <ExternalLinkStyled asDiv>
                        <Link to={AmmRoutes.analytics}>Create pool</Link>
                    </ExternalLinkStyled>
                </Empty>
            </Section>
        );
    }

    return (
        <div>
            <PoolsList pools={pools} onUpdate={void 0} isCommonList />
        </div>
    );
};

export default SorobanAmmStats;
