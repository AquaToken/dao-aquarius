import * as React from 'react';
import AccountViewer from '../../../../common/basics/AccountViewer';
import { formatBalance } from '../../../../common/helpers/helpers';
import { useEffect, useState } from 'react';
import { getPoolMembers } from '../../api/api';
import styled from 'styled-components';
import { flexRowSpaceBetween } from '../../../../common/mixins';
import { COLORS } from '../../../../common/styles';
import Pagination from '../../../../common/basics/Pagination';
import PageLoader from '../../../../common/basics/PageLoader';
import { Empty } from '../../../profile/YourVotes/YourVotes';
import { useUpdateIndex } from '../../../../common/hooks/useUpdateIndex';

const PAGE_SIZE = 10;

const Title = styled.h3`
    margin-bottom: 2.4rem;
`;
const Row = styled.div`
    ${flexRowSpaceBetween};
    align-items: center;
    color: ${COLORS.grayText};
    margin: 1rem 0;
    height: 2.8rem;

    span:first-child {
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.paragraphText};
    }
`;
const PoolMembers = ({ poolId, totalShare }: { poolId: string; totalShare: string }) => {
    const [members, setMembers] = useState(null);
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
                .map((member) => (
                    <Row key={member.account_address}>
                        <AccountViewer pubKey={member.account_address} narrowForMobile />
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
