import * as React from 'react';

import Table, { CellAlign } from 'basics/Table';

import { COLORS } from 'styles/style-constants';

import ProposalStatus from 'pages/governance/components/GovernanceMainPage/ProposalStatus/ProposalStatus';

import {
    Header,
    HistoryTable,
    SupportedByInner,
    SupportedByOuter,
    SupportedByProgress,
    Value,
    VoteTitle,
} from './AssetRegistryVoteHistory.styled';

import { AssetRegistryHistoryEntry } from '../../AssetRegistryMainPage.types';
import AssetRegistryStatusBadge from '../AssetRegistryStatusBadge/AssetRegistryStatusBadge';

type AssetRegistryVoteHistoryProps = {
    rows: AssetRegistryHistoryEntry[];
};

const SupportedByBar = ({
    voteForResult,
    voteAgainstResult,
    voteAbstainResult,
}: Pick<
    AssetRegistryHistoryEntry,
    'voteForResult' | 'voteAgainstResult' | 'voteAbstainResult'
>) => {
    const voteFor = Number(voteForResult);
    const voteAgainst = Number(voteAgainstResult);
    const voteAbstain = Number(voteAbstainResult);
    const totalVotes = voteFor + voteAgainst + voteAbstain;

    if (!totalVotes) {
        return <Value>-</Value>;
    }

    const percentFor = (voteFor / totalVotes) * 100;
    const percentForAndAbstain = ((voteFor + voteAbstain) / totalVotes) * 100;

    return (
        <SupportedByProgress>
            <SupportedByOuter>
                <SupportedByInner $width={`${percentForAndAbstain}%`} $color={COLORS.gray100} />
                <SupportedByInner $width={`${percentFor}%`} $color={COLORS.purple500} />
            </SupportedByOuter>
        </SupportedByProgress>
    );
};

const AssetRegistryVoteHistory = ({ rows }: AssetRegistryVoteHistoryProps) => (
    <>
        <Header>
            <VoteTitle>Votes history</VoteTitle>
        </Header>
        <HistoryTable>
            <Table
                head={[
                    { children: 'Date:' },
                    { children: 'Propose to:' },
                    { children: 'Supported by:', align: CellAlign.Right },
                    { children: 'Results:', align: CellAlign.Right },
                ]}
                body={rows.map(row => ({
                    key: row.id,
                    isNarrow: true,
                    rowItems: [
                        {
                            children: <Value>{row.date}</Value>,
                            label: 'Date:',
                        },
                        {
                            children: (
                                <AssetRegistryStatusBadge
                                    variant={row.proposedToVariant}
                                    label={row.proposedToLabel}
                                    withIcon
                                />
                            ),
                            label: 'Propose to:',
                        },
                        {
                            children: (
                                <SupportedByBar
                                    voteForResult={row.voteForResult}
                                    voteAgainstResult={row.voteAgainstResult}
                                    voteAbstainResult={row.voteAbstainResult}
                                />
                            ),
                            label: 'Supported by:',
                            align: CellAlign.Right,
                        },
                        {
                            children: <ProposalStatus status={row.resultsStatus} />,
                            label: 'Results:',
                            align: CellAlign.Right,
                        },
                    ],
                }))}
            />
        </HistoryTable>
    </>
);

export default AssetRegistryVoteHistory;
