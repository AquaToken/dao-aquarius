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
};

const AssetRegistrySidebar = ({
    marketStats,
    isMarketStatsLoading,
    upcomingVotes,
}: AssetRegistrySidebarProps) => (
    <Sidebar>
        <ActiveVotingCard
            marketStats={marketStats}
            isMarketStatsLoading={isMarketStatsLoading}
            upcomingVotes={upcomingVotes}
        />
        <UpcomingVotesCard items={upcomingVotes} />
    </Sidebar>
);

export default AssetRegistrySidebar;
