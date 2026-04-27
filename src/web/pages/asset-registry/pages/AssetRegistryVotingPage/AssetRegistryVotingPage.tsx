import * as React from 'react';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getProposalRequest } from 'api/governance';

import { AppRoutes } from 'constants/routes';

import { createAsset } from 'helpers/token';

import { Proposal } from 'types/governance';

import { PageContainer } from 'web/styles/commonPageStyles';

import ArrowLeft from 'assets/icons/arrows/arrow-left-16.svg';

import CircleButton from 'basics/buttons/CircleButton';
import PageLoader from 'basics/loaders/PageLoader';

import AssetInfoContent from 'components/AssetInfoContent/AssetInfoContent';
import NotFoundPage from 'components/NotFoundPage';

import { COLORS } from 'styles/style-constants';

import CurrentResults from 'pages/governance/components/GovernanceVoteProposalPage/CurrentResults/CurrentResults';
import Votes from 'pages/governance/components/GovernanceVoteProposalPage/Votes/Votes';

import {
    AssetField,
    AssetFieldLabel,
    AssetFields,
    AssetFieldValue,
    AssetInfoSection,
    Content,
    Divider,
    Header,
    Main,
    ProposalText,
    ResultsBlock,
    SectionCard,
    SectionTitle,
    SidebarMobile,
    SidebarWeb,
} from './AssetRegistryVotingPage.styled';

import { AssetRegistryBadgeVariant } from '../AssetRegistryMainPage/AssetRegistryMainPage.types';
import AssetRegistryStatusBadge from '../AssetRegistryMainPage/components/AssetRegistryStatusBadge/AssetRegistryStatusBadge';

const assetProposalFields: Array<{ key: keyof Proposal; label: string }> = [
    { key: 'asset_aquarius_traction', label: 'Aquarius traction' },
    { key: 'asset_audit_info', label: 'Audit info' },
    { key: 'asset_community_references', label: 'Community references' },
    { key: 'asset_holder_distribution', label: 'Holder distribution' },
    { key: 'asset_issuer_commitments', label: 'Issuer commitments' },
    { key: 'asset_issuer_information', label: 'Issuer information' },
    { key: 'asset_liquidity', label: 'Liquidity' },
    { key: 'asset_related_projects', label: 'Related projects' },
    { key: 'asset_stellar_flags', label: 'Stellar flags' },
    { key: 'asset_token_description', label: 'Token description' },
    { key: 'asset_trading_volume', label: 'Trading volume' },
];

const getAssetProposalBadge = (proposal: Proposal) => {
    if (proposal.proposal_type === 'ADD_ASSET') {
        return (
            <AssetRegistryStatusBadge
                variant={AssetRegistryBadgeVariant.whitelisted}
                label="Whitelist"
                withIcon
            />
        );
    }

    if (proposal.proposal_type === 'REMOVE_ASSET') {
        return (
            <AssetRegistryStatusBadge
                variant={AssetRegistryBadgeVariant.revoked}
                label="Revoke"
                withIcon
            />
        );
    }

    return null;
};

const AssetRegistryVotingPage = (): ReactElement => {
    const { id } = useParams<{ id?: string }>();
    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!id) {
            setError(true);
            return;
        }

        setError(false);
        setProposal(null);

        getProposalRequest(id)
            .then(response => {
                setProposal(response);
            })
            .catch(() => {
                setError(true);
            });
    }, [id]);

    const isAssetProposal =
        proposal?.proposal_type === 'ADD_ASSET' || proposal?.proposal_type === 'REMOVE_ASSET';

    const asset = useMemo(() => {
        if (!proposal?.asset_code || !isAssetProposal) {
            return null;
        }

        return createAsset(proposal.asset_code, proposal.asset_issuer ?? '');
    }, [isAssetProposal, proposal?.asset_code, proposal?.asset_issuer]);

    const proposalAssetFields = assetProposalFields.map(({ key, label }) => ({
        label,
        value: proposal?.[key],
    }));

    if (error) {
        return <NotFoundPage />;
    }

    if (!proposal) {
        return <PageLoader />;
    }

    if (!isAssetProposal || !asset) {
        return <NotFoundPage />;
    }

    return (
        <PageContainer $color={COLORS.gray50}>
            <Main>
                <Header>
                    <CircleButton
                        to={AppRoutes.section.assetRegistry.link.index}
                        label="Assets registry list"
                    >
                        <ArrowLeft />
                    </CircleButton>
                    <AssetInfoSection>
                        <AssetInfoContent asset={asset} badge={getAssetProposalBadge(proposal)} />
                    </AssetInfoSection>
                </Header>

                <SidebarWeb proposal={proposal} />

                <Content>
                    <SidebarMobile proposal={proposal} />

                    <SectionCard>
                        <SectionTitle>Proposal</SectionTitle>
                        <ProposalText dangerouslySetInnerHTML={{ __html: proposal.text }} />
                        <AssetFields>
                            {proposalAssetFields.map(field => (
                                <AssetField key={field.label}>
                                    <AssetFieldLabel>{field.label}</AssetFieldLabel>
                                    <AssetFieldValue>{field.value || '—'}</AssetFieldValue>
                                </AssetField>
                            ))}
                        </AssetFields>
                    </SectionCard>

                    {(proposal.proposal_status === 'VOTING' ||
                        proposal.proposal_status === 'VOTED') && (
                        <SectionCard>
                            <ResultsBlock>
                                <CurrentResults proposal={proposal} />
                                <Divider />
                                <Votes />
                            </ResultsBlock>
                        </SectionCard>
                    )}
                </Content>
            </Main>
        </PageContainer>
    );
};

export default AssetRegistryVotingPage;
