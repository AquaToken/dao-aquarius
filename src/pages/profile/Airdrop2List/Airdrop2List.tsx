import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ExternalLinkStyled, Header, Section, Title } from '../AmmRewards/AmmRewards';
import { StellarService, ToastService } from '../../../common/services/globalServices';
import { StellarEvents } from '../../../common/services/stellar.service';
import PageLoader from '../../../common/basics/PageLoader';
import { Empty } from '../YourVotes/YourVotes';
import { Link } from 'react-router-dom';
import { MainRoutes } from '../../../routes';
import { formatBalance, getDateString } from '../../../common/helpers/helpers';
import useAuthStore from '../../../store/authStore/useAuthStore';
import Button from '../../../common/basics/Button';
import { Breakpoints, COLORS } from '../../../common/styles';
import { LoginTypes } from '../../../store/authStore/types';
import { BuildSignAndSubmitStatuses } from '../../../common/services/wallet-connect.service';
import ErrorHandler from '../../../common/helpers/error-handler';
import Checkbox from '../../../common/basics/Checkbox';
import Table, { CellAlign } from '../../../common/basics/Table';
import { respondDown } from '../../../common/mixins';
import { openCurrentWalletIfExist } from '../../../common/helpers/wallet-connect-helpers';

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

const Expired = styled.span`
    color: ${COLORS.grayText};
`;

const UnlockedBlock = styled.div`
    display: flex;
    justify-content: space-between;
    border-radius: 0.5rem;
    background: ${COLORS.lightGray};
    padding: 4rem 2.1rem 4rem 4.8rem;
    margin-top: 2.2rem;
    margin-bottom: 3rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        background: ${COLORS.white};
    `}
`;

const UnlockedStats = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};

    span:last-child {
        font-size: 1.4rem;
        line-height: 2rem;
        color: ${COLORS.grayText};
    }

    ${respondDown(Breakpoints.md)`
        margin-bottom: 2rem;
        text-align: center;
    `}
`;

const ALL_ID = 'all';

const Airdrop2List = () => {
    const [list, setList] = useState(null);
    const [pendingId, setPendingId] = useState(null);
    const [showExpired, setShowExpired] = useState(false);

    const { account } = useAuthStore();

    useEffect(() => {
        setList(StellarService.getAirdrop2Claims());
    }, []);

    useEffect(() => {
        const unsub = StellarService.event.sub((event) => {
            if (event.type === StellarEvents.claimableUpdate) {
                setList(StellarService.getAirdrop2Claims());
            }
        });

        return () => unsub();
    }, []);

    const { unlockedCount, unlockedSum, unlockedIds } = useMemo(() => {
        if (!list) {
            return { unlockedCount: 0, unlockedSum: 0, unlockedIds: [] };
        }
        return list.reduce(
            (acc, lock) => {
                const claimantPredicates = lock.claimants.find(
                    ({ destination }) => destination === account.accountId(),
                )?.predicate?.and;
                const beforeTimestamp =
                    Number(
                        claimantPredicates.find((predicate) => Boolean(predicate.not))?.not
                            ?.abs_before_epoch,
                    ) * 1000;
                const expireTimestamp =
                    Number(
                        claimantPredicates.find((predicate) => !Boolean(predicate.not))
                            ?.abs_before_epoch,
                    ) * 1000;

                if (
                    beforeTimestamp &&
                    expireTimestamp &&
                    beforeTimestamp < Date.now() &&
                    expireTimestamp > Date.now()
                ) {
                    acc.unlockedCount += 1;
                    acc.unlockedSum += Number(lock.amount);
                    acc.unlockedIds.push(lock.id);
                }
                return acc;
            },
            { unlockedCount: 0, unlockedSum: 0, locksSum: 0, unlockedIds: [] },
        );
    }, [list]);

    const onSubmit = async (id?: string) => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        try {
            setPendingId(id || ALL_ID);

            const ops = id
                ? StellarService.createClaimOperations(id, account.getAquaBalance() === null)
                : unlockedIds.reduce((acc, cbId, index) => {
                      acc = [
                          ...acc,
                          ...StellarService.createClaimOperations(
                              cbId,
                              index === 1 && account.getAquaBalance() === null,
                          ),
                      ];
                      return acc;
                  }, []);
            const tx = await StellarService.buildTx(account, ops);

            const result = await account.signAndSubmitTx(tx);

            setPendingId(null);

            if (
                (result as { status: BuildSignAndSubmitStatuses }).status ===
                BuildSignAndSubmitStatuses.pending
            ) {
                ToastService.showSuccessToast('More signatures required to complete');
                return;
            }
            ToastService.showSuccessToast('You’ve successfully claimed AQUA tokens.');
            StellarService.getClaimableBalances(account.accountId());
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            setPendingId(null);
        }
    };

    const filteredList = useMemo(() => {
        if (!list) {
            return null;
        }
        if (showExpired) {
            return [...list].reverse();
        }

        return [...list]
            .filter((cb) => {
                const claimantPredicates = cb.claimants.find(
                    ({ destination }) => destination === account.accountId(),
                )?.predicate?.and;
                const expireTimestamp =
                    Number(
                        claimantPredicates.find((predicate) => !Boolean(predicate.not))
                            ?.abs_before_epoch,
                    ) * 1000;

                return expireTimestamp > Date.now();
            })
            .reverse();
    }, [list, showExpired]);

    return (
        <Container>
            <Header>
                <Title>Airdrop #2 claims</Title>
                {Boolean(list?.length) && (
                    <Checkbox
                        label={'Show expired'}
                        checked={showExpired}
                        onChange={(value) => {
                            setShowExpired(value);
                        }}
                    />
                )}
            </Header>

            {!filteredList ? (
                <PageLoader />
            ) : filteredList.length ? (
                <Section>
                    {unlockedCount > 1 && account.authType !== LoginTypes.ledger && (
                        <UnlockedBlock>
                            <UnlockedStats>
                                <span>You have unclaimed payments</span>
                                <span>
                                    {unlockedCount} payments for {formatBalance(unlockedSum, true)}{' '}
                                    AQUA
                                </span>
                            </UnlockedStats>
                            <Button
                                onClick={() => onSubmit()}
                                pending={pendingId === ALL_ID}
                                disabled={Boolean(pendingId) && pendingId !== ALL_ID}
                            >
                                CLAIM ALL
                            </Button>
                        </UnlockedBlock>
                    )}
                    <Table
                        head={[
                            { children: 'Date received' },
                            { children: 'Amount' },
                            { children: 'Claim back date', align: CellAlign.Right },
                            { children: 'Claim back expire', align: CellAlign.Right },
                            { children: 'Status', align: CellAlign.Right },
                        ]}
                        body={filteredList.map((cb) => {
                            const dateReceived = cb.last_modified_time
                                ? getDateString(new Date(cb.last_modified_time).getTime(), {
                                      withTime: true,
                                  })
                                : 'No data';
                            const claimantPredicates = cb.claimants.find(
                                ({ destination }) => destination === account.accountId(),
                            )?.predicate?.and;
                            const beforeTimestamp = claimantPredicates.find((predicate) =>
                                Boolean(predicate.not),
                            )?.not?.abs_before_epoch;
                            const expireTimestamp = claimantPredicates.find(
                                (predicate) => !Boolean(predicate.not),
                            )?.abs_before_epoch;

                            const beforeDate = getDateString(+beforeTimestamp * 1000, {
                                withTime: true,
                            });
                            const expireDate = getDateString(+expireTimestamp * 1000, {
                                withTime: true,
                            });
                            const status =
                                Number(beforeTimestamp * 1000) > Date.now() ? (
                                    <span>Upcoming</span>
                                ) : Number(expireTimestamp * 1000) < Date.now() ? (
                                    <Expired>Expired</Expired>
                                ) : (
                                    <Button
                                        isSmall
                                        disabled={Boolean(pendingId) && cb.id !== pendingId}
                                        pending={cb.id === pendingId}
                                        onClick={() => onSubmit(cb.id)}
                                    >
                                        CLAIM
                                    </Button>
                                );

                            return {
                                key: cb.id,
                                isNarrow: true,
                                rowItems: [
                                    { children: dateReceived, label: 'Date received:' },
                                    {
                                        children: `${formatBalance(cb.amount, true)} AQUA`,
                                        label: 'Amount:',
                                    },
                                    {
                                        children: beforeDate,
                                        label: 'Claim back date:',
                                        align: CellAlign.Right,
                                    },
                                    {
                                        children: expireDate,
                                        label: 'Claim back expire:',
                                        align: CellAlign.Right,
                                    },
                                    {
                                        children: status,
                                        label: 'Status:',
                                        align: CellAlign.Right,
                                    },
                                ],
                            };
                        })}
                    />
                </Section>
            ) : (
                <Section>
                    <Empty>
                        <h3>There's nothing here.</h3>
                        <span>It looks like your account is not eligible for airdrop.</span>

                        <ExternalLinkStyled asDiv>
                            <Link to={MainRoutes.airdrop2}>Learn about Airdrop #2</Link>
                        </ExternalLinkStyled>
                    </Empty>
                </Section>
            )}
        </Container>
    );
};

export default Airdrop2List;
