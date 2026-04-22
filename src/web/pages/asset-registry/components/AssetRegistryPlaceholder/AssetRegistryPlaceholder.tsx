import * as React from 'react';

import { Card, Description, Eyebrow, Inner, Title } from './AssetRegistryPlaceholder.styled';

type AssetRegistryPlaceholderProps = {
    eyebrow: string;
    title: string;
    description: string;
};

const AssetRegistryPlaceholder = ({
    eyebrow,
    title,
    description,
}: AssetRegistryPlaceholderProps) => (
    <Inner>
        <Card>
            <Eyebrow>{eyebrow}</Eyebrow>
            <Title>{title}</Title>
            <Description>{description}</Description>
        </Card>
    </Inner>
);

export default AssetRegistryPlaceholder;
