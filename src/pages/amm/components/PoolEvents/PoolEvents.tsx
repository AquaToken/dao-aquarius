import * as React from 'react';
import Table from '../../../../common/basics/Table';
import { Breakpoints, COLORS } from '../../../../common/styles';
import AccountViewer from '../../../../common/basics/AccountViewer';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import PageLoader from '../../../../common/basics/PageLoader';
import { Empty } from '../../../profile/YourVotes/YourVotes';
import { getPoolEvents } from '../../api/api';
import { formatBalance, getDateString } from '../../../../common/helpers/helpers';
import { respondDown } from '../../../../common/mixins';
import { PoolExtended } from '../../api/types';
import Pagination from '../../../../common/basics/Pagination';

const Title = styled.h3`
    margin-bottom: 2.4rem;
`;

const Amounts = styled.span`
    font-size: 1.4rem;

    ${respondDown(Breakpoints.md)`
        text-align: right;
    `}
`;

const getEventTitle = (event, pool) => {
    if (event.event_type === 'swap') {
        const fromIndex = event.amounts.findIndex((amount) => amount > 0);
        const toIndex = event.amounts.findIndex((amount) => amount < 0);

        return `Swap ${pool.assets[fromIndex]?.code} to ${pool.assets[toIndex]?.code}`;
    }

    return event.event_type === 'deposit' ? 'Add liquidity' : 'Remove liquidity';
};

const getEventAmounts = (event, pool) => {
    if (event.event_type === 'swap') {
        const fromIndex = event.amounts.findIndex((amount) => amount > 0);
        const toIndex = event.amounts.findIndex((amount) => amount < 0);

        return (
            <Amounts>
                <span>
                    {formatBalance(event.amounts[fromIndex] / 1e7)} {pool.assets[fromIndex]?.code}
                </span>
                <br />
                <span>
                    {formatBalance(Math.abs(event.amounts[toIndex] / 1e7))}{' '}
                    {pool.assets[toIndex]?.code}
                </span>
            </Amounts>
        );
    }
    return (
        <Amounts>
            {event.amounts.map((amount, index) => (
                <span key={pool.tokens_str[index]}>
                    <span>
                        {formatBalance(amount / 1e7)} {pool.assets[index].code}
                    </span>
                    <br />
                </span>
            ))}
        </Amounts>
    );
};

const PAGE_SIZE = 5;
const getEventTime = (timeStr) => {
    const [date, time] = timeStr.split(' ');

    const [year, month, day] = date.split('-');
    const [hour, minute, second] = time.split(':');

    return getDateString(new Date(Date.UTC(year, month - 1, day, hour, minute, second)).getTime(), {
        withTime: true,
    });
};

const PoolEvents = ({ pool }: { pool: PoolExtended }) => {
    const [events, setEvents] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(null);

    useEffect(() => {
        getPoolEvents(pool.address, page, PAGE_SIZE).then(({ events, total }) => {
            setEvents(events);
            setTotal(total);
        });
    }, [page]);

    if (!events) {
        return <PageLoader />;
    }

    if (!events.length) {
        return (
            <div>
                <Title>Transactions</Title>
                <Empty>
                    <h3>There's nothing here.</h3>
                </Empty>
            </div>
        );
    }

    return (
        <div>
            <Title>Transactions</Title>
            <Table
                head={[
                    { children: 'Type' },
                    { children: 'Amounts' },
                    { children: 'Account', flexSize: 1.5 },
                    { children: 'Time' },
                ]}
                body={events.map((event, index) => {
                    return {
                        key: `${event.ledger}-${index}`,
                        mobileBackground: COLORS.lightGray,
                        rowItems: [
                            {
                                children: getEventTitle(event, pool),
                                label: 'Type:',
                            },
                            {
                                children: getEventAmounts(event, pool),
                                label: 'Amounts:',
                            },
                            {
                                children: (
                                    <AccountViewer pubKey={event.account_address} narrowForMobile />
                                ),
                                flexSize: 1.5,
                                label: 'Account:',
                            },
                            {
                                children: getEventTime(event.ledger_close_at_str),
                                label: 'Time:',
                            },
                        ],
                    };
                })}
            />
            <Pagination
                pageSize={PAGE_SIZE}
                totalCount={total}
                onPageChange={setPage}
                currentPage={page}
                itemName="transactions"
            />
        </div>
    );
};

export default PoolEvents;
