import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { getAssetDetails } from 'api/stellar-expert';

import { PROPOSAL_STATUS } from 'constants/dao';

import { getAssetString } from 'helpers/assets';
import { getDateString } from 'helpers/date';
import { formatBalance } from 'helpers/format-number';
import { createAsset } from 'helpers/token';

import useAssetsStore from 'store/assetsStore/useAssetsStore';

import ArrowDown from 'assets/icons/arrows/arrow-down-16.svg';
import IconInfo from 'assets/icons/status/icon-info-16.svg';

import Asset from 'basics/Asset';
import DotsLoader from 'basics/loaders/DotsLoader';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import {
    AssetRow,
    ChevronButton,
    ChevronIconWrap,
    ChevronPlaceholder,
    DesktopBadgeWrap,
    HoldersMetric,
    InfoIconWrap,
    InfoLabelWrap,
    ItemCard,
    MetricLabel,
    MetricValue,
    MobileBadgeWrap,
    SummaryLeft,
    SummaryRight,
    Summary,
    TvlMetric,
    VolumeMetric,
} from './AssetRegistryListItem.styled';

import {
    AssetRegistryBadgeVariant,
    RegistryAsset,
    RegistryAssetMarketStatsMap,
    RegistryAssetProposal,
} from '../../AssetRegistryMainPage.types';
import AssetRegistryStatusBadge from '../AssetRegistryStatusBadge/AssetRegistryStatusBadge';
import AssetRegistryVoteHistory from '../AssetRegistryVoteHistory/AssetRegistryVoteHistory';

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
    marketStats: RegistryAssetMarketStatsMap;
    isMarketStatsLoading: boolean;
    isExpanded: boolean;
    onToggle: () => void;
};

const AssetRegistryListItem = ({
    item,
    marketStats,
    isMarketStatsLoading,
    isExpanded,
    onToggle,
}: AssetRegistryListItemProps) => {
    const asset = useMemo(
        () => createAsset(item.asset_code, item.asset_issuer ?? ''),
        [item.asset_code, item.asset_issuer],
    );
    const { assetsInfo } = useAssetsStore();
    const [lumenHolders, setLumenHolders] = useState<number | null>(null);

    useEffect(() => {
        if (!asset.isNative()) {
            return undefined;
        }

        let isCancelled = false;

        setLumenHolders(null);

        getAssetDetails(asset)
            .then(details => {
                if (!isCancelled) {
                    setLumenHolders(details?.trustlines?.[0] ?? 0);
                }
            })
            .catch(() => {
                if (!isCancelled) {
                    setLumenHolders(0);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [asset]);

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
        .map(proposal => ({
            id: String(proposal.id),
            date: getDateString(new Date(proposal.end_at ?? proposal.created_at).getTime()),
            proposedToLabel: getProposalTargetLabel(proposal.proposal_type),
            proposedToVariant: getProposalTargetVariant(proposal.proposal_type),
            voteForResult: proposal.vote_for_result,
            voteAgainstResult: proposal.vote_against_result,
            voteAbstainResult: proposal.vote_abstain_result,
            resultsStatus: getProposalResultsStatus(proposal),
        }));
    const hasVotesHistory = votesHistory.length > 0;
    const assetContract = item.asset_contract_address ?? asset.contract;
    const currentMarketStats = marketStats[assetContract];

    const assetHolders = useMemo(() => {
        if (asset.isNative()) {
            return lumenHolders === null ? <DotsLoader /> : formatBalance(lumenHolders);
        }

        const holders = assetsInfo.get(getAssetString(asset))?.accounts_authorized;

        return holders === undefined ? '—' : formatBalance(holders);
    }, [asset, assetsInfo, lumenHolders]);

    const getUsdAmountView = (value?: number) => {
        if (isMarketStatsLoading) {
            return <DotsLoader />;
        }

        if (value === undefined) {
            return '—';
        }

        return `$${formatBalance(value, true, true)}`;
    };

    const tooltipContent = 'Data from Aquarius AMM.';
    const renderInfoTooltip = () => (
        <Tooltip content={tooltipContent} position={TOOLTIP_POSITION.top} showOnHover>
            <InfoIconWrap>
                <IconInfo />
            </InfoIconWrap>
        </Tooltip>
    );

    return (
        <ItemCard>
            <Summary>
                <MobileBadgeWrap>
                    <AssetRegistryStatusBadge
                        variant={statusBadge.variant}
                        label={statusBadge.label}
                    />
                </MobileBadgeWrap>

                <SummaryLeft>
                    <Asset
                        asset={asset}
                        variant="compactDomain"
                        state={item.whitelisted ? 'default' : 'revoked'}
                    />
                </SummaryLeft>

                <SummaryRight>
                    <HoldersMetric>
                        <MetricLabel>Asset Holders</MetricLabel>
                        <MetricValue>{assetHolders}</MetricValue>
                    </HoldersMetric>
                    <TvlMetric>
                        <MetricLabel>
                            <InfoLabelWrap>
                                TVL
                                {renderInfoTooltip()}
                            </InfoLabelWrap>
                        </MetricLabel>
                        <MetricValue>{getUsdAmountView(currentMarketStats?.tvlUsd)}</MetricValue>
                    </TvlMetric>
                    <VolumeMetric>
                        <MetricLabel>
                            <InfoLabelWrap>
                                Volume 24H
                                {renderInfoTooltip()}
                            </InfoLabelWrap>
                        </MetricLabel>
                        <MetricValue>{getUsdAmountView(currentMarketStats?.volumeUsd)}</MetricValue>
                    </VolumeMetric>
                    <DesktopBadgeWrap>
                        <AssetRegistryStatusBadge
                            variant={statusBadge.variant}
                            label={statusBadge.label}
                        />
                    </DesktopBadgeWrap>
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
            </Summary>

            {isExpanded && hasVotesHistory ? (
                <AssetRow>
                    <AssetRegistryVoteHistory rows={votesHistory} />
                </AssetRow>
            ) : null}
        </ItemCard>
    );
};

export default AssetRegistryListItem;
