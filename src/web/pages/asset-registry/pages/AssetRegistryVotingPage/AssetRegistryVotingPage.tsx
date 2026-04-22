import * as React from 'react';
import { useParams } from 'react-router-dom';

import { PageContainer } from 'styles/commonPageStyles';
import { COLORS } from 'styles/style-constants';

import AssetRegistryPlaceholder from '../../components/AssetRegistryPlaceholder/AssetRegistryPlaceholder';

const AssetRegistryVotingPage = () => {
    const { id } = useParams();

    return (
        <PageContainer $color={COLORS.gray50}>
            <AssetRegistryPlaceholder
                eyebrow="Asset Registry"
                title={`Voting ${id ?? ''}`}
                description="This route is reserved for a specific Asset Registry voting page."
            />
        </PageContainer>
    );
};

export default AssetRegistryVotingPage;
