import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ExternalLinkStyled, Header, Section, Title } from '../AmmRewards/AmmRewards';
import PageLoader from '../../../common/basics/PageLoader';
import { getDistributionForAccount } from '../../../api/ice-locker';
import useAuthStore from '../../../store/authStore/useAuthStore';
import { StellarService, ToastService } from '../../../common/services/globalServices';
import { StellarEvents } from '../../../common/services/stellar.service';
import { formatBalance, getDateString, roundToPrecision } from '../../../common/helpers/helpers';
import ProgressLine from '../../../common/basics/ProgressLine';
import Button from '../../../common/basics/Button';
import { LoginTypes } from '../../../store/authStore/types';
import { BuildSignAndSubmitStatuses } from '../../../common/services/wallet-connect.service';
import ErrorHandler from '../../../common/helpers/error-handler';
import { Empty } from '../YourVotes/YourVotes';
import { Link } from 'react-router-dom';
import { MainRoutes } from '../../../routes';
import { Breakpoints, COLORS } from '../../../common/styles';
import { flexRowSpaceBetween, respondDown } from '../../../common/mixins';
import Info from 'assets/icon-info.svg';
import Tooltip, { TOOLTIP_POSITION } from '../../../common/basics/Tooltip';
import Table, { CellAlign } from '../../../common/basics/Table';
import Checkbox from '../../../common/basics/Checkbox';
import { openCurrentWalletIfExist } from '../../../common/helpers/wallet-connect-helpers';

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
    color: ${COLORS.grayText};
    margin-bottom: 0.4rem;
`;

const TooltipTotal = styled(TooltipRow)`
    font-weight: 700;
    color: ${COLORS.paragraphText};
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

const IceLocks = ({ ammAquaBalance }) => {
    const [locks, setLocks] = useState(null);
    const [selectedLocks, setSelectedLocks] = useState([]);
    const [distributions, setDistributions] = useState(null);
    const [aquaInVotes, setAquaInVotes] = useState(null);

    const [pendingId, setPendingId] = useState(null);

    const { account } = useAuthStore();

    useEffect(() => {
        setLocks(StellarService.getLocks(account.accountId()));
    }, []);

    useEffect(() => {
        StellarService.getAquaInLiquidityVotes(account.accountId()).then(res => {
            setAquaInVotes(res);
        });
    }, []);

    useEffect(() => {
        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                setLocks(StellarService.getLocks(account.accountId()));

                StellarService.getAquaInLiquidityVotes(account.accountId()).then(res => {
                    setAquaInVotes(res);
                });
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
        balanceId => {
            return distributions.find(distribution => distribution.balance_id === balanceId)
                ?.distributed_amount;
        },
        [distributions, locks],
    );

    const onSubmit = async (id?: string) => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        try {
            setPendingId(id || ALL_ID);
            const ops = id
                ? StellarService.createClaimOperations(id, account.getAquaBalance() === null)
                : selectedLocks.reduce((acc, cbId, index) => {
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
                <Title>ICE locks</Title>
            </Header>

            <Section>
                {!locks || !distributions || ammAquaBalance === null || aquaInVotes === null ? (
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
                            <Link to={MainRoutes.locker}>Learn about ICE locks</Link>
                        </ExternalLinkStyled>
                    </Empty>
                )}
            </Section>
        </Container>
    );
};

export default IceLocks;
