import * as React from 'react';

import Table, { CellAlign } from 'basics/Table';

import ProposalStatus from 'pages/governance/components/GovernanceMainPage/ProposalStatus/ProposalStatus';

import {
    Header,
    HistoryTable,
    SupportedByPercent,
    Value,
    VoteTitle,
} from './AssetRegistryVoteHistory.styled';

import { AssetRegistryHistoryEntry } from '../../AssetRegistryMainPage.types';
import AssetRegistryStatusBadge from '../AssetRegistryStatusBadge/AssetRegistryStatusBadge';

type AssetRegistryVoteHistoryProps = {
    rows: AssetRegistryHistoryEntry[];
};

const Result = ({
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

    return <SupportedByPercent>{percentFor.toFixed(2)} %</SupportedByPercent>;
};

const AssetRegistryVoteHistory = ({ rows }: AssetRegistryVoteHistoryProps) => (
    <>
        <Header>
            <VoteTitle>Vote history</VoteTitle>
        </Header>
        <HistoryTable>
            <Table
                head={[
                    { children: 'Date' },
                    { children: 'Proposed to' },
                    { children: 'Supported by', align: CellAlign.Right },
                    { children: 'Results', align: CellAlign.Right },
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
                            label: 'Proposed to:',
                        },
                        {
                            children: (
                                <Result
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
