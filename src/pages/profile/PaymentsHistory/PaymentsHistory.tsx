import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ExternalLinkStyled, Header, Section, Title } from '../AmmRewards/AmmRewards';
import Table, { CellAlign } from '../../../common/basics/Table';
import { StellarService } from '../../../common/services/globalServices';
import useAuthStore from '../../../store/authStore/useAuthStore';
import { StellarEvents } from '../../../common/services/stellar.service';
import { formatBalance, getDateString } from '../../../common/helpers/helpers';
import PageLoader from '../../../common/basics/PageLoader';
import DotsLoader from '../../../common/basics/DotsLoader';
import { COLORS } from '../../../common/styles';
import ExternalLink from '../../../common/basics/ExternalLink';
import { Empty } from '../YourVotes/YourVotes';
import { Link } from 'react-router-dom';
import { MainRoutes } from '../../../routes';

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

const PaymentsHistory = () => {
    const [history, setHistory] = useState(null);
    const [historyFull, setHistoryFull] = useState(false);
    const { account } = useAuthStore();

    useEffect(() => {
        if (!StellarService.paymentsHistory) {
            return StellarService.getPayments(account.accountId(), 30);
        }

        setHistory(StellarService.paymentsHistory);
    }, []);

    useEffect(() => {
        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.paymentsHistoryUpdate) {
                setHistory(
                    StellarService.paymentsHistory ? [...StellarService.paymentsHistory] : null,
                );
                setHistoryFull(StellarService.paymentsFullyLoaded);
            }
        });

        return () => unsub();
    }, []);

    return (
        <Container>
            <Header>
                <Title>Payments History</Title>
            </Header>
            <Section>
                {history ? (
                    <Table
                        virtualScrollProps={{
                            loadMore: () => StellarService.loadMorePayments(),
                            loadMoreOffset: 5,
                        }}
                        pending={!history || StellarService.loadMorePaymentsPending}
                        head={[
                            { children: 'Time' },
                            { children: 'Reward type' },
                            { children: 'Memo note', flexSize: 2 },
                            { children: 'Amount', align: CellAlign.Right },
                            { children: '', align: CellAlign.Right },
                        ]}
                        body={history.map((item) => {
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
                                        label: 'Memo note',
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
                                                href={`https://stellar.expert/explorer/public/tx/${item.transaction_hash}#${opId}`}
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
