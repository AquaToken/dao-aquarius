import * as React from 'react';

import { Layout, LeftColumn } from './AssetRegistryContent.styled';

import {
    RegistryAsset,
    RegistryAssetMarketStatsMap,
    RegistryProposalPreview,
    UpcomingVoteData,
} from '../../AssetRegistryMainPage.types';
import AssetRegistryList from '../AssetRegistryList/AssetRegistryList';
import AssetRegistryMyVotesList from '../AssetRegistryMyVotesList/AssetRegistryMyVotesList';
import AssetRegistrySidebar from '../AssetRegistrySidebar/AssetRegistrySidebar';

type AssetRegistryContentProps = {
    topContent?: React.ReactNode;
    items: RegistryAsset[];
    voteProposals: RegistryProposalPreview[];
    isVotesMode: boolean;
    isVotesLoading: boolean;
    marketStats: RegistryAssetMarketStatsMap;
    isMarketStatsLoading: boolean;
    upcomingVotes: UpcomingVoteData[];
    isUpcomingVotesLoading: boolean;
    toolbar: React.ReactNode;
};

const AssetRegistryContent = ({
    topContent,
    items,
    voteProposals,
    isVotesMode,
    isVotesLoading,
    marketStats,
    isMarketStatsLoading,
    upcomingVotes,
    isUpcomingVotesLoading,
    toolbar,
}: AssetRegistryContentProps) => (
    <Layout>
        <LeftColumn>
            {topContent}
            {toolbar}
            {isVotesMode ? (
                <AssetRegistryMyVotesList proposals={voteProposals} isLoading={isVotesLoading} />
            ) : (
                <AssetRegistryList
                    items={items}
                    marketStats={marketStats}
                    isMarketStatsLoading={isMarketStatsLoading}
                />
            )}
        </LeftColumn>
        <AssetRegistrySidebar
            marketStats={marketStats}
            isMarketStatsLoading={isMarketStatsLoading}
            upcomingVotes={upcomingVotes}
            isUpcomingVotesLoading={isUpcomingVotesLoading}
        />
    </Layout>
);

export default AssetRegistryContent;
