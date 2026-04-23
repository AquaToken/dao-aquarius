import * as React from 'react';

import { Layout, LeftColumn } from './AssetRegistryContent.styled';

import {
    ActiveVotingData,
    RegistryAsset,
    UpcomingVoteData,
} from '../../AssetRegistryMainPage.types';
import AssetRegistryList from '../AssetRegistryList/AssetRegistryList';
import AssetRegistrySidebar from '../AssetRegistrySidebar/AssetRegistrySidebar';

type AssetRegistryContentProps = {
    items: RegistryAsset[];
    activeVoting: ActiveVotingData;
    upcomingVotes: UpcomingVoteData[];
    toolbar: React.ReactNode;
};

const AssetRegistryContent = ({
    items,
    activeVoting,
    upcomingVotes,
    toolbar,
}: AssetRegistryContentProps) => (
    <Layout>
        <LeftColumn>
            {toolbar}
            <AssetRegistryList items={items} />
        </LeftColumn>
        <AssetRegistrySidebar activeVoting={activeVoting} upcomingVotes={upcomingVotes} />
    </Layout>
);

export default AssetRegistryContent;
