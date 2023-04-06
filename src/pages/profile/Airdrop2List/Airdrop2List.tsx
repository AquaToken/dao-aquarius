import * as React from 'react';
import styled from 'styled-components';
import {
    Cell,
    ExternalLinkStyled,
    Header,
    Section,
    Table,
    TableBodyRow,
    Title,
} from '../AmmRewards/AmmRewards';
import { useEffect, useMemo, useState } from 'react';
import { StellarService, ToastService } from '../../../common/services/globalServices';
import { StellarEvents } from '../../../common/services/stellar.service';
import { TableBody, TableHead, TableHeadRow } from '../../vote/components/MainPage/Table/Table';
import PageLoader from '../../../common/basics/PageLoader';
import { Empty } from '../YourVotes/YourVotes';
import { Link } from 'react-router-dom';
import { MainRoutes } from '../../../routes';
import { formatBalance, getDateString } from '../../../common/helpers/helpers';
import useAuthStore from '../../../store/authStore/useAuthStore';
import Button from '../../../common/basics/Button';
import { COLORS } from '../../../common/styles';
import { LoginTypes } from '../../../store/authStore/types';
import {
    BuildSignAndSubmitStatuses,
    openApp,
} from '../../../common/services/wallet-connect.service';
import ErrorHandler from '../../../common/helpers/error-handler';
import { UnlockedBlock, UnlockedStats } from '../IceLocks/IceLocks';
import Checkbox from '../../../common/basics/Checkbox';

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

const TableHeadRowStyled = styled(TableBodyRow)`
    min-height: 5rem;
`;

const RightCell = styled(Cell)`
    justify-content: flex-end;
`;

const Expired = styled.span`
    color: ${COLORS.grayText};
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
            openApp();
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
                    <Table>
                        <TableHead>
                            <TableHeadRow>
                                <Cell>Date received</Cell>
                                <Cell>Amount</Cell>
                                <RightCell>Claim back date</RightCell>
                                <RightCell>Claim back expire</RightCell>
                                <RightCell>Status</RightCell>
                            </TableHeadRow>
                        </TableHead>
                        <TableBody>
                            {filteredList.map((cb) => {
                                const dateReceived = getDateString(
                                    new Date(cb.last_modified_time).getTime(),
                                    { withTime: true },
                                );
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

                                return (
                                    <TableHeadRowStyled key={cb.id}>
                                        <Cell>
                                            <label>Date received:</label>
                                            {dateReceived}
                                        </Cell>
                                        <Cell>
                                            <label>Amount:</label>
                                            {formatBalance(cb.amount, true)} AQUA
                                        </Cell>
                                        <RightCell>
                                            <label>Claim back date:</label>
                                            {beforeDate}
                                        </RightCell>
                                        <RightCell>
                                            <label>Claim back expire:</label>
                                            {expireDate}
                                        </RightCell>
                                        <RightCell>
                                            <label>Status:</label>
                                            {status}
                                        </RightCell>
                                    </TableHeadRowStyled>
                                );
                            })}
                        </TableBody>
                    </Table>
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
