import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { MainRoutes } from 'constants/routes';

import { getDateString } from 'helpers/date';
import getExplorerLink, { ExplorerSection } from 'helpers/explorer-links';
import { formatBalance } from 'helpers/format-number';

import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService } from 'services/globalServices';
import { StellarEvents } from 'services/stellar/events/events';

import { ExternalLink } from 'basics/links';
import DotsLoader from 'basics/loaders/DotsLoader';
import PageLoader from 'basics/loaders/PageLoader';
import Table, { CellAlign } from 'basics/Table';

import { COLORS } from 'styles/style-constants';

import { ExternalLinkStyled, Section } from '../../SdexRewards/SdexRewards';
import { Empty } from '../../YourVotes/YourVotes';

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

const PaymentsHistory = () => {
    const [history, setHistory] = useState(null);
    const [historyFull, setHistoryFull] = useState(false);
    const { account } = useAuthStore();

    useEffect(() => {
        if (!StellarService.payments.paymentsHistory) {
            return StellarService.payments.getPayments(account.accountId(), 30);
        }

        setHistory(StellarService.payments.paymentsHistory);
    }, []);

    useEffect(() => {
        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.paymentsHistoryUpdate) {
                setHistory(
                    StellarService.payments.paymentsHistory
                        ? [...StellarService.payments.paymentsHistory]
                        : null,
                );
                setHistoryFull(StellarService.payments.paymentsFullyLoaded);
            }
        });

        return () => unsub();
    }, []);

    return (
        <Container>
            <Section>
                {history ? (
                    <Table
                        virtualScrollProps={{
                            loadMore: () => StellarService.payments.loadMorePayments(),
                            loadMoreOffset: 5,
                        }}
                        pending={!history || StellarService.payments.loadMorePaymentsPending}
                        head={[
                            { children: 'Time' },
                            { children: 'Reward type' },
                            { children: 'Note', flexSize: 2 },
                            { children: 'Amount', align: CellAlign.Right },
                            { children: '', align: CellAlign.Right },
                        ]}
                        body={history.map(item => {
                            const opId = item._links.effects.href.split('/')[4];
                            return {
                                key: item.id,
                                isNarrow: true,
                                mobileBackground: COLORS.white,
                                rowItems: [
                                    {
                                        children: getDateString(
                                            new Date(item.created_at).getTime(),
                                            {
                                                withoutYear: true,
                                                withTime: true,
                                            },
                                        ),
                                        label: 'Time',
                                    },
                                    { children: <div>{item.title}</div>, label: 'Reward type' },
                                    {
                                        children: item.memo || <DotsLoader />,
                                        flexSize: 2,
                                        label: 'Note',
                                        mobileStyle: {
                                            textAlign: 'right',
                                        },
                                    },
                                    {
                                        children: `${formatBalance(item.amount)} AQUA`,
                                        align: CellAlign.Right,
                                        label: 'Amount',
                                    },
                                    {
                                        children: (
                                            <ExternalLink
                                                href={getExplorerLink(
                                                    ExplorerSection.tx,
                                                    item.transaction_hash,
                                                    opId,
                                                )}
                                            >
                                                View on Explorer
                                            </ExternalLink>
                                        ),
                                        align: CellAlign.Right,
                                        mobileStyle: {
                                            margin: '0 auto',
                                        },
                                    },
                                ],
                            };
                        })}
                    />
                ) : historyFull ? (
                    <Section>
                        <Empty>
                            <h3>There's nothing here.</h3>
                            <span>It looks like you haven't received AQUA rewards.</span>

                            <ExternalLinkStyled asDiv>
                                <Link to={MainRoutes.rewards}>Learn about rewards</Link>
                            </ExternalLinkStyled>
                        </Empty>
                    </Section>
                ) : (
                    <PageLoader />
                )}
            </Section>
        </Container>
    );
};

export default PaymentsHistory;
