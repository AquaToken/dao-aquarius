import * as React from 'react';

import { Layout, LeftColumn } from './AssetRegistryContent.styled';

import {
    RegistryAsset,
    RegistryAssetMarketStatsMap,
    UpcomingVoteData,
} from '../../AssetRegistryMainPage.types';
import AssetRegistryList from '../AssetRegistryList/AssetRegistryList';
import AssetRegistrySidebar from '../AssetRegistrySidebar/AssetRegistrySidebar';

type AssetRegistryContentProps = {
    items: RegistryAsset[];
    marketStats: RegistryAssetMarketStatsMap;
    isMarketStatsLoading: boolean;
    upcomingVotes: UpcomingVoteData[];
    toolbar: React.ReactNode;
};

const AssetRegistryContent = ({
    items,
    marketStats,
    isMarketStatsLoading,
    upcomingVotes,
    toolbar,
}: AssetRegistryContentProps) => (
    <Layout>
        <LeftColumn>
            {toolbar}
            <AssetRegistryList
                items={items}
                marketStats={marketStats}
                isMarketStatsLoading={isMarketStatsLoading}
            />
        </LeftColumn>
        <AssetRegistrySidebar
            marketStats={marketStats}
            isMarketStatsLoading={isMarketStatsLoading}
            upcomingVotes={upcomingVotes}
        />
    </Layout>
);

export default AssetRegistryContent;
