import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { getActiveRegistryVotingRequest } from 'api/asset-registry';
import { getAssetDetails } from 'api/stellar-expert';

import { VoteOptions } from 'constants/dao';
import { DAY } from 'constants/intervals';
import { AppRoutes } from 'constants/routes';

import { getAssetString } from 'helpers/assets';
import { getDateString } from 'helpers/date';
import { formatBalance } from 'helpers/format-number';
import { createAsset } from 'helpers/token';

import useAssetsStore from 'store/assetsStore/useAssetsStore';
import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import { Proposal } from 'types/governance';

import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';

import IconInfo from 'assets/icons/status/icon-info-16.svg';

import Asset from 'basics/Asset';
import Button from 'basics/buttons/Button';
import { VoteIcon } from 'basics/icons';
import DotsLoader from 'basics/loaders/DotsLoader';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import CurrentResults from 'pages/governance/components/GovernanceMainPage/ProposalPreview/CurrentResults/CurrentResults';
import ConfirmVoteModal from 'pages/governance/components/GovernanceVoteProposalPage/ConfirmVoteModal/ConfirmVoteModal';

import {
    AbstainButton,
    AgainstButton,
    Card,
    CardTitle,
    DetailsLink,
    Divider,
    FooterRow,
    ForButton,
    Header,
    HeaderAsset,
    InfoIconWrap,
    InfoLabelWrap,
    Meta,
    MetaLabel,
    MetaValue,
    Section,
    Stats,
    VotingButtonsRow,
} from './ActiveVotingCard.styled';

import {
    AssetRegistryBadgeVariant,
    RegistryAssetMarketStatsMap,
    UpcomingVoteData,
} from '../../AssetRegistryMainPage.types';
import AssetRegistryStatusBadge from '../AssetRegistryStatusBadge/AssetRegistryStatusBadge';

type ActiveVotingCardProps = {
    marketStats: RegistryAssetMarketStatsMap;
    isMarketStatsLoading: boolean;
    upcomingVotes: UpcomingVoteData[];
};

const getEndsInLabel = (proposal: Proposal) => {
    const { end_at: endAt } = proposal;

    if (!endAt) {
        return '—';
    }

    const diff = new Date(endAt).getTime() - Date.now();

    if (diff <= 0) {
        return '0 days';
    }

    const days = Math.ceil(diff / DAY);

    return `${days} day${days === 1 ? '' : 's'}`;
};

const ActiveVotingCard = ({
    marketStats,
    isMarketStatsLoading,
    upcomingVotes,
}: ActiveVotingCardProps) => {
    const [activeVoting, setActiveVoting] = useState<Proposal | null>(null);
    const [selectedOption, setSelectedOption] = useState<{
        option: VoteOptions;
        key: string;
        endDate: string;
        startDate: string;
    } | null>(null);
    const { isLogged } = useAuthStore();

    useEffect(() => {
        let isCancelled = false;

        getActiveRegistryVotingRequest()
            .then(data => {
                if (!isCancelled) {
                    setActiveVoting(data);
                }
            })
            .catch(() => {
                if (!isCancelled) {
                    setActiveVoting(null);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, []);
    const nextVoting = upcomingVotes[0] ?? null;
    const isActiveVoting = Boolean(activeVoting);
    const assetCode = activeVoting?.asset_code ?? nextVoting?.assetCode ?? null;
    const assetIssuer = activeVoting?.asset_issuer ?? nextVoting?.assetIssuer ?? '';
    const assetContract = activeVoting?.asset_contract_address ?? null;
    const asset = useMemo(
        () => (assetCode ? createAsset(assetCode, assetIssuer) : null),
        [assetCode, assetIssuer],
    );
    const { assetsInfo } = useAssetsStore();
    const [lumenHolders, setLumenHolders] = useState<number | null>(null);

    useEffect(() => {
        if (!asset?.isNative()) {
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

    useEffect(() => {
        if (isLogged && selectedOption) {
            ModalService.openModal(ConfirmVoteModal, selectedOption).then(() => {
                setSelectedOption(null);
            });
        }
    }, [isLogged, selectedOption]);

    const assetHolders = useMemo(() => {
        if (!asset) {
            return '—';
        }

        if (asset.isNative()) {
            return lumenHolders === null ? <DotsLoader /> : formatBalance(lumenHolders);
        }

        const holders = assetsInfo.get(getAssetString(asset))?.accounts_authorized;

        return holders === undefined ? '—' : formatBalance(holders);
    }, [asset, assetsInfo, lumenHolders]);

    if (!assetCode || !asset) {
        return null;
    }

    const currentMarketStats = marketStats[assetContract ?? asset.contract];
    const endsAt = isActiveVoting && activeVoting ? activeVoting.end_at : null;
    const nextVotingStartsAt =
        !isActiveVoting && nextVoting ? nextVoting.startsAt.replace(/^Starts\s+/i, '') : null;

    const getUsdAmountView = (value?: number) => {
        if (isMarketStatsLoading) {
            return <DotsLoader />;
        }

        if (value === undefined) {
            return '—';
        }

        return `$${formatBalance(value, true, true)}`;
    };

    const renderInfoTooltip = () => (
        <Tooltip content="Data from Aquarius AMM." position={TOOLTIP_POSITION.top} showOnHover>
            <InfoIconWrap>
                <IconInfo />
            </InfoIconWrap>
        </Tooltip>
    );

    const onVoteClick = (option: {
        option: VoteOptions;
        key: string;
        endDate: string;
        startDate: string;
        proposal?: Proposal;
    }) => {
        if (isLogged) {
            ModalService.openModal(ConfirmVoteModal, option);
            return;
        }

        setSelectedOption(option);
        ModalService.openModal(ChooseLoginMethodModal, {
            callback: () => ModalService.openModal(ConfirmVoteModal, option),
        });
    };

    return (
        <Card>
            <CardTitle>{isActiveVoting ? 'Active Voting' : 'Next Voting'}</CardTitle>

            <Header>
                <HeaderAsset>
                    <Asset asset={asset} variant="compactDomain" />
                </HeaderAsset>
                {isActiveVoting && activeVoting ? (
                    <AssetRegistryStatusBadge
                        variant={
                            activeVoting.proposal_type === 'ADD_ASSET'
                                ? AssetRegistryBadgeVariant.whitelisted
                                : AssetRegistryBadgeVariant.revoked
                        }
                        label={activeVoting.proposal_type === 'ADD_ASSET' ? 'Whitelist' : 'Revoke'}
                        withIcon
                    />
                ) : nextVoting ? (
                    <AssetRegistryStatusBadge
                        variant={
                            nextVoting.type === 'ADD_ASSET'
                                ? AssetRegistryBadgeVariant.whitelisted
                                : AssetRegistryBadgeVariant.revoked
                        }
                        label={nextVoting.type === 'ADD_ASSET' ? 'Whitelist' : 'Revoke'}
                        withIcon
                    />
                ) : null}
            </Header>

            <Stats>
                <Meta>
                    <MetaLabel>Asset Holders</MetaLabel>
                    <MetaValue>{assetHolders}</MetaValue>
                </Meta>
                <Meta>
                    <MetaLabel>
                        <InfoLabelWrap>
                            TVL
                            {renderInfoTooltip()}
                        </InfoLabelWrap>
                    </MetaLabel>
                    <MetaValue>{getUsdAmountView(currentMarketStats?.tvlUsd)}</MetaValue>
                </Meta>
                <Meta>
                    <MetaLabel>
                        <InfoLabelWrap>
                            Volume 24H
                            {renderInfoTooltip()}
                        </InfoLabelWrap>
                    </MetaLabel>
                    <MetaValue>{getUsdAmountView(currentMarketStats?.volumeUsd)}</MetaValue>
                </Meta>
            </Stats>

            <Divider />

            {isActiveVoting && activeVoting ? (
                <>
                    <Section>
                        <MetaValue>Current results</MetaValue>
                        <CurrentResults
                            proposal={activeVoting}
                            withResultLabel={false}
                            isEmptyStateCompact
                        />
                    </Section>

                    <Section>
                        <MetaValue>Your vote</MetaValue>
                        <VotingButtonsRow>
                            <ForButton
                                fullWidth
                                onClick={() =>
                                    onVoteClick({
                                        option: VoteOptions.for,
                                        key: activeVoting.vote_for_issuer ?? '',
                                        endDate: activeVoting.end_at ?? '',
                                        startDate: activeVoting.start_at ?? '',
                                        proposal: activeVoting,
                                    })
                                }
                            >
                                <VoteIcon option={VoteOptions.for} size="medium" />
                            </ForButton>
                            <AbstainButton
                                fullWidth
                                onClick={() =>
                                    onVoteClick({
                                        option: VoteOptions.abstain,
                                        key: activeVoting.abstain_issuer ?? '',
                                        endDate: activeVoting.end_at ?? '',
                                        startDate: activeVoting.start_at ?? '',
                                        proposal: activeVoting,
                                    })
                                }
                            >
                                <VoteIcon option={VoteOptions.abstain} size="medium" />
                            </AbstainButton>
                            <AgainstButton
                                fullWidth
                                onClick={() =>
                                    onVoteClick({
                                        option: VoteOptions.against,
                                        key: activeVoting.vote_against_issuer ?? '',
                                        endDate: activeVoting.end_at ?? '',
                                        startDate: activeVoting.start_at ?? '',
                                        proposal: activeVoting,
                                    })
                                }
                            >
                                <VoteIcon option={VoteOptions.against} size="medium" />
                            </AgainstButton>
                        </VotingButtonsRow>
                    </Section>

                    <Divider />

                    <FooterRow>
                        <MetaLabel>Ends in {getEndsInLabel(activeVoting)}</MetaLabel>
                        <MetaValue>
                            {endsAt ? getDateString(new Date(endsAt).getTime()) : '—'}
                        </MetaValue>
                    </FooterRow>

                    <DetailsLink
                        to={AppRoutes.section.assetRegistry.to.voting({
                            id: String(activeVoting.id),
                        })}
                    >
                        <Button isRounded fullWidth>
                            Details
                        </Button>
                    </DetailsLink>
                </>
            ) : (
                <FooterRow>
                    <MetaLabel>Starts at</MetaLabel>
                    <MetaValue>{nextVotingStartsAt ?? '—'}</MetaValue>
                </FooterRow>
            )}
        </Card>
    );
};

export default ActiveVotingCard;
