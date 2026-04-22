import * as React from 'react';

import { PageContainer } from 'styles/commonPageStyles';
import { COLORS } from 'styles/style-constants';

import AssetRegistryPlaceholder from '../../components/AssetRegistryPlaceholder/AssetRegistryPlaceholder';

const AssetRegistryMainPage = () => (
    <PageContainer $color={COLORS.gray50}>
        <AssetRegistryPlaceholder
            eyebrow="Asset Registry"
            title="Asset Registry page"
            description="This is the entry page for Asset Registry. We'll build the list of votings and registry overview here next."
        />
    </PageContainer>
);

export default AssetRegistryMainPage;
