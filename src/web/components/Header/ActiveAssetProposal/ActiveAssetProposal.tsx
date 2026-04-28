import * as React from 'react';

import { createAsset } from 'helpers/token';

import { Proposal } from 'types/governance';

import IconMinus from 'assets/icons/nav/icon-minus-6.svg';
import IconPlus from 'assets/icons/nav/icon-plus-6.svg';

import AssetLogo from 'basics/AssetLogo';

import { ActionBadge, ActionIcon, Container } from './ActiveAssetProposal.styled';

const ActiveAssetProposal = ({ proposal }: { proposal: Proposal }): React.ReactNode => {
    if (!proposal.asset_code) {
        return null;
    }

    const asset = createAsset(proposal.asset_code, proposal.asset_issuer ?? '');
    const isRemove = proposal.proposal_type === 'REMOVE_ASSET';

    return (
        <Container>
            <AssetLogo asset={asset} size={2.4} />
            <ActionBadge $isRemove={isRemove}>
                <ActionIcon>{isRemove ? <IconMinus /> : <IconPlus />}</ActionIcon>
            </ActionBadge>
        </Container>
    );
};

export default ActiveAssetProposal;
