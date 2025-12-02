import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getPoolMembers } from 'api/amm';

import { getIsTestnetEnv } from 'helpers/env';
import { formatBalance } from 'helpers/format-number';

import { useUpdateIndex } from 'hooks/useUpdateIndex';

import { PoolBalance } from 'types/amm';

import LinkIcon from 'assets/icons/nav/icon-external-link-16.svg';

import PageLoader from 'basics/loaders/PageLoader';
import Pagination from 'basics/Pagination';

import PublicKeyWithIcon from 'components/PublicKeyWithIcon';

import { respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import { Empty } from 'pages/profile/YourVotes/YourVotes';

const PAGE_SIZE = 10;

const Title = styled.h3`
    margin-bottom: 2.4rem;
`;
const Row = styled.div`
    display: flex;
    align-items: center;
    color: ${COLORS.textGray};
    margin: 1rem 0;
    height: 2.8rem;

    span:last-child {
        margin-left: auto;
    }

    ${respondDown(Breakpoints.md)`
        font-size: 1rem;
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

    svg {
        margin-left: 0.4rem;
    }

    ${respondDown(Breakpoints.md)`
        font-size: 1rem;
        width: 17rem;

        svg {
            margin-bottom: 0.2rem;
        }
    `}
`;

const PoolMembers = ({ poolId, totalShare }: { poolId: string; totalShare: string }) => {
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
            {members
                .sort((a, b) => Number(b.balance) - Number(a.balance))
                .map(member => (
                    <Row key={member.account_address}>
                        <LinkToExpert
                            href={`https://stellar.expert/explorer/${
                                getIsTestnetEnv() ? 'testnet' : 'public'
                            }/${member.account_address.startsWith('G') ? 'account' : 'contract'}/${
                                member.account_address
                            }`}
                            target="_blank"
                        >
                            <PublicKeyWithIcon pubKey={member.account_address} />
                            <LinkIcon />
                        </LinkToExpert>

                        <span>
                            {formatBalance(Number(member.balance) / 1e7, true)} (
                            {Number(totalShare)
                                ? formatBalance(
                                      (100 * Number(member.balance)) /
                                          1e7 /
                                          (Number(totalShare) / 1e7),
                                      true,
                                  )
                                : '0'}
                            %)
                        </span>
                    </Row>
                ))}
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
