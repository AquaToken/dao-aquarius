import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { getActiveRegistryVotingRequest } from 'api/asset-registry';
import { getAssetDetails } from 'api/stellar-expert';

import { DAY } from 'constants/intervals';

import { getAssetString } from 'helpers/assets';
import { getDateString } from 'helpers/date';
import { formatBalance } from 'helpers/format-number';
import { createAsset } from 'helpers/token';

import useAssetsStore from 'store/assetsStore/useAssetsStore';

import IconInfo from 'assets/icons/status/icon-info-16.svg';

import Asset from 'basics/Asset';
import Button from 'basics/buttons/Button';
import DotsLoader from 'basics/loaders/DotsLoader';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import {
    Card,
    CardTitle,
    Divider,
    FooterRow,
    Header,
    HeaderAsset,
    InfoIconWrap,
    InfoLabelWrap,
    Meta,
    MetaLabel,
    MetaValue,
    ProgressBar,
    ProgressFill,
    Section,
    Stats,
} from './ActiveVotingCard.styled';

import {
    ActiveRegistryProposal,
    AssetRegistryBadgeVariant,
    RegistryAssetMarketStatsMap,
    RegistryAssetProposal,
} from '../../AssetRegistryMainPage.types';
import AssetRegistryStatusBadge from '../AssetRegistryStatusBadge/AssetRegistryStatusBadge';
import VoteChoiceSelector from '../VoteChoiceSelector/VoteChoiceSelector';

type ActiveVotingCardProps = {
    marketStats: RegistryAssetMarketStatsMap;
    isMarketStatsLoading: boolean;
};

const getEndsInLabel = (proposal: RegistryAssetProposal) => {
    const endAt = proposal.new_end_at ?? proposal.end_at;

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

const getSupportPercent = (proposal: RegistryAssetProposal) => {
    const voteFor = Number(proposal.vote_for_result);
    const voteAgainst = Number(proposal.vote_against_result);
    const voteAbstain = Number(proposal.vote_abstain_result);
    const totalVotes = voteFor + voteAgainst + voteAbstain;

    return totalVotes ? Math.round((voteFor / totalVotes) * 100) : 0;
};

const ActiveVotingCard = ({ marketStats, isMarketStatsLoading }: ActiveVotingCardProps) => {
    const [activeVoting, setActiveVoting] = useState<ActiveRegistryProposal | null>(null);

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
    const asset = useMemo(
        () =>
            activeVoting?.asset_code
                ? createAsset(activeVoting.asset_code, activeVoting.asset_issuer ?? '')
                : null,
        [activeVoting?.asset_code, activeVoting?.asset_issuer],
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

    if (!activeVoting || !asset) {
        return null;
    }

    const assetContract = activeVoting.asset_contract_address ?? asset.contract;
    const currentMarketStats = marketStats[assetContract];
    const supportPercent = getSupportPercent(activeVoting);
    const endsAt = activeVoting.new_end_at ?? activeVoting.end_at;

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

    return (
        <Card>
            <CardTitle>Active voting</CardTitle>

            <Header>
                <HeaderAsset>
                    <Asset asset={asset} variant="compactDomain" />
                </HeaderAsset>
                <AssetRegistryStatusBadge
                    variant={AssetRegistryBadgeVariant.inVoting}
                    label="In voting"
                />
            </Header>

            <Stats>
                <Meta>
                    <MetaLabel>Asset holders</MetaLabel>
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

            <Section>
                <MetaValue>{supportPercent}% support</MetaValue>
                <ProgressBar>
                    <ProgressFill style={{ width: `${supportPercent}%` }} />
                </ProgressBar>
            </Section>

            <Section>
                <MetaValue>Your vote</MetaValue>
                <VoteChoiceSelector value="for" />
            </Section>

            <Divider />

            <FooterRow>
                <MetaLabel>Ends in {getEndsInLabel(activeVoting)}</MetaLabel>
                <MetaValue>{endsAt ? getDateString(new Date(endsAt).getTime()) : '—'}</MetaValue>
            </FooterRow>

            <Button isRounded fullWidth>
                Details
            </Button>
        </Card>
    );
};

export default ActiveVotingCard;
