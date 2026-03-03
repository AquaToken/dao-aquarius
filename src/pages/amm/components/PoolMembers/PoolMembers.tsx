import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getPoolMembers } from 'api/amm';

import { contractValueToAmount } from 'helpers/amount';
import getExplorerLink, { ExplorerSection } from 'helpers/explorer-links';
import { formatBalance } from 'helpers/format-number';

import { useUpdateIndex } from 'hooks/useUpdateIndex';

import { PoolBalance } from 'types/amm';

import LinkIcon from 'assets/icons/nav/icon-external-link-16.svg';
import Lock from 'assets/icons/objects/icon-lock-16.svg';

import Label from 'basics/Label';
import PageLoader from 'basics/loaders/PageLoader';
import Pagination from 'basics/Pagination';
import Table, { CellAlign } from 'basics/Table';

import PublicKeyWithIcon from 'components/PublicKeyWithIcon';

import { respondDown } from 'styles/mixins';
import { Breakpoints, COLORS, FONT_SIZE } from 'styles/style-constants';

import { Empty } from 'pages/profile/YourVotes/YourVotes';

const PAGE_SIZE = 10;

const Title = styled.h3`
    ${respondDown(Breakpoints.md)`
        margin-bottom: 1.2rem;
    `}
`;

const LinkToExpert = styled.a`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.textTertiary};
    text-decoration: none;
    width: 22rem;
    margin-right: auto;

    svg {
        margin-left: 0.4rem;
    }

    ${respondDown(Breakpoints.md)`
        font-size: 1rem;
        width: 17rem;
    `}
`;

const LabelInner = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem !important;
    font-weight: 400;
    ${FONT_SIZE.sm};
`;

const PoolMembers = ({
    poolId,
    totalShare,
    shareTokenDecimals,
}: {
    poolId: string;
    totalShare: string;
    shareTokenDecimals: number;
}) => {
    const [members, setMembers] = useState<PoolBalance[]>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(null);

    const updateIndex = useUpdateIndex(5000);

    useEffect(() => {
        getPoolMembers(poolId, page, PAGE_SIZE).then(
            ({ members, total, page: pageFromResponse }) => {
                if (pageFromResponse !== page) {
                    return;
                }
                setMembers(members);
                setTotal(total);
            },
        );
    }, [page, updateIndex]);

    if (!members) {
        return <PageLoader />;
    }

    if (!members.length) {
        return (
            <div>
                <Title>Pool members</Title>
                <Empty>
                    <h3>There's nothing here.</h3>
                </Empty>
            </div>
        );
    }

    return (
        <div>
            <Title>Pool members</Title>
            <Table
                head={[]}
                body={members
                    .sort((a, b) => Number(b.balance) - Number(a.balance))
                    .map(member => ({
                        key: member.account_address,
                        isNarrow: true,
                        mobileBackground: COLORS.gray50,
                        rowItems: [
                            {
                                children: (
                                    <LinkToExpert
                                        href={getExplorerLink(
                                            member.account_address.startsWith('G')
                                                ? ExplorerSection.account
                                                : ExplorerSection.contract,
                                            member.account_address,
                                        )}
                                        target="_blank"
                                    >
                                        <PublicKeyWithIcon pubKey={member.account_address} />
                                        <LinkIcon />
                                    </LinkToExpert>
                                ),
                                label: 'Account',
                            },
                            {
                                children: !member.rewards_enabled && (
                                    <Label
                                        labelText={
                                            <LabelInner>
                                                <Lock /> <span>Rewards Disabled</span>
                                            </LabelInner>
                                        }
                                        background={COLORS.white}
                                        color={COLORS.textGray}
                                        withoutBorder
                                        labelSize="default"
                                        withoutUppercase
                                    />
                                ),
                                label: 'Rewards',
                                align: CellAlign.Right,
                                hideOnMobile: true,
                            },
                            {
                                children: !member.rewards_enabled && (
                                    <Label
                                        labelText={
                                            <LabelInner>
                                                <Lock /> <span>Rewards Disabled</span>
                                            </LabelInner>
                                        }
                                        background={COLORS.gray50}
                                        color={COLORS.textGray}
                                        withoutBorder
                                        labelSize="default"
                                        withoutUppercase
                                    />
                                ),
                                label: 'Rewards',
                                align: CellAlign.Right,
                                hideOnMobile: member.rewards_enabled,
                                hideOnWeb: true,
                            },
                            {
                                children: (
                                    <span>
                                        {formatBalance(
                                            Number(
                                                contractValueToAmount(
                                                    member.balance,
                                                    shareTokenDecimals,
                                                ),
                                            ),
                                            true,
                                        )}{' '}
                                        (
                                        {Number(totalShare)
                                            ? formatBalance(
                                                  (100 *
                                                      Number(
                                                          contractValueToAmount(
                                                              member.balance,
                                                              shareTokenDecimals,
                                                          ),
                                                      )) /
                                                      Number(
                                                          contractValueToAmount(
                                                              totalShare,
                                                              shareTokenDecimals,
                                                          ),
                                                      ),
                                                  true,
                                              )
                                            : '0'}
                                        %)
                                    </span>
                                ),
                                flexSize: 0.4,
                                align: CellAlign.Right,
                                label: 'Shares',
                            },
                        ],
                    }))}
            />

            <Pagination
                pageSize={PAGE_SIZE}
                totalCount={total}
                onPageChange={setPage}
                currentPage={page}
                itemName="members"
            />
        </div>
    );
};

export default PoolMembers;
