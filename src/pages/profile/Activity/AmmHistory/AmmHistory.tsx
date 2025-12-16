import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { getNextUserHistory, getUserHistory } from 'api/amm';

import { AppRoutes } from 'constants/routes';

import { normalizeHistoryItem, processHistory } from 'helpers/amm-history';

import useAuthStore from 'store/authStore/useAuthStore';

import { PoolEventType } from 'types/amm';
import { Option } from 'types/option';

import { Select, ToggleGroup } from 'basics/inputs';
import { ExternalLink } from 'basics/links';
import DotsLoader from 'basics/loaders/DotsLoader';
import PageLoader from 'basics/loaders/PageLoader';
import Table, { CellAlign } from 'basics/Table';

import { flexColumn, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import { ExternalLinkStyled, Section } from 'pages/profile/SdexRewards/SdexRewards';
import { Empty } from 'pages/profile/YourVotes/YourVotes';

const Container = styled.div`
    ${flexColumn};
`;

const ToggleStyled = styled(ToggleGroup)`
    margin-bottom: 2.4rem;

    ${respondDown(Breakpoints.sm)`
        display: none;
    `}
`;

const SelectStyled = styled(Select)`
    margin-bottom: 2.4rem;
    display: none;

    ${respondDown(Breakpoints.sm)`
        display: flex;
    `}
`;

enum FilterOptions {
    all = '',
    claims = `${PoolEventType.claim}, ${PoolEventType.claimIncentives}`,
    swap = `${PoolEventType.swap}`,
    deposit = `${PoolEventType.deposit}`,
    withdraw = `${PoolEventType.withdraw}`,
}

const Options: Option<FilterOptions>[] = [
    { value: FilterOptions.all, label: 'All' },
    { value: FilterOptions.swap, label: 'Swap' },
    { value: FilterOptions.deposit, label: 'Deposit' },
    { value: FilterOptions.withdraw, label: 'Withdraw' },
    { value: FilterOptions.claims, label: 'Claims' },
];

const AmmHistory = () => {
    const [history, setHistory] = useState(null);
    const [nextPage, setNextPage] = useState(null);
    const [loadedAll, setLoadedAll] = useState(false);
    const [pending, setPending] = useState(false);
    const [filter, setFilter] = useState<FilterOptions>(FilterOptions.all);

    const { account } = useAuthStore();

    const loadInitial = async () => {
        if (!account) return;

        setHistory(null);
        const res = await getUserHistory(account.accountId(), filter);
        setHistory(processHistory(res.items).map(normalizeHistoryItem));
        setNextPage(res.next ?? null);
        if (!res.next) setLoadedAll(true);
    };

    useEffect(() => {
        loadInitial();
    }, [filter]);

    const loadMore = async () => {
        if (loadedAll || !nextPage || pending) return;

        setPending(true);
        try {
            const res = await getNextUserHistory(nextPage);

            setHistory(prev => processHistory(res.items, prev).map(normalizeHistoryItem));

            setNextPage(res.next ?? null);
            if (!res.next) setLoadedAll(true);
        } finally {
            setPending(false);
        }
    };

    const emptyState = loadedAll && history && history?.length === 0;

    return (
        <Container>
            <ToggleStyled value={filter} options={Options} onChange={setFilter} />
            <SelectStyled value={filter} options={Options} onChange={setFilter} />

            <Section>
                {history && history.length > 0 ? (
                    <Table
                        virtualScrollProps={{ loadMore, loadMoreOffset: 10 }}
                        pending={pending}
                        head={[
                            { children: 'Time' },
                            { children: 'Type' },
                            { children: 'Note' },
                            { children: 'Amount', align: CellAlign.Right, flexSize: 2 },
                            { children: '', align: CellAlign.Right },
                        ]}
                        body={history.map(item => ({
                            key: item.key,
                            isNarrow: true,
                            mobileBackground: COLORS.white,
                            rowItems: [
                                { children: item.date, label: 'Time' },
                                { children: item.title, label: 'Type' },
                                {
                                    children: item.note || <DotsLoader />,
                                    label: 'Note',
                                    mobileStyle: { textAlign: 'right' },
                                },
                                {
                                    children: item.amountsStr,
                                    align: CellAlign.Right,
                                    label: 'Amount',
                                    flexSize: 2,
                                },
                                {
                                    children: (
                                        <ExternalLink href={item.tx}>View on Explorer</ExternalLink>
                                    ),
                                    align: CellAlign.Right,
                                },
                            ],
                        }))}
                    />
                ) : emptyState ? (
                    <Empty>
                        <h3>There's nothing here.</h3>
                        <span>It looks like you haven't pools activity</span>
                        <ExternalLinkStyled asDiv>
                            <Link to={AppRoutes.section.amm.link.index}>Learn about pools</Link>
                        </ExternalLinkStyled>
                    </Empty>
                ) : (
                    <PageLoader />
                )}
            </Section>
        </Container>
    );
};

export default AmmHistory;
