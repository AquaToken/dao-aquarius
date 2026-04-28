import * as React from 'react';

import { PageContainer } from 'styles/commonPageStyles';
import { COLORS } from 'styles/style-constants';

import AssetRegistryPlaceholder from '../../components/AssetRegistryPlaceholder/AssetRegistryPlaceholder';

const AssetRegistryCreatePage = () => (
    <PageContainer $color={COLORS.gray50}>
        <AssetRegistryPlaceholder
            eyebrow="Asset Registry"
            title="Create voting"
            description="This route is reserved for creating a new Asset Registry voting."
        />
    </PageContainer>
);

export default AssetRegistryCreatePage;
