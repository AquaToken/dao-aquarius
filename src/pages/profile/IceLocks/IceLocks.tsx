import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import PageLoader from '../../../common/basics/PageLoader';
import { getDistributionForAccount } from '../../locker/api/api';
import useAuthStore from '../../../store/authStore/useAuthStore';
import { StellarService, ToastService } from '../../../common/services/globalServices';
import { StellarEvents } from '../../../common/services/stellar.service';
import { formatBalance, getDateString, roundToPrecision } from '../../../common/helpers/helpers';
import ProgressLine from '../../../common/basics/ProgressLine';
import { TableBody, TableHead, TableHeadRow } from '../../vote/components/MainPage/Table/Table';
import Button from '../../../common/basics/Button';
import { LoginTypes } from '../../../store/authStore/types';
import {
    BuildSignAndSubmitStatuses,
    openApp,
} from '../../../common/services/wallet-connect.service';
import ErrorHandler from '../../../common/helpers/error-handler';
import { Empty } from '../YourVotes/YourVotes';
import { Link } from 'react-router-dom';
import { MainRoutes } from '../../../routes';
import { Breakpoints, COLORS } from '../../../common/styles';
import { flexRowSpaceBetween, respondDown } from '../../../common/mixins';
import Info from '../../../common/assets/img/icon-info.svg';
import Tooltip, { TOOLTIP_POSITION } from '../../../common/basics/Tooltip';

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

const TableStyled = styled(Table)`
    margin-top: 2.5rem;
`;

export const UnlockedBlock = styled.div`
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

export const UnlockedStats = styled.div`
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

const Total = styled.div`
    display: flex;
    align-items: center;
    text-align: right;

    ${respondDown(Breakpoints.md)`
        div {
            width: min-content;
        }
    `}
`;

const InfoIcon = styled(Info)`
    margin-left: 0.5rem;
`;

const TooltipInner = styled.div`
    display: flex;
    flex-direction: column;
    width: 32rem;

    ${respondDown(Breakpoints.md)`
        width: 20rem;
    `}
`;

const TooltipRow = styled.div`
    ${flexRowSpaceBetween};
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    margin-bottom: 0.4rem;
`;

const TooltipTotal = styled(TooltipRow)`
    font-weight: 700;
    color: ${COLORS.paragraphText};
    font-size: 1.6rem;
    line-height: 2.8rem;
`;

const ALL_ID = 'all';

const IceLocks = ({ ammAquaBalance }) => {
    const [locks, setLocks] = useState(null);
    const [distributions, setDistributions] = useState(null);
    const [aquaInVotes, setAquaInVotes] = useState(null);

    const [pendingId, setPendingId] = useState(null);

    const { account } = useAuthStore();

    useEffect(() => {
        setLocks(StellarService.getLocks(account.accountId()));
    }, []);

    useEffect(() => {
        StellarService.getAquaInLiquidityVotes(account.accountId()).then((res) => {
            setAquaInVotes(res);
        });
    }, []);

    useEffect(() => {
        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                setLocks(StellarService.getLocks(account.accountId()));

                StellarService.getAquaInLiquidityVotes(account.accountId()).then((res) => {
                    setAquaInVotes(res);
                });
            }
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        getDistributionForAccount(account.accountId()).then((res) => {
            setDistributions(res);
        });
    }, []);

    const aquaBalance = account.getAquaBalance();
    const aquaInOffers = account.getAquaInOffers();

    const { unlockedCount, unlockedSum, locksSum, unlockedIds } = useMemo(() => {
        if (!locks) {
            return { unlockedCount: 0, unlockedSum: 0, locksSum: 0, unlockedIds: [] };
        }
        return locks.reduce(
            (acc, lock) => {
                const unlockTimestamp =
                    Number(lock.claimants[0]?.predicate?.not?.abs_before_epoch) * 1000;
                if (unlockTimestamp && unlockTimestamp < Date.now()) {
                    acc.unlockedCount += 1;
                    acc.unlockedSum += Number(lock.amount);
                    acc.unlockedIds.push(lock.id);
                }
                acc.locksSum += Number(lock.amount);
                return acc;
            },
            { unlockedCount: 0, unlockedSum: 0, locksSum: 0, unlockedIds: [] },
        );
    }, [locks]);

    const total = useMemo(() => {
        return locksSum + aquaBalance + aquaInOffers + ammAquaBalance + aquaInVotes;
    }, [locksSum, aquaBalance, aquaInOffers, ammAquaBalance, aquaInVotes]);

    const availablePercent = useMemo(() => {
        return roundToPrecision((aquaBalance / total) * 100, 2);
    }, [total]);
    const inOffersPercent = useMemo(() => {
        return roundToPrecision((aquaInOffers / total) * 100, 2);
    }, [total]);
    const inVotesPercent = useMemo(() => {
        return roundToPrecision((aquaInVotes / total) * 100, 2);
    }, [total]);
    const ammPercent = useMemo(() => {
        return roundToPrecision((ammAquaBalance / total) * 100, 2);
    }, [total]);

    const lockPercent = useMemo(() => {
        return roundToPrecision((locksSum / total) * 100, 2);
    }, [total]);

    const getIceAmount = useCallback(
        (balanceId) => {
            return distributions.find((distribution) => distribution.balance_id === balanceId)
                ?.distributed_amount;
        },
        [distributions, locks],
    );

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

    return (
        <Container>
            <Header>
                <Title>ICE locks</Title>
            </Header>

            <Section>
                {!locks || !distributions || ammAquaBalance === null || aquaInVotes === null ? (
                    <PageLoader />
                ) : locks.length ? (
                    <>
                        {unlockedCount > 1 && account.authType !== LoginTypes.ledger && (
                            <UnlockedBlock>
                                <UnlockedStats>
                                    <span>You have unclaimed locks</span>
                                    <span>
                                        {unlockedCount} locks for {formatBalance(unlockedSum, true)}{' '}
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
                        <ProgressLine
                            percent={+lockPercent}
                            leftLabel={`Locked: ${formatBalance(
                                locksSum,
                                true,
                            )} AQUA (${lockPercent}%)`}
                            rightLabel={
                                <Tooltip
                                    content={
                                        <TooltipInner>
                                            <TooltipTotal>
                                                <span>Total:</span>
                                                <span>{formatBalance(total, true)} AQUA</span>
                                            </TooltipTotal>
                                            <TooltipRow>
                                                <span>Available:</span>
                                                <span>
                                                    {formatBalance(aquaBalance, true)} (
                                                    {availablePercent}%)
                                                </span>
                                            </TooltipRow>
                                            <TooltipRow>
                                                <span>In offers:</span>
                                                <span>
                                                    {formatBalance(aquaInOffers, true)} (
                                                    {inOffersPercent}%)
                                                </span>
                                            </TooltipRow>
                                            <TooltipRow>
                                                <span>In AMM pool:</span>
                                                <span>
                                                    {formatBalance(ammAquaBalance, true)} (
                                                    {ammPercent}%)
                                                </span>
                                            </TooltipRow>
                                            <TooltipRow>
                                                <span>In votes:</span>
                                                <span>
                                                    {formatBalance(aquaInVotes, true)} (
                                                    {inVotesPercent}%)
                                                </span>
                                            </TooltipRow>
                                            <TooltipRow>
                                                <span>Locked:</span>
                                                <span>
                                                    {formatBalance(locksSum, true)} ({lockPercent}%)
                                                </span>
                                            </TooltipRow>
                                        </TooltipInner>
                                    }
                                    position={
                                        +window.innerWidth > 1600
                                            ? TOOLTIP_POSITION.top
                                            : TOOLTIP_POSITION.left
                                    }
                                    isWhite
                                    showOnHover
                                >
                                    <Total>
                                        <div>{formatBalance(total, true)} AQUA</div>
                                        <InfoIcon />
                                    </Total>
                                </Tooltip>
                            }
                        />
                        <TableStyled>
                            <TableHead>
                                <TableHeadRow>
                                    <Cell>Lock start</Cell>
                                    <Cell>Lock end</Cell>
                                    <RightCell>AQUA locked</RightCell>
                                    <RightCell>ICE received</RightCell>
                                    <RightCell>Status</RightCell>
                                </TableHeadRow>
                            </TableHead>
                            <TableBody>
                                {locks.map((lock) => {
                                    const lockEndTimestamp = new Date(
                                        lock.claimants?.[0].predicate?.not?.abs_before,
                                    ).getTime();
                                    const status =
                                        Number(lockEndTimestamp) > Date.now() ? (
                                            <span>Upcoming</span>
                                        ) : (
                                            <Button
                                                isSmall
                                                disabled={
                                                    Boolean(pendingId) && lock.id !== pendingId
                                                }
                                                pending={lock.id === pendingId}
                                                onClick={() => onSubmit(lock.id)}
                                            >
                                                CLAIM
                                            </Button>
                                        );
                                    return (
                                        <TableHeadRowStyled key={lock.id}>
                                            <Cell>
                                                <label>Lock start:</label>
                                                {getDateString(
                                                    new Date(lock.last_modified_time).getTime(),
                                                    { withTime: true },
                                                )}
                                            </Cell>
                                            <Cell>
                                                <label>Lock end:</label>
                                                {getDateString(lockEndTimestamp, {
                                                    withTime: true,
                                                })}
                                            </Cell>
                                            <RightCell>
                                                <label>AQUA locked:</label>
                                                {formatBalance(+lock.amount, true)} AQUA
                                            </RightCell>
                                            <RightCell>
                                                <label>ICE received :</label>
                                                {getIceAmount(lock.id)
                                                    ? `${formatBalance(
                                                          getIceAmount(lock.id),
                                                          true,
                                                      )} ICE`
                                                    : '-'}
                                            </RightCell>
                                            <RightCell>
                                                <label>Status:</label>
                                                {status}
                                            </RightCell>
                                        </TableHeadRowStyled>
                                    );
                                })}
                            </TableBody>
                        </TableStyled>
                    </>
                ) : (
                    <Empty>
                        <h3>There's nothing here.</h3>
                        <span>It looks like you don’t have any active locks.</span>

                        <ExternalLinkStyled asDiv>
                            <Link to={MainRoutes.locker}>Learn about ICE locks</Link>
                        </ExternalLinkStyled>
                    </Empty>
                )}
            </Section>
        </Container>
    );
};

export default IceLocks;
