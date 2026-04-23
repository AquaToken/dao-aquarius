import * as React from 'react';

import { Layout, LeftColumn } from './AssetRegistryContent.styled';

import {
    ActiveVotingData,
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
    activeVoting: ActiveVotingData;
    upcomingVotes: UpcomingVoteData[];
    toolbar: React.ReactNode;
};

const AssetRegistryContent = ({
    items,
    marketStats,
    isMarketStatsLoading,
    activeVoting,
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
        <AssetRegistrySidebar activeVoting={activeVoting} upcomingVotes={upcomingVotes} />
    </Layout>
);

export default AssetRegistryContent;
