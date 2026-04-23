import * as React from 'react';
import { useState } from 'react';

import { EmptyState, List } from './AssetRegistryList.styled';

import { RegistryAsset } from '../../AssetRegistryMainPage.types';
import AssetRegistryListItem from '../AssetRegistryListItem/AssetRegistryListItem';

type AssetRegistryListProps = {
    items: RegistryAsset[];
};

const AssetRegistryList = ({ items }: AssetRegistryListProps) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (!items.length) {
        return <EmptyState>No assets found.</EmptyState>;
    }

    return (
        <List>
            {items.map(item => {
                const itemId = `${item.asset_code ?? 'unknown'}:${item.asset_issuer ?? 'native'}`;

                return (
                    <AssetRegistryListItem
                        key={itemId}
                        item={item}
                        isExpanded={expandedId === itemId}
                        onToggle={() =>
                            setExpandedId(current => (current === itemId ? null : itemId))
                        }
                    />
                );
            })}
        </List>
    );
};

export default AssetRegistryList;
