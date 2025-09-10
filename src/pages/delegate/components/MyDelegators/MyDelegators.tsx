import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { ICE_DELEGATION_MAP, ICE_TO_DELEGATE } from 'constants/assets';

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
        if (!delegators || delegators.length === 0) return null;

        const sponsorsMap = delegators.reduce((acc, delegator) => {
            const claimant = delegator.claimants.find(
                ({ predicate }) => !!predicate?.not?.abs_before,
            );
            if (!claimant) return acc; // если нет подходящего клейманта — пропускаем

            const sponsor = claimant.destination;
            const asset = delegator.asset;
            const amount = Number(delegator.amount) || 0;

            const perAsset = acc.get(sponsor) ?? {};
            perAsset[asset] = (perAsset[asset] ?? 0) + amount;
            acc.set(sponsor, perAsset);
            return acc;
        }, new Map());

        const total = (perAsset: Record<string, number>) =>
            Object.values(perAsset).reduce((s, v) => s + v, 0);

        return [...sponsorsMap.entries()].sort((a, b) => total(b[1]) - total(a[1]));
    }, [delegators]);

    return (
        <Container>
            {processedLocks ? (
                <Table
                    head={[
                        { children: 'Account' },
                        { children: 'Delegated ', align: CellAlign.Right },
                        { children: ' ', align: CellAlign.Right, flexSize: 0.5 },
                    ]}
                    body={processedLocks.map(([sponsor, amounts]) => ({
                        key: sponsor,
                        isNarrow: true,
                        rowItems: [
                            {
                                children: <PublicKeyWithIcon pubKey={sponsor} narrowForMobile />,
                                label: 'Account',
                            },
                            {
                                children: ICE_TO_DELEGATE.map(str =>
                                    amounts[str]
                                        ? `${formatBalance(amounts[str], true)} ${
                                              ICE_DELEGATION_MAP.get(str).split(':')[0]
                                          }`
                                        : null,
                                )
                                    .filter(Boolean)
                                    .join(', '),
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
