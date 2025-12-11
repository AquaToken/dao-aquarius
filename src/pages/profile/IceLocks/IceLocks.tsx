import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { getDistributionForAccount } from 'api/ice-locker';

import { AppRoutes } from 'constants/routes';

import { getDateString } from 'helpers/date';
import ErrorHandler from 'helpers/error-handler';
import { formatBalance, roundToPrecision } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import { StellarService, ToastService } from 'services/globalServices';
import { StellarEvents } from 'services/stellar/events/events';

import Info from 'assets/icons/status/icon-info-16.svg';

import Button from 'basics/buttons/Button';
import Checkbox from 'basics/inputs/Checkbox';
import PageLoader from 'basics/loaders/PageLoader';
import { ProgressLine } from 'basics/progress';
import Table, { CellAlign } from 'basics/Table';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { flexRowSpaceBetween, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import { ExternalLinkStyled, Header, Section, Title } from '../SdexRewards/SdexRewards';
import { Empty } from '../YourVotes/YourVotes';

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

const TableStyled = styled(Table)`
    margin-top: 2.5rem;
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
    color: ${COLORS.textGray};
    margin-bottom: 0.4rem;
`;

const TooltipTotal = styled(TooltipRow)`
    font-weight: 700;
    color: ${COLORS.textTertiary};
    font-size: 1.6rem;
    line-height: 2.8rem;
`;

const StyledButton = styled(Button)`
    margin-top: 2rem;
`;

const SelectAll = styled(Checkbox)`
    display: none;
    margin-top: 2.8rem;
    margin-bottom: 2.8rem;
    margin-left: 1.6rem;
    width: fit-content;

    ${respondDown(Breakpoints.md)`
        display: flex;
    `}
`;

const ALL_ID = 'all';

interface IceLocksProps {
    ammAquaBalance: number;
}

const IceLocks = ({ ammAquaBalance }: IceLocksProps): React.ReactNode => {
    const [locks, setLocks] = useState(null);
    const [selectedLocks, setSelectedLocks] = useState([]);
    const [distributions, setDistributions] = useState(null);

    const [pendingId, setPendingId] = useState(null);

    const { account } = useAuthStore();

    useEffect(() => {
        setLocks(StellarService.cb.getLocks(account.accountId()));
    }, []);

    useEffect(() => {
        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                setLocks(StellarService.cb.getLocks(account.accountId()));
            }
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        getDistributionForAccount(account.accountId()).then(res => {
            setDistributions(res);
        });
    }, []);

    const aquaBalance = account.getAquaBalance();
    const aquaInOffers = account.getAquaInOffers();

    const { locksSum, unlockedIds } = useMemo(() => {
        if (!locks) {
            return { locksSum: 0, unlockedIds: [] };
        }
        return locks.reduce(
            (acc, lock) => {
                const unlockTimestamp =
                    Number(lock.claimants[0]?.predicate?.not?.abs_before_epoch) * 1000;
                if (unlockTimestamp && unlockTimestamp < Date.now()) {
                    acc.unlockedIds.push(lock.id);
                }
                acc.locksSum += Number(lock.amount);
                return acc;
            },
            { locksSum: 0, unlockedIds: [] },
        );
    }, [locks]);

    const total = useMemo(
        () => locksSum + aquaBalance + aquaInOffers + ammAquaBalance,
        [locksSum, aquaBalance, aquaInOffers, ammAquaBalance],
    );

    const availablePercent = useMemo(
        () => roundToPrecision((aquaBalance / total) * 100, 2),
        [total],
    );
    const inOffersPercent = useMemo(
        () => roundToPrecision((aquaInOffers / total) * 100, 2),
        [total],
    );
    const ammPercent = useMemo(() => roundToPrecision((ammAquaBalance / total) * 100, 2), [total]);

    const lockPercent = useMemo(() => roundToPrecision((locksSum / total) * 100, 2), [total]);

    const getIceAmount = useCallback(
        balanceId =>
            distributions.find(distribution => distribution.balance_id === balanceId)
                ?.distributed_amount,
        [distributions, locks],
    );

    const onSubmit = async (id?: string) => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        try {
            setPendingId(id || ALL_ID);
            const ops = id
                ? StellarService.op.createClaimOperations(id, account.getAquaBalance() === null)
                : selectedLocks.reduce((acc, cbId, index) => {
                      acc = [
                          ...acc,
                          ...StellarService.op.createClaimOperations(
                              cbId,
                              index === 1 && account.getAquaBalance() === null,
                          ),
                      ];
                      return acc;
                  }, []);

            const tx = await StellarService.tx.buildTx(account, ops);

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
            StellarService.cb.getClaimableBalances(account.accountId());
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            setPendingId(null);
        }
    };

    const selectLock = useCallback(
        id => {
            if (selectedLocks.includes(id)) {
                return setSelectedLocks(selectedLocks.filter(lockId => lockId !== id));
            }
            setSelectedLocks([...selectedLocks, id]);
        },
        [setSelectedLocks, selectedLocks],
    );

    const selectAll = useCallback(() => {
        if (selectedLocks.length) {
            return setSelectedLocks([]);
        }
        const all = locks.filter(({ id }) => unlockedIds.includes(id)).map(({ id }) => id);
        setSelectedLocks(all);
    }, [setSelectedLocks, selectedLocks, locks, unlockedIds]);

    const getActionHeaderCell = useCallback(() => {
        if (account.authType === LoginTypes.ledger) {
            return { children: 'Status', align: CellAlign.Right };
        }
        return {
            children: (
                <Checkbox
                    checked={Boolean(selectedLocks.length)}
                    onChange={() => selectAll()}
                    disabled={!unlockedIds.length}
                />
            ),
            align: CellAlign.Center,
            flexSize: 0.3,
        };
    }, [account, selectAll, selectedLocks, unlockedIds]);

    const getActionCell = useCallback(
        lock => {
            if (account.authType === LoginTypes.ledger) {
                return {
                    children: !unlockedIds.includes(lock.id) ? (
                        <span>Upcoming</span>
                    ) : (
                        <Button
                            isSmall
                            disabled={Boolean(pendingId) && lock.id !== pendingId}
                            pending={lock.id === pendingId}
                            onClick={() => onSubmit(lock.id)}
                        >
                            CLAIM
                        </Button>
                    ),
                    label: 'Status:',
                    align: CellAlign.Right,
                };
            }

            return {
                children: (
                    <Checkbox
                        checked={selectedLocks.includes(lock.id)}
                        onChange={() => selectLock(lock.id)}
                        disabled={!unlockedIds.includes(lock.id)}
                    />
                ),
                align: CellAlign.Center,
                flexSize: 0.3,
                hideOnMobile: true,
            };
        },
        [account, pendingId, selectedLocks, selectLock, unlockedIds],
    );

    return (
        <Container>
            <Header>
                <Title>ICE Locks</Title>
            </Header>

            <Section>
                {!locks || !distributions || ammAquaBalance === null ? (
                    <PageLoader />
                ) : locks.length ? (
                    <>
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
                                                <span>In AMM pools:</span>
                                                <span>
                                                    {formatBalance(ammAquaBalance, true)} (
                                                    {ammPercent}%)
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
                                    background={COLORS.white}
                                    showOnHover
                                >
                                    <Total>
                                        <div>{formatBalance(total, true)} AQUA</div>
                                        <InfoIcon />
                                    </Total>
                                </Tooltip>
                            }
                        />
                        {account.authType !== LoginTypes.ledger && (
                            <SelectAll
                                checked={Boolean(selectedLocks.length)}
                                onChange={() => selectAll()}
                                disabled={!unlockedIds.length}
                                label="Select all"
                            />
                        )}
                        <TableStyled
                            head={[
                                { children: 'Lock start' },
                                { children: 'Lock end' },
                                { children: 'AQUA locked', align: CellAlign.Right },
                                { children: 'ICE received', align: CellAlign.Right },
                                getActionHeaderCell(),
                            ]}
                            body={locks.map(lock => {
                                const lockEndTimestamp = new Date(
                                    lock.claimants?.[0].predicate?.not?.abs_before,
                                ).getTime();
                                return {
                                    key: lock.id,
                                    isNarrow: true,
                                    rowItems: [
                                        {
                                            children: (
                                                <Checkbox
                                                    checked={selectedLocks.includes(lock.id)}
                                                    onChange={() => selectLock(lock.id)}
                                                    disabled={!unlockedIds.includes(lock.id)}
                                                />
                                            ),
                                            hideOnWeb: true,
                                        },
                                        {
                                            children: lock.last_modified_time
                                                ? `${getDateString(
                                                      new Date(lock.last_modified_time).getTime(),
                                                      { withTime: true },
                                                  )}`
                                                : 'No data',
                                            label: 'Lock start:',
                                        },
                                        {
                                            children: `${getDateString(lockEndTimestamp, {
                                                withTime: true,
                                            })}`,
                                            label: 'Lock end:',
                                        },
                                        {
                                            children: `${formatBalance(+lock.amount, true)} AQUA`,
                                            label: 'AQUA locked:',
                                            align: CellAlign.Right,
                                        },
                                        {
                                            children: getIceAmount(lock.id)
                                                ? `${formatBalance(
                                                      getIceAmount(lock.id),
                                                      true,
                                                  )} ICE`
                                                : '-',
                                            label: 'ICE received:',
                                            align: CellAlign.Right,
                                        },
                                        getActionCell(lock),
                                    ],
                                };
                            })}
                        />
                        {account.authType !== LoginTypes.ledger && (
                            <StyledButton
                                fullWidth
                                isBig
                                disabled={!selectedLocks.length}
                                onClick={() => onSubmit()}
                                pending={Boolean(pendingId)}
                            >
                                claim selected
                            </StyledButton>
                        )}
                    </>
                ) : (
                    <Empty>
                        <h3>There's nothing here.</h3>
                        <span>It looks like you don’t have any active locks.</span>

                        <ExternalLinkStyled asDiv>
                            <Link to={AppRoutes.section.locker.link.index}>
                                Learn about ICE locks
                            </Link>
                        </ExternalLinkStyled>
                    </Empty>
                )}
            </Section>
        </Container>
    );
};

export default IceLocks;
