import * as React from 'react';

import { PROPOSAL_STATUS } from 'constants/dao';

import { getAssetString } from 'helpers/assets';
import { getDateString } from 'helpers/date';
import { createAsset } from 'helpers/token';

import useAssetsStore from 'store/assetsStore/useAssetsStore';

import ArrowDown from 'assets/icons/arrows/arrow-down-16.svg';

import Asset from 'basics/Asset';

import {
    AssetRow,
    ChevronButton,
    ChevronIconWrap,
    ChevronPlaceholder,
    DesktopSummary,
    ItemCard,
    Metric,
    MetricLabel,
    MetricValue,
    MobileMetric,
    MobileMetrics,
    MobileSummary,
    SummaryLeft,
    SummaryRight,
    TopRow,
} from './AssetRegistryListItem.styled';

import {
    AssetRegistryBadgeVariant,
    RegistryAsset,
    RegistryAssetProposal,
} from '../../AssetRegistryMainPage.types';
import AssetRegistryStatusBadge from '../AssetRegistryStatusBadge/AssetRegistryStatusBadge';
import AssetRegistryVoteHistory from '../AssetRegistryVoteHistory/AssetRegistryVoteHistory';

const DEFAULT_ASSET_METRICS = {
    assetHolders: '149190',
    tvl: '$18.28K',
    tradingVolume: '$795.78',
};

const getProposalTargetLabel = (proposalType: RegistryAssetProposal['proposal_type']) =>
    proposalType === 'ADD_ASSET' ? 'Whitelist' : 'Revoke';

const getProposalTargetVariant = (
    proposalType: RegistryAssetProposal['proposal_type'],
): AssetRegistryBadgeVariant =>
    proposalType === 'ADD_ASSET'
        ? AssetRegistryBadgeVariant.whitelisted
        : AssetRegistryBadgeVariant.revoked;

const getProposalResultsStatus = (proposal: RegistryAssetProposal) => {
    const voteFor = Number(proposal.vote_for_result);
    const voteAgainst = Number(proposal.vote_against_result);
    const voteAbstain = Number(proposal.vote_abstain_result);

    if (!voteFor && !voteAgainst && !voteAbstain) {
        return PROPOSAL_STATUS.NO_QUORUM;
    }

    return voteFor > voteAgainst ? PROPOSAL_STATUS.ACCEPTED : PROPOSAL_STATUS.REJECTED;
};

type AssetRegistryListItemProps = {
    item: RegistryAsset;
    isExpanded: boolean;
    onToggle: () => void;
};

const AssetRegistryListItem = ({ item, isExpanded, onToggle }: AssetRegistryListItemProps) => {
    const asset = createAsset(item.asset_code, item.asset_issuer ?? '');

    const { assetsInfo } = useAssetsStore();

    const statusBadge = item.whitelisted
        ? {
              label: 'Whitelisted',
              variant: AssetRegistryBadgeVariant.whitelisted,
          }
        : {
              label: 'Revoked',
              variant: AssetRegistryBadgeVariant.revoked,
          };

    const votesHistory = item.proposals
        .filter(proposal => proposal.proposal_status === 'VOTED')
        .sort(
            (a, b) =>
                new Date(b.end_at ?? b.created_at).getTime() -
                new Date(a.end_at ?? a.created_at).getTime(),
        )
        .map(proposal => {
            const voteFor = Number(proposal.vote_for_result);
            const voteAgainst = Number(proposal.vote_against_result);
            const voteAbstain = Number(proposal.vote_abstain_result);
            const totalVotes = voteFor + voteAgainst + voteAbstain;

            return {
                id: String(proposal.id),
                date: getDateString(new Date(proposal.end_at ?? proposal.created_at).getTime()),
                proposedToLabel: getProposalTargetLabel(proposal.proposal_type),
                proposedToVariant: getProposalTargetVariant(proposal.proposal_type),
                supportedBy: totalVotes ? `${Math.round((voteFor / totalVotes) * 100)}%` : '-',
                resultsStatus: getProposalResultsStatus(proposal),
            };
        });
    const hasVotesHistory = votesHistory.length > 0;

    return (
        <ItemCard>
            <DesktopSummary>
                <SummaryLeft>
                    <Asset asset={asset} />
                </SummaryLeft>

                <SummaryRight>
                    <Metric>
                        <MetricLabel>Asset holders</MetricLabel>
                        <MetricValue>
                            {assetsInfo.get(getAssetString(asset))?.accounts_authorized}
                        </MetricValue>
                    </Metric>
                    <Metric>
                        <MetricLabel>TVL</MetricLabel>
                        <MetricValue>{DEFAULT_ASSET_METRICS.tvl}</MetricValue>
                    </Metric>
                    <Metric>
                        <MetricLabel>Trading volume</MetricLabel>
                        <MetricValue>{DEFAULT_ASSET_METRICS.tradingVolume}</MetricValue>
                    </Metric>
                    <AssetRegistryStatusBadge
                        variant={statusBadge.variant}
                        label={statusBadge.label}
                    />
                    {hasVotesHistory ? (
                        <ChevronButton type="button" onClick={onToggle}>
                            <ChevronIconWrap $isExpanded={isExpanded}>
                                <ArrowDown />
                            </ChevronIconWrap>
                        </ChevronButton>
                    ) : (
                        <ChevronPlaceholder aria-hidden />
                    )}
                </SummaryRight>
            </DesktopSummary>

            <MobileSummary>
                <TopRow>
                    <AssetRegistryStatusBadge
                        variant={statusBadge.variant}
                        label={statusBadge.label}
                    />
                    <div>
                        {hasVotesHistory ? (
                            <ChevronButton type="button" onClick={onToggle}>
                                <ChevronIconWrap $isExpanded={isExpanded}>
                                    <ArrowDown />
                                </ChevronIconWrap>
                            </ChevronButton>
                        ) : (
                            <ChevronPlaceholder aria-hidden />
                        )}
                    </div>
                </TopRow>

                <SummaryLeft>
                    <Asset asset={asset} />
                </SummaryLeft>

                <MobileMetrics>
                    <MobileMetric>
                        <MetricLabel>Asset holders</MetricLabel>
                        <MetricValue>
                            {assetsInfo.get(getAssetString(asset))?.accounts_authorized}
                        </MetricValue>
                    </MobileMetric>
                    <MobileMetric>
                        <MetricLabel>TVL</MetricLabel>
                        <MetricValue>{DEFAULT_ASSET_METRICS.tvl}</MetricValue>
                    </MobileMetric>
                    <MobileMetric>
                        <MetricLabel>Trading volume</MetricLabel>
                        <MetricValue>{DEFAULT_ASSET_METRICS.tradingVolume}</MetricValue>
                    </MobileMetric>
                </MobileMetrics>
            </MobileSummary>

            {isExpanded && hasVotesHistory ? (
                <AssetRow>
                    <AssetRegistryVoteHistory rows={votesHistory} />
                </AssetRow>
            ) : null}
        </ItemCard>
    );
};

export default AssetRegistryListItem;
