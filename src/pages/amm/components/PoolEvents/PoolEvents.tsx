import { format } from 'date-fns';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { getPoolEvents, PoolEventsFilters } from 'api/amm';

import { POOL_TYPE } from 'constants/amm';

import { contractValueToFormattedAmount } from 'helpers/amount';
import { getAssetFromString } from 'helpers/assets';
import { getDateString } from 'helpers/date';
import { getIsTestnetEnv } from 'helpers/env';
import { formatBalance } from 'helpers/format-number';

import { useDebounce } from 'hooks/useDebounce';
import { useUpdateIndex } from 'hooks/useUpdateIndex';

import useAuthStore from 'store/authStore/useAuthStore';

import { isValidContract, isValidPublicKey } from 'services/stellar/utils/validators';

import { PoolEvent, PoolEventType, PoolExtended } from 'types/amm';
import { Option } from 'types/option';
import { SorobanToken } from 'types/token';

import LinkIcon from 'assets/icons/nav/icon-external-link-16.svg';

import { ExternalLink } from 'basics/links';
import PageLoader from 'basics/loaders/PageLoader';
import Pagination from 'basics/Pagination';
import Table from 'basics/Table';

import PublicKeyWithIcon from 'components/PublicKeyWithIcon';

import { COLORS } from 'styles/style-constants';

import { Empty } from 'pages/profile/YourVotes/YourVotes';

import AccountFilterInput from './components/AccountFilterInput/AccountFilterInput';
import DateRangePicker, {
    DateRangeFilter,
    EMPTY_DATE_RANGE,
} from './components/DateRangePicker/DateRangePicker';
import {
    Amounts,
    CompactSelect,
    ExplorerIconLink,
    Filters,
    FiltersRow,
    Title,
} from './PoolEvents.styled';

const PAGE_SIZE = 5;

enum OperationFilter {
    all = '',
    claims = 'claims',
    claimFees = PoolEventType.claimFees,
    swap = PoolEventType.swap,
    deposit = PoolEventType.deposit,
    withdraw = PoolEventType.withdraw,
}

const BASE_OPERATION_FILTER_OPTIONS: Option<OperationFilter>[] = [
    { value: OperationFilter.all, label: 'All operations' },
    { value: OperationFilter.swap, label: 'Swap' },
    { value: OperationFilter.deposit, label: 'Add liquidity' },
    { value: OperationFilter.withdraw, label: 'Remove liquidity' },
    { value: OperationFilter.claims, label: 'Claim rewards' },
];

const getOperationFilterValue = (filter: OperationFilter, isConcentratedPool: boolean) => {
    if (filter === OperationFilter.claims) {
        return [
            PoolEventType.claim,
            !isConcentratedPool ? PoolEventType.claimFees : null,
            PoolEventType.claimIncentives,
        ]
            .filter(Boolean)
            .join(',');
    }

    if (filter === OperationFilter.claimFees) {
        return isConcentratedPool ? PoolEventType.claimFees : '';
    }

    return filter;
};

const getDateParam = (timestamp: number) => format(timestamp, 'yyyy-MM-dd HH:mm:ss');

const getEventTitle = (event: PoolEvent, pool: PoolExtended) => {
    switch (event.event_type) {
        case PoolEventType.swap: {
            const fromIndex = event.amounts.findIndex(amount => +amount > 0);
            const toIndex = event.amounts.findIndex(amount => +amount < 0);

            return `Swap ${pool.tokens[fromIndex]?.code} to ${pool.tokens[toIndex]?.code}`;
        }
        case PoolEventType.claim:
            return 'Claim rewards';
        case PoolEventType.claimFees:
            return 'Claim fees';
        case PoolEventType.deposit:
            return 'Add liquidity';
        case PoolEventType.withdraw:
            return 'Remove liquidity';
        case PoolEventType.claimIncentives:
            return 'Claim incentives';

        default:
            return 'Unknown event';
    }
};

const getEventAmounts = (event: PoolEvent, pool: PoolExtended) => {
    switch (event.event_type) {
        case PoolEventType.swap: {
            const fromIndex = event.amounts.findIndex(amount => +amount > 0);
            const toIndex = event.amounts.findIndex(amount => +amount < 0);

            return (
                <Amounts>
                    <span>
                        {contractValueToFormattedAmount(
                            event.amounts[fromIndex],
                            (pool.tokens[fromIndex] as SorobanToken).decimal,
                        )}{' '}
                        {pool.tokens[fromIndex]?.code}
                    </span>
                    <span>
                        {contractValueToFormattedAmount(
                            event.amounts[toIndex],
                            (pool.tokens[toIndex] as SorobanToken).decimal,
                            false,
                            false,
                            7,
                            true,
                        )}{' '}
                        {pool.tokens[toIndex]?.code}
                    </span>
                </Amounts>
            );
        }

        case PoolEventType.deposit:
        case PoolEventType.withdraw: {
            return (
                <Amounts>
                    {event.amounts.map((amount, index) => (
                        <span key={pool.tokens_str[index]}>
                            {contractValueToFormattedAmount(
                                amount,
                                (pool.tokens[index] as SorobanToken).decimal,
                            )}{' '}
                            {pool.tokens[index]?.code}
                        </span>
                    ))}
                </Amounts>
            );
        }

        case PoolEventType.claim: {
            return (
                <Amounts>
                    <span>{formatBalance(+event.amounts[0] / 1e7)} AQUA</span>
                </Amounts>
            );
        }

        case PoolEventType.claimIncentives:
        case PoolEventType.claimFees: {
            return (
                <Amounts>
                    {event.amounts.map((amount, index) => {
                        if (!Number(amount)) return null;

                        const tokenId = event.tokens?.[index];
                        if (!tokenId) {
                            return null;
                        }

                        const token = getAssetFromString(tokenId);
                        return (
                            <span key={token.contract}>
                                {contractValueToFormattedAmount(amount, token.decimal, true)}{' '}
                                {token.code}
                            </span>
                        );
                    })}
                </Amounts>
            );
        }

        default:
            return null;
    }
};

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
    const [events, setEvents] = useState<PoolEvent[] | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState<number | null>(null);
    const [pending, setPending] = useState(false);
    const [operationFilter, setOperationFilter] = useState<OperationFilter>(OperationFilter.all);
    const [accountFilter, setAccountFilter] = useState('');
    const [dateRange, setDateRange] = useState<DateRangeFilter>(EMPTY_DATE_RANGE);

    const updateIndex = useUpdateIndex(5000);
    const debouncedAccountFilter = useDebounce(accountFilter, 700, true, () => setPage(1));
    const { account, isLogged } = useAuthStore();

    const isConcentratedPool = pool.pool_type === POOL_TYPE.concentrated;
    const accountId = isLogged && account ? account.accountId() : null;
    const normalizedAccountFilter = debouncedAccountFilter.trim().toUpperCase();
    const isValidAccountFilter =
        isValidPublicKey(normalizedAccountFilter) || isValidContract(normalizedAccountFilter);
    const accountAddressFilter = isValidAccountFilter ? normalizedAccountFilter : '';

    const operationFilterOptions = useMemo(
        () =>
            isConcentratedPool
                ? [
                      ...BASE_OPERATION_FILTER_OPTIONS,
                      { value: OperationFilter.claimFees, label: 'Claim fees' },
                  ]
                : BASE_OPERATION_FILTER_OPTIONS,
        [isConcentratedPool],
    );

    const filters = useMemo<PoolEventsFilters>(
        () => ({
            eventTypes: getOperationFilterValue(operationFilter, isConcentratedPool),
            address: accountAddressFilter,
            ledgerCloseAtGte: dateRange.from ? getDateParam(dateRange.from) : undefined,
            ledgerCloseAtLte: dateRange.to ? getDateParam(dateRange.to) : undefined,
        }),
        [accountAddressFilter, dateRange.from, dateRange.to, isConcentratedPool, operationFilter],
    );

    useEffect(() => {
        if (!isConcentratedPool && operationFilter === OperationFilter.claimFees) {
            setOperationFilter(OperationFilter.all);
            setPage(1);
        }
    }, [isConcentratedPool, operationFilter]);

    const lastRequestKeyRef = useRef('');

    useEffect(() => {
        let cancelled = false;

        const requestKey = JSON.stringify({ address: pool.address, page, filters });
        const isUserChange = lastRequestKeyRef.current !== requestKey;
        lastRequestKeyRef.current = requestKey;

        if (isUserChange) {
            setPending(true);
        }

        getPoolEvents(pool.address, page, PAGE_SIZE, filters)
            .then(({ events, total, page: pageFromResponse }) => {
                if (cancelled) {
                    return;
                }

                if (pageFromResponse !== page) {
                    return;
                }
                setEvents(events);
                setTotal(total);
            })
            .finally(() => {
                if (!cancelled && isUserChange) {
                    setPending(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [filters, page, pool.address, updateIndex]);

    const onOperationFilterChange = (value: OperationFilter) => {
        setOperationFilter(value);
        setPage(1);
    };

    const onDateRangeChange = (value: DateRangeFilter) => {
        setDateRange(value);
        setPage(1);
    };

    const onAccountFilterChange = (value: string) => {
        setAccountFilter(value);
    };

    const pasteAccountFilter = () => {
        if (!accountId) {
            return;
        }

        setAccountFilter(accountId);
        setPage(1);
    };

    const clearAccountFilter = () => {
        setAccountFilter('');
        setPage(1);
    };

    return (
        <div>
            <Title>Transactions</Title>
            <Filters>
                <FiltersRow>
                    <CompactSelect
                        value={operationFilter}
                        options={operationFilterOptions}
                        onChange={onOperationFilterChange}
                    />
                    <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
                </FiltersRow>
                <AccountFilterInput
                    value={accountFilter}
                    accountId={accountId}
                    onChange={onAccountFilterChange}
                    onPaste={pasteAccountFilter}
                    onClear={clearAccountFilter}
                />
            </Filters>

            {!events && pending ? (
                <PageLoader />
            ) : events?.length ? (
                <>
                    <Table
                        pending={pending}
                        head={[
                            { children: 'Type', flexSize: 1.2 },
                            { children: 'Amounts' },
                            { children: 'Account' },
                            { children: 'Time' },
                            { children: '', flexSize: 0.2 },
                        ]}
                        body={events.map((event: PoolEvent, index: number) => ({
                            key: `${event.ledger}-${index}`,
                            mobileBackground: COLORS.gray50,
                            rowItems: [
                                {
                                    children: getEventTitle(event, pool),
                                    label: 'Type:',
                                    flexSize: 1.2,
                                },
                                {
                                    children: getEventAmounts(event, pool),
                                    label: 'Amounts:',
                                },
                                {
                                    children: (
                                        <PublicKeyWithIcon
                                            pubKey={event.account_address}
                                            lettersCount={4}
                                            narrowForMobile
                                        />
                                    ),
                                    label: 'Account:',
                                },
                                {
                                    children: getEventTime(event.ledger_close_at_str),
                                    label: 'Time:',
                                },
                                {
                                    children: (
                                        <ExplorerIconLink
                                            href={`https://stellar.expert/explorer/${
                                                getIsTestnetEnv() ? 'testnet' : 'public'
                                            }/tx/${event.transaction_hash}`}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <LinkIcon />
                                        </ExplorerIconLink>
                                    ),
                                    label: 'Time:',
                                    flexSize: 0.2,
                                    hideOnMobile: true,
                                },
                                {
                                    children: (
                                        <ExternalLink
                                            href={`https://stellar.expert/explorer/${
                                                getIsTestnetEnv() ? 'testnet' : 'public'
                                            }/tx/${event.transaction_hash}`}
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
                        totalCount={total ?? 0}
                        onPageChange={setPage}
                        currentPage={page}
                        itemName="transactions"
                    />
                </>
            ) : (
                <Empty>
                    <h3>There's nothing here.</h3>
                </Empty>
            )}
        </div>
    );
};

export default PoolEvents;
