import * as React from 'react';

import Table, { CellAlign } from 'basics/Table';

import ProposalStatus from 'pages/governance/components/GovernanceMainPage/ProposalStatus/ProposalStatus';

import { Header, HistoryTable, Value, VoteTitle } from './AssetRegistryVoteHistory.styled';

import { AssetRegistryHistoryEntry } from '../../AssetRegistryMainPage.types';
import AssetRegistryStatusBadge from '../AssetRegistryStatusBadge/AssetRegistryStatusBadge';

type AssetRegistryVoteHistoryProps = {
    rows: AssetRegistryHistoryEntry[];
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
                            children: <Value>{row.supportedBy}</Value>,
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
