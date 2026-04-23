import * as React from 'react';

import Button from 'basics/buttons/Button';

import { ActiveVotingData, AssetRegistryBadgeVariant } from '../../AssetRegistryMainPage.types';
import AssetRegistryStatusBadge from '../AssetRegistryStatusBadge/AssetRegistryStatusBadge';
import VoteChoiceSelector from '../VoteChoiceSelector/VoteChoiceSelector';

import {
    Card,
    CardTitle,
    Divider,
    FooterRow,
    Header,
    Meta,
    MetaLabel,
    MetaValue,
    ProgressBar,
    ProgressFill,
    Section,
    Stats,
    TokenAvatar,
    TokenCode,
    TokenDetails,
} from './ActiveVotingCard.styled';

type ActiveVotingCardProps = {
    voting: ActiveVotingData;
};

const ActiveVotingCard = ({ voting }: ActiveVotingCardProps) => (
    <Card>
        <CardTitle>Active voting</CardTitle>

        <Header>
            <TokenAvatar>{voting.assetCode.slice(0, 2)}</TokenAvatar>
            <TokenDetails>
                <TokenCode>{voting.assetCode}</TokenCode>
            </TokenDetails>
            <AssetRegistryStatusBadge
                variant={AssetRegistryBadgeVariant.inVoting}
                label="In voting"
            />
        </Header>

        <Stats>
            <Meta>
                <MetaLabel>Asset holders</MetaLabel>
                <MetaValue>{voting.assetHolders}</MetaValue>
            </Meta>
            <Meta>
                <MetaLabel>TVL</MetaLabel>
                <MetaValue>{voting.tvl}</MetaValue>
            </Meta>
            <Meta>
                <MetaLabel>Trading volume</MetaLabel>
                <MetaValue>{voting.tradingVolume}</MetaValue>
            </Meta>
        </Stats>

        <Divider />

        <Section>
            <MetaValue>{voting.supportPercent}% support</MetaValue>
            <ProgressBar>
                <ProgressFill style={{ width: `${voting.supportPercent}%` }} />
            </ProgressBar>
        </Section>

        <Section>
            <MetaValue>Your vote</MetaValue>
            <VoteChoiceSelector value="for" />
        </Section>

        <Divider />

        <FooterRow>
            <MetaLabel>Ends in {voting.endsIn}</MetaLabel>
            <MetaValue>{voting.endsAt}</MetaValue>
        </FooterRow>

        <Button isRounded fullWidth>
            Details
        </Button>
    </Card>
);

export default ActiveVotingCard;
