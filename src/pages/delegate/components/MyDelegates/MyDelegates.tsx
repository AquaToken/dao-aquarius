import * as React from 'react';
import { useEffect, useMemo } from 'react';
import styled from 'styled-components';

import { getMyDelegatees } from 'api/delegate';

import { useUpdateIndex } from 'hooks/useUpdateIndex';

import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService } from 'services/globalServices';
import { DELEGATE_MARKER_KEY, StellarEvents } from 'services/stellar.service';

import { Delegatee as DelegateeType } from 'types/delegate';

import ExternalLink from 'basics/ExternalLink';
import { PageLoader } from 'basics/loaders';

import DelegatesList from 'pages/delegate/components/DelegatesList/DelegatesList';
import { Empty } from 'pages/profile/YourVotes/YourVotes';

import { cardBoxShadow } from '../../../../web/mixins';

const EmptyWrap = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 7.2rem 0;
    ${cardBoxShadow};
    margin-top: 3.4rem;
    border-radius: 0.5rem;
`;

const ExternalLinkStyled = styled(ExternalLink)`
    margin-top: 1.6rem;
`;

interface Props {
    delegatees: DelegateeType[];
    goToList: () => void;
}

const MyDelegates = ({ delegatees, goToList }: Props) => {
    const [locks, setLocks] = React.useState(null);
    const [customDelegatees, setCustomDelegatees] = React.useState(null);

    const { account } = useAuthStore();

    useEffect(() => {
        setLocks(StellarService.getDelegateLocks(account?.accountId()));
        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                setLocks(StellarService.getDelegateLocks(account?.accountId()));
            }
        });

        return () => unsub();
    }, []);

    const updateIndex = useUpdateIndex(10000);

    useEffect(() => {
        getMyDelegatees(account.accountId())
            .then(res =>
                res.filter(
                    ({ account }) => !delegatees.find(delegatee => delegatee.account === account),
                ),
            )
            .then(res => {
                setCustomDelegatees(res);
            });
    }, [updateIndex]);

    const locksSummary: Map<string, number> = useMemo(() => {
        if (!locks) {
            return null;
        }

        const summary = locks.reduce((acc, lock) => {
            const destination = lock.claimants.find(
                ({ predicate, destination }) =>
                    !!predicate?.not?.unconditional && destination !== DELEGATE_MARKER_KEY,
            )?.destination;

            if (destination) {
                acc.set(destination, (acc.get(destination) ?? 0) + Number(lock.amount));
            }

            return acc;
        }, new Map<string, number>());

        return new Map([...summary].sort((a, b) => b[1] - a[1]));
    }, [locks, delegatees]);

    if (!locks || !customDelegatees) {
        return <PageLoader />;
    }

    return !locks.length ? (
        <EmptyWrap>
            <Empty>
                <h3>There's nothing here.</h3>
                <span>It looks like you don’t have any active delegates.</span>
                <ExternalLinkStyled asDiv onClick={() => goToList()}>
                    Explore delegates
                </ExternalLinkStyled>
            </Empty>
        </EmptyWrap>
    ) : (
        <DelegatesList
            delegatees={delegatees}
            myLocks={locksSummary}
            customDelegatees={customDelegatees}
        />
    );
};

export default MyDelegates;
