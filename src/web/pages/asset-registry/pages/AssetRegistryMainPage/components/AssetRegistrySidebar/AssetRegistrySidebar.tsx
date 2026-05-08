import * as React from 'react';

import {
    RegistryAssetMarketStatsMap,
    UpcomingVoteData,
} from '../../AssetRegistryMainPage.types';
import ActiveVotingCard from '../ActiveVotingCard/ActiveVotingCard';
import UpcomingVotesCard from '../UpcomingVotesCard/UpcomingVotesCard';

import { Sidebar } from './AssetRegistrySidebar.styled';

type AssetRegistrySidebarProps = {
    marketStats: RegistryAssetMarketStatsMap;
    isMarketStatsLoading: boolean;
    upcomingVotes: UpcomingVoteData[];
    isUpcomingVotesLoading: boolean;
};

const AssetRegistrySidebar = ({
    marketStats,
    isMarketStatsLoading,
    upcomingVotes,
    isUpcomingVotesLoading,
}: AssetRegistrySidebarProps) => (
    <Sidebar>
        <ActiveVotingCard
            marketStats={marketStats}
            isMarketStatsLoading={isMarketStatsLoading}
            upcomingVotes={upcomingVotes}
        />
        {!isUpcomingVotesLoading && upcomingVotes.length > 0 ? (
            <UpcomingVotesCard items={upcomingVotes} />
        ) : null}
    </Sidebar>
);

export default AssetRegistrySidebar;
