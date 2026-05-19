import * as React from 'react';

import { AppRoutes } from 'constants/routes';

import { getPercentValue } from 'helpers/number';

import Check16 from 'assets/icons/small-icons/check/icon-check-16.svg';
import Pending16 from 'assets/icons/status/pending-16.svg';

import DotsLoader from 'basics/loaders/DotsLoader';
import { ProgressLine } from 'basics/progress';

import { COLORS } from 'styles/style-constants';

import {
    Card,
    Description,
    Header,
    ProgressWrap,
    ReadMoreLink,
    StatusBadge,
    Title,
} from './AssetRegistryMigrationStatus.styled';

type AssetRegistryMigrationStatusProps = {
    whitelistedAssetsCount?: number;
    totalAmmRewardsAmount?: number;
    whitelistedAmmRewardsAmount?: number;
    isAssetsLoading: boolean;
    isRewardsLoading: boolean;
};

enum AssetMigrationStatusStage {
    awaitingThreshold = 'awaitingThreshold',
    thresholdReached = 'thresholdReached',
    migrationScheduled = 'migrationScheduled',
    live = 'live',
}

const ASSET_MIGRATION_TOTAL_ASSETS_TARGET = 15;
const ASSET_MIGRATION_REWARD_TARGET = 50;
const ASSET_MIGRATION_PROPOSAL_ID = '125';
const MIGRATION_GO_LIVE_DATE = '01 Jun, 2026';
const manualMigrationStatusStage:
    | AssetMigrationStatusStage.migrationScheduled
    | AssetMigrationStatusStage.live
    | null = AssetMigrationStatusStage.migrationScheduled;

const MIGRATION_STATUS_CONTENT = {
    [AssetMigrationStatusStage.awaitingThreshold]: {
        badgeLabel: 'Awaiting Threshold',
        title: 'Whitelisted Rewards Not Yet Active',
        description:
            'Once one of the conditions below is met, Aquarius will switch to a new rewards model — only markets containing whitelisted assets will be eligible for AQUA rewards.',
    },
    [AssetMigrationStatusStage.thresholdReached]: {
        badgeLabel: 'Threshold Reached',
        title: 'Whitelisted Rewards Approved',
        description:
            'The threshold has been reached. Aquarius will soon switch to a new rewards model — only markets with whitelisted assets will earn AQUA rewards going forward.',
    },
    [AssetMigrationStatusStage.migrationScheduled]: {
        badgeLabel: 'Migration Scheduled',
        title: `Whitelisted Rewards Going Live on ${MIGRATION_GO_LIVE_DATE}`,
        description: `On ${MIGRATION_GO_LIVE_DATE}, Aquarius will switch to whitelisted-only rewards. Only markets containing whitelisted assets will be eligible for AQUA rewards from that point on.`,
    },
    [AssetMigrationStatusStage.live]: {
        badgeLabel: 'Live',
        title: 'Whitelisted Rewards Active',
        description:
            'Aquarius now distributes AQUA rewards exclusively to markets containing whitelisted assets.',
    },
} as const;

const AssetRegistryMigrationStatus = ({
    whitelistedAssetsCount,
    totalAmmRewardsAmount,
    whitelistedAmmRewardsAmount,
    isAssetsLoading,
    isRewardsLoading,
}: AssetRegistryMigrationStatusProps) => {
    const approvedAssetsPercent = isAssetsLoading
        ? 0
        : +getPercentValue(Number(whitelistedAssetsCount), ASSET_MIGRATION_TOTAL_ASSETS_TARGET);
    const rewardsAlignmentPercent =
        !isRewardsLoading && totalAmmRewardsAmount && whitelistedAmmRewardsAmount !== undefined
            ? getPercentValue(whitelistedAmmRewardsAmount, totalAmmRewardsAmount)
            : undefined;
    const isThresholdReached =
        approvedAssetsPercent >= 100 ||
        Number(rewardsAlignmentPercent ?? 0) >= ASSET_MIGRATION_REWARD_TARGET;
    const resolvedMigrationStatusStage: AssetMigrationStatusStage =
        manualMigrationStatusStage ??
        (isThresholdReached
            ? AssetMigrationStatusStage.thresholdReached
            : AssetMigrationStatusStage.awaitingThreshold);
    const migrationStatus = MIGRATION_STATUS_CONTENT[resolvedMigrationStatusStage];
    const isMigrationComplete = resolvedMigrationStatusStage === AssetMigrationStatusStage.live;

    return (
        <Card>
            <Header>
                <Title>{migrationStatus.title}</Title>
                <StatusBadge $isComplete={isMigrationComplete}>
                    {isMigrationComplete ? <Check16 /> : <Pending16 />}
                    {migrationStatus.badgeLabel}
                </StatusBadge>
            </Header>

            <Description>{migrationStatus.description}</Description>

            <ProgressWrap>
                <ProgressLine
                    leftLabel="Approved Assets"
                    rightLabel={
                        isAssetsLoading ? (
                            <DotsLoader />
                        ) : (
                            `${whitelistedAssetsCount ?? 0}/${ASSET_MIGRATION_TOTAL_ASSETS_TARGET}`
                        )
                    }
                    percent={approvedAssetsPercent}
                    color={COLORS.blue500}
                    isAnimated
                />
                <ProgressLine
                    leftLabel="AQUA Rewards Alignment"
                    rightLabel={
                        isRewardsLoading || rewardsAlignmentPercent === undefined ? (
                            <DotsLoader />
                        ) : (
                            `${rewardsAlignmentPercent}/${ASSET_MIGRATION_REWARD_TARGET}%`
                        )
                    }
                    percent={Math.min(
                        100,
                        isRewardsLoading
                            ? 0
                            : +getPercentValue(
                                  Number(rewardsAlignmentPercent),
                                  ASSET_MIGRATION_REWARD_TARGET,
                              ),
                    )}
                    isAnimated
                />
            </ProgressWrap>

            <ReadMoreLink
                href={AppRoutes.section.governance.to.proposal({
                    id: ASSET_MIGRATION_PROPOSAL_ID,
                })}
            >
                Read more
            </ReadMoreLink>
        </Card>
    );
};

export default AssetRegistryMigrationStatus;
