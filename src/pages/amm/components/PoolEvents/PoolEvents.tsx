import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getPoolEvents } from 'api/amm';

import { getDateString } from 'helpers/date';
import { formatBalance } from 'helpers/format-number';

import { PoolEvent, PoolExtended } from 'types/amm';

import { useUpdateIndex } from 'hooks/useUpdateIndex';
import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import LinkIcon from 'assets/icon-external-link.svg';

import ExternalLink from 'basics/ExternalLink';
import PageLoader from 'basics/loaders/PageLoader';
import Pagination from 'basics/Pagination';
import PublicKeyWithIcon from 'basics/PublicKeyWithIcon';
import Table from 'basics/Table';

import { Empty } from 'pages/profile/YourVotes/YourVotes';

const Title = styled.h3`
    margin-bottom: 2.4rem;
`;

const Amounts = styled.span`
    font-size: 1.4rem;

    ${respondDown(Breakpoints.md)`
        text-align: right;
    `}
`;

const getEventTitle = (event: PoolEvent, pool: PoolExtended) => {
    if (event.event_type === 'swap') {
        const fromIndex = event.amounts.findIndex(amount => +amount > 0);
        const toIndex = event.amounts.findIndex(amount => +amount < 0);

        return `Swap ${pool.assets[fromIndex]?.code} to ${pool.assets[toIndex]?.code}`;
    }

    return event.event_type === 'deposit' ? 'Add liquidity' : 'Remove liquidity';
};

const getEventAmounts = (event: PoolEvent, pool: PoolExtended) => {
    if (event.event_type === 'swap') {
        const fromIndex = event.amounts.findIndex(amount => +amount > 0);
        const toIndex = event.amounts.findIndex(amount => +amount < 0);

        return (
            <Amounts>
                <span>
                    {formatBalance(+event.amounts[fromIndex] / 1e7)} {pool.assets[fromIndex]?.code}
                </span>
                <br />
                <span>
                    {formatBalance(Math.abs(+event.amounts[toIndex] / 1e7))}{' '}
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
                        {formatBalance(+amount / 1e7)} {pool.assets[index].code}
                    </span>
                    <br />
                </span>
            ))}
        </Amounts>
    );
};

const PAGE_SIZE = 5;
const getEventTime = (timeStr: string) => {
    const [date, time] = timeStr.split(' ');

    const [year, month, day] = date.split('-');
    const [hour, minute, second] = time.split(':');

    return getDateString(
        new Date(Date.UTC(+year, +month - 1, +day, +hour, +minute, +second)).getTime(),
        {
            withTime: true,
        },
    );
};

const PoolEvents = ({ pool }: { pool: PoolExtended }) => {
    const [events, setEvents] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(null);

    const updateIndex = useUpdateIndex(5000);

    useEffect(() => {
        getPoolEvents(pool.address, page, PAGE_SIZE).then(
            ({ events, total, page: pageFromResponse }) => {
                if (pageFromResponse !== page) {
                    return;
                }
                setEvents(events);
                setTotal(total);
            },
        );
    }, [page, updateIndex]);

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
                    { children: '', flexSize: 0.2 },
                ]}
                body={events.map((event: PoolEvent, index: number) => ({
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
                                <PublicKeyWithIcon pubKey={event.account_address} narrowForMobile />
                            ),
                            flexSize: 1.5,
                            label: 'Account:',
                        },
                        {
                            children: getEventTime(event.ledger_close_at_str),
                            label: 'Time:',
                        },
                        {
                            children: (
                                <a
                                    href={`https://stellar.expert/explorer/public/tx/${event.transaction_hash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <LinkIcon />
                                </a>
                            ),
                            label: 'Time:',
                            flexSize: 0.2,
                            hideOnMobile: true,
                        },
                        {
                            children: (
                                <ExternalLink
                                    href={`https://stellar.expert/explorer/public/tx/${event.transaction_hash}`}
                                >
                                    View on Explorer
                                </ExternalLink>
                            ),
                            flexSize: 0.2,
                            hideOnWeb: true,
                        },
                    ],
                }))}
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
