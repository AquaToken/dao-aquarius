import * as React from 'react';

import { createAsset } from 'helpers/token';

import Asset from 'basics/Asset';

import {
    Card,
    CardTitle,
    Divider,
    Item,
    ItemBody,
    ItemHeader,
    QueueLabel,
    StartsAt,
    ItemAsset,
} from './UpcomingVotesCard.styled';

import { UpcomingVoteData } from '../../AssetRegistryMainPage.types';
import AssetRegistryStatusBadge from '../AssetRegistryStatusBadge/AssetRegistryStatusBadge';

type UpcomingVotesCardProps = {
    items: UpcomingVoteData[];
};

const UpcomingVotesCard = ({ items }: UpcomingVotesCardProps) => (
    <Card>
        <CardTitle>Upcoming votes</CardTitle>
        {items.map((item, index) => (
            <React.Fragment key={item.id}>
                <Item>
                    <ItemHeader>
                        <QueueLabel>{`Queue #${index + 1}`}</QueueLabel>
                        <StartsAt>{item.startsAt}</StartsAt>
                    </ItemHeader>
                    <ItemBody>
                        <ItemAsset>
                            <Asset
                                asset={createAsset(item.assetCode, item.assetIssuer)}
                                variant="compactDomain"
                            />
                        </ItemAsset>
                        <AssetRegistryStatusBadge
                            variant={item.type === 'ADD_ASSET' ? 'whitelisted' : 'revoked'}
                            label={item.type === 'ADD_ASSET' ? 'Whitelist' : 'Revoke'}
                            withIcon
                        />
                    </ItemBody>
                </Item>
                {index !== items.length - 1 ? <Divider /> : null}
            </React.Fragment>
        ))}
    </Card>
);

export default UpcomingVotesCard;
