import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { AppRoutes } from 'constants/routes';

import { createAsset } from 'helpers/token';

import { AssetRegistryBadgeVariant } from 'web/pages/asset-registry/pages/AssetRegistryMainPage/AssetRegistryMainPage.types';

import Asset from 'basics/Asset';

import {
    Card,
    CardTitle,
    Divider,
    Item,
    ItemBody,
    ItemHeader,
    ItemInteractive,
    QueueLabel,
    StartsAt,
    ItemAsset,
} from './UpcomingVotesCard.styled';

import { UpcomingVoteData } from '../../AssetRegistryMainPage.types';
import AssetRegistryStatusBadge from '../AssetRegistryStatusBadge/AssetRegistryStatusBadge';

type UpcomingVotesCardProps = {
    items: UpcomingVoteData[];
};

const UpcomingVotesCard = ({ items }: UpcomingVotesCardProps) => {
    const navigate = useNavigate();

    return (
        <Card>
            <CardTitle>Upcoming Votes</CardTitle>
            {items.map((item, index) => (
                <React.Fragment key={item.id ?? `${item.assetCode}-${item.assetIssuer}-${index}`}>
                    {item.id ? (
                        <ItemInteractive
                            onClick={() =>
                                navigate(
                                    AppRoutes.section.assetRegistry.to.voting({
                                        id: item.id as string,
                                    }),
                                )
                            }
                        >
                            <ItemHeader>
                                <QueueLabel>{`Queue #${index + 1}`}</QueueLabel>
                                <StartsAt>{item.startsAt}</StartsAt>
                            </ItemHeader>
                            <ItemBody>
                                <ItemAsset>
                                    <Asset
                                        asset={createAsset(item.assetCode, item.assetIssuer)}
                                        variant="compactDomain"
                                        hasAssetDetailsLink
                                    />
                                </ItemAsset>
                                <AssetRegistryStatusBadge
                                    variant={
                                        item.type === 'ADD_ASSET'
                                            ? AssetRegistryBadgeVariant.whitelisted
                                            : AssetRegistryBadgeVariant.revoked
                                    }
                                    label={item.type === 'ADD_ASSET' ? 'Whitelist' : 'Revoke'}
                                    withIcon
                                />
                            </ItemBody>
                        </ItemInteractive>
                    ) : (
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
                                        hasAssetDetailsLink
                                    />
                                </ItemAsset>
                                <AssetRegistryStatusBadge
                                    variant={
                                        item.type === 'ADD_ASSET'
                                            ? AssetRegistryBadgeVariant.whitelisted
                                            : AssetRegistryBadgeVariant.revoked
                                    }
                                    label={item.type === 'ADD_ASSET' ? 'Whitelist' : 'Revoke'}
                                    withIcon
                                />
                            </ItemBody>
                        </Item>
                    )}
                    {index !== items.length - 1 ? <Divider /> : null}
                </React.Fragment>
            ))}
        </Card>
    );
};

export default UpcomingVotesCard;
