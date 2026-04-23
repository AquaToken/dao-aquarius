import * as React from 'react';

import { UpcomingVoteData } from '../../AssetRegistryMainPage.types';
import AssetRegistryStatusBadge from '../AssetRegistryStatusBadge/AssetRegistryStatusBadge';

import {
    Card,
    CardTitle,
    Divider,
    Item,
    ItemBody,
    ItemHeader,
    QueueLabel,
    StartsAt,
    TokenAvatar,
    TokenCode,
} from './UpcomingVotesCard.styled';

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
                        <QueueLabel>{item.queueLabel}</QueueLabel>
                        <StartsAt>{item.startsAt}</StartsAt>
                    </ItemHeader>
                    <ItemBody>
                        <TokenAvatar>{item.assetCode.slice(0, 2)}</TokenAvatar>
                        <div>
                            <TokenCode>{item.assetCode}</TokenCode>
                        </div>
                        <AssetRegistryStatusBadge
                            variant={item.actionVariant}
                            label={item.actionLabel}
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
