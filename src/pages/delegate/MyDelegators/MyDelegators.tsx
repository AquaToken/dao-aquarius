import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { getIsTestnetEnv } from 'helpers/env';
import { formatBalance } from 'helpers/format-number';

import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService } from 'services/globalServices';
import { StellarEvents } from 'services/stellar.service';

import { cardBoxShadow } from 'web/mixins';

import ExternalLink from 'basics/ExternalLink';
import { PageLoader } from 'basics/loaders';
import PublicKeyWithIcon from 'basics/PublicKeyWithIcon';
import Table, { CellAlign } from 'basics/Table';

const Container = styled.div`
    padding: 2.4rem;
    margin-top: 3.4rem;
    border-radius: 2.4rem;
    ${cardBoxShadow};
`;

const MyDelegators = () => {
    const [delegators, setDelegators] = useState(null);
    const { account } = useAuthStore();

    useEffect(() => {
        if (!account) {
            return;
        }
        setDelegators(StellarService.getDelegatorLocks(account.accountId()));

        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                setDelegators(StellarService.getDelegatorLocks(account.accountId()));
            }
        });

        return () => unsub();
    }, [account]);

    const processedLocks = useMemo(() => {
        if (!delegators) {
            return null;
        }

        const sponsorsMap = delegators.reduce((acc, delegator) => {
            const sponsor = delegator.claimants.find(
                ({ predicate }) => !!predicate.not.abs_before,
            ).destination;

            acc.set(sponsor, (acc.get(sponsor) ?? 0) + Number(delegator.amount));
            return acc;
        }, new Map());

        return [...sponsorsMap].sort((a, b) => b[1] - a[1]);
    }, [delegators]);

    return (
        <Container>
            {delegators ? (
                <Table
                    head={[
                        { children: 'Account' },
                        { children: 'Delegated ', align: CellAlign.Right },
                        { children: ' ', align: CellAlign.Right, flexSize: 0.5 },
                    ]}
                    body={processedLocks.map(([sponsor, amount]) => ({
                        key: sponsor,
                        isNarrow: true,
                        rowItems: [
                            {
                                children: <PublicKeyWithIcon pubKey={sponsor} narrowForMobile />,
                                label: 'Account',
                            },
                            {
                                children: `${formatBalance(amount, true)} dICE`,
                                label: 'Delegated',
                                align: CellAlign.Right,
                            },
                            {
                                children: (
                                    <ExternalLink
                                        href={`https://stellar.expert/explorer/${
                                            getIsTestnetEnv() ? 'testnet' : 'public'
                                        }/account/${sponsor}`}
                                    >
                                        View on Explorer
                                    </ExternalLink>
                                ),
                                align: CellAlign.Right,
                                flexSize: 0.5,
                            },
                        ],
                    }))}
                />
            ) : (
                <PageLoader />
            )}
        </Container>
    );
};

export default MyDelegators;
