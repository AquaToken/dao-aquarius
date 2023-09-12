import * as React from 'react';
import styled from 'styled-components';
import { Header, Section, Title } from '../AmmRewards/AmmRewards';
import Table, { CellAlign } from '../../../common/basics/Table';
import { useEffect, useState } from 'react';
import { StellarService } from '../../../common/services/globalServices';
import useAuthStore from '../../../store/authStore/useAuthStore';
import { StellarEvents } from '../../../common/services/stellar.service';
import { formatBalance, getDateString } from '../../../common/helpers/helpers';
import PageLoader from '../../../common/basics/PageLoader';
import AccountViewer from '../../../common/basics/AccountViewer';
import DotsLoader from '../../../common/basics/DotsLoader';
import { COLORS } from '../../../common/styles';

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

const PaymentsHistory = () => {
    const [history, setHistory] = useState(null);
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
                setHistory([...StellarService.paymentsHistory]);
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
                            { children: 'Receive for' },
                            { children: 'Account', flexSize: 2 },
                            { children: 'Memo note', flexSize: 2 },
                            { children: 'Amount', align: CellAlign.Right, flexSize: 2 },
                        ]}
                        body={history.map((item) => {
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
                                    { children: item.title, label: 'Receive for' },
                                    {
                                        children: (
                                            <AccountViewer pubKey={item.from} narrowForMobile />
                                        ),
                                        flexSize: 2,
                                        label: 'Account',
                                    },
                                    {
                                        children: item.memo || <DotsLoader />,
                                        flexSize: 2,
                                        label: 'Memo note',
                                    },
                                    {
                                        children: `${formatBalance(item.amount)} AQUA`,
                                        align: CellAlign.Right,
                                        flexSize: 2,
                                        label: 'Amount',
                                    },
                                ],
                            };
                        })}
                    />
                ) : (
                    <PageLoader />
                )}
            </Section>
        </Container>
    );
};

export default PaymentsHistory;
