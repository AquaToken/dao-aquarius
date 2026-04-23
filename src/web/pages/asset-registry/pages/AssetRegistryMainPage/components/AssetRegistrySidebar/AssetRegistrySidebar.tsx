import * as React from 'react';

import { ActiveVotingData, UpcomingVoteData } from '../../AssetRegistryMainPage.types';
import ActiveVotingCard from '../ActiveVotingCard/ActiveVotingCard';
import UpcomingVotesCard from '../UpcomingVotesCard/UpcomingVotesCard';

import { Sidebar } from './AssetRegistrySidebar.styled';

type AssetRegistrySidebarProps = {
    activeVoting: ActiveVotingData;
    upcomingVotes: UpcomingVoteData[];
};

const AssetRegistrySidebar = ({ activeVoting, upcomingVotes }: AssetRegistrySidebarProps) => (
    <Sidebar>
        <ActiveVotingCard voting={activeVoting} />
        <UpcomingVotesCard items={upcomingVotes} />
    </Sidebar>
);

export default AssetRegistrySidebar;
