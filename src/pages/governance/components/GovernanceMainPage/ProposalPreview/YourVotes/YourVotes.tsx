import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Table, { CellAlign } from '../../../../../../common/basics/Table';
import { Breakpoints, COLORS } from '../../../../../../common/styles';
import { formatBalance, getDateString } from '../../../../../../common/helpers/helpers';
import { LoginTypes } from '../../../../../../store/authStore/types';
import DotsLoader from '../../../../../../common/basics/DotsLoader';
import Button from '../../../../../../common/basics/Button';
import { BuildSignAndSubmitStatuses } from '../../../../../../common/services/wallet-connect.service';
import { StellarService, ToastService } from '../../../../../../common/services/globalServices';
import {
    GOV_ICE_CODE,
    ICE_ISSUER,
    StellarEvents,
} from '../../../../../../common/services/stellar.service';
import ErrorHandler from '../../../../../../common/helpers/error-handler';
import useAuthStore from '../../../../../../store/authStore/useAuthStore';
import styled from 'styled-components';
import Aqua from '../../../../../../common/assets/img/aqua-logo-small.svg';
import Ice from '../../../../../../common/assets/img/ice-logo.svg';
import IconFail from '../../../../../../common/assets/img/icon-fail.svg';
import IconSuccess from '../../../../../../common/assets/img/icon-success.svg';
import Checkbox from '../../../../../../common/basics/Checkbox';
import { respondDown } from '../../../../../../common/mixins';
import { LogVote } from '../../../../api/types';
import { openCurrentWalletIfExist } from '../../../../../../common/helpers/wallet-connect-helpers';

const AquaLogo = styled(Aqua)`
    height: 1.6rem;
    width: 1.6rem;
    margin-left: 0.5rem;
`;

const IceLogo = styled(Ice)`
    height: 1.6rem;
    width: 1.6rem;
    margin-left: 0.5rem;
`;

const Cell = styled.span`
    display: flex;
    align-items: center;
`;

const IconAgainst = styled(IconFail)`
    height: 1.6rem;
    width: 1.6rem;
    margin-right: 0.5rem;
`;

const IconFor = styled(IconSuccess)`
    height: 1.6rem;
    width: 1.6rem;
    margin-right: 0.5rem;
`;

const StyledButton = styled(Button)`
    margin-top: 2rem;
`;

const SelectAllMobile = styled(Checkbox)`
    display: none;
    margin-bottom: 2.8rem;
    margin-left: 1.6rem;
    width: fit-content;

    ${respondDown(Breakpoints.md)`
        display: flex;
   `}
`;

const YourVotes = ({ proposal }) => {
    const [claimUpdateId, setClaimUpdateId] = useState(0);
    const [claims, setClaims] = useState(null);
    const [selectedClaims, setSelectedClaims] = useState(new Map());
    const [pendingId, setPendingId] = useState(null);

    const { account } = useAuthStore();

    const isLedgerAuth = useMemo(() => account?.authType === LoginTypes.ledger, [account]);

    useEffect(() => {
        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                setClaimUpdateId((prevState) => prevState + 1);
            }
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        if (!account) {
            setClaimUpdateId(0);
            setClaims(null);
            return;
        }
        setClaims(StellarService.getVotesForProposal(proposal, account.accountId()));
    }, [claimUpdateId, account]);

    const unlockedClaims = useMemo(() => {
        if (!claims) {
            return [];
        }
        return proposal.logvote_set.reduce((acc, item) => {
            const claim = claims.find(({ id }) => id === item.claimable_balance_id);
            if (!claim) {
                return acc;
            }
            const claimBackTimestamp = new Date(claim.claimBackDate).getTime();
            if (claimBackTimestamp > Date.now()) {
                return acc;
            }
            acc.push(item.claimable_balance_id);
            return acc;
        }, []);
    }, [claims, proposal]);

    const getActionBlock = useCallback(
        (vote: LogVote) => {
            if (!claims) {
                return <DotsLoader />;
            }

            const { claimable_balance_id: balanceId } = vote;

            const claim = claims.find(({ id }) => id === balanceId);

            if (!claim) {
                return 'Claimed';
            }

            const claimBackTimestamp = new Date(claim.claimBackDate).getTime();

            if (claimBackTimestamp > Date.now()) {
                return getDateString(claimBackTimestamp, { withTime: true });
            }

            return isLedgerAuth ? (
                <Button
                    isSmall
                    pending={balanceId === pendingId}
                    disabled={Boolean(pendingId) && balanceId !== pendingId}
                    onClick={(event) => claimBack(event, vote)}
                >
                    claim
                </Button>
            ) : (
                'Ready to claim'
            );
        },
        [claims, pendingId],
    );

    const selectClaim = useCallback(
        (event: Event, log: LogVote) => {
            event.stopPropagation();
            event.preventDefault();

            const { claimable_balance_id: balanceId } = log;

            if (selectedClaims.has(balanceId)) {
                selectedClaims.delete(balanceId);

                return setSelectedClaims(new Map(selectedClaims));
            }
            selectedClaims.set(balanceId, log);
            setSelectedClaims(new Map(selectedClaims));
        },
        [selectedClaims, setSelectedClaims],
    );

    const selectAll = useCallback(
        (event) => {
            event.stopPropagation();
            event.preventDefault();

            if (Boolean(selectedClaims.size)) {
                return setSelectedClaims(new Map());
            }

            const all = proposal.logvote_set.reduce((acc, log) => {
                if (unlockedClaims.includes(log.claimable_balance_id)) {
                    acc.set(log.claimable_balance_id, log);
                }
                return acc;
            }, new Map());
            setSelectedClaims(all);
        },
        [selectedClaims, setSelectedClaims, proposal, unlockedClaims],
    );

    const claimBack = async (event, log?: LogVote) => {
        event.stopPropagation();
        event.preventDefault();

        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }

        try {
            setPendingId(log?.claimable_balance_id || 'all');
            let hasIce = log?.asset_code === GOV_ICE_CODE;

            const ops = log
                ? StellarService.createClaimOperations(log.claimable_balance_id)
                : Array.from(selectedClaims.values()).reduce((acc, cb) => {
                      if (cb.asset_code === GOV_ICE_CODE) {
                          hasIce = true;
                      }
                      return [
                          ...acc,
                          ...StellarService.createClaimOperations(cb.claimable_balance_id),
                      ];
                  }, []);

            let tx = await StellarService.buildTx(account, ops);

            if (hasIce) {
                tx = await StellarService.processIceTx(
                    tx,
                    StellarService.createAsset(GOV_ICE_CODE, ICE_ISSUER),
                );
            }

            const result = await account.signAndSubmitTx(tx);

            setPendingId(null);

            if (
                (result as { status: BuildSignAndSubmitStatuses }).status ===
                BuildSignAndSubmitStatuses.pending
            ) {
                ToastService.showSuccessToast('More signatures required to complete');
                return;
            }
            ToastService.showSuccessToast('Your votes has been claimed back');
            StellarService.getClaimableBalances(account.accountId());
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            setPendingId(null);
        }
    };

    return (
        <>
            {!isLedgerAuth && (
                <SelectAllMobile
                    disabled={!unlockedClaims.length || pendingId}
                    checked={Boolean(selectedClaims.size)}
                    onChange={(_, event) => selectAll(event)}
                    label="Select all"
                />
            )}
            <Table
                head={[
                    { children: 'Time' },
                    { children: 'Vote' },
                    { children: 'Voted', align: CellAlign.Right },
                    { children: 'Claim back date', align: CellAlign.Right },
                    {
                        children: (
                            <Checkbox
                                disabled={!unlockedClaims.length || pendingId}
                                checked={Boolean(selectedClaims.size)}
                                onChange={(_, event) => selectAll(event)}
                            />
                        ),
                        align: CellAlign.Right,
                        flexSize: 0.3,
                        hideOnWeb: isLedgerAuth,
                        hideOnMobile: isLedgerAuth,
                    },
                ]}
                body={proposal.logvote_set.map((log) => ({
                    key: log.claimable_balance_id,
                    isNarrow: true,
                    mobileBackground: COLORS.lightGray,
                    mobileFontSize: '1.4rem',
                    rowItems: [
                        {
                            children: (
                                <Checkbox
                                    disabled={
                                        !unlockedClaims.includes(log.claimable_balance_id) ||
                                        pendingId
                                    }
                                    checked={selectedClaims.has(log.claimable_balance_id)}
                                    onChange={(_, event) => selectClaim(event, log)}
                                />
                            ),
                            hideOnWeb: true,
                            hideOnMobile: isLedgerAuth,
                        },
                        {
                            children: getDateString(new Date(log.created_at).getTime(), {
                                withTime: true,
                                withoutYear: true,
                            }),
                            label: 'Time:',
                        },
                        {
                            children: (
                                <Cell>
                                    {log.vote_choice === 'vote_for' ? <IconFor /> : <IconAgainst />}
                                    {log.vote_choice === 'vote_for' ? 'Vote For' : 'Vote Against'}
                                </Cell>
                            ),
                            label: 'Vote:',
                        },
                        {
                            children: (
                                <Cell>
                                    {formatBalance(Number(log.amount))}
                                    {log.asset_code === 'AQUA' ? <AquaLogo /> : <IceLogo />}
                                </Cell>
                            ),
                            label: 'Voted:',
                            align: CellAlign.Right,
                        },
                        {
                            children: getActionBlock(log),
                            label: 'Claim back date:',
                            align: CellAlign.Right,
                        },
                        {
                            children: (
                                <Checkbox
                                    disabled={
                                        !unlockedClaims.includes(log.claimable_balance_id) ||
                                        pendingId
                                    }
                                    checked={selectedClaims.has(log.claimable_balance_id)}
                                    onChange={(_, event) => selectClaim(event, log)}
                                />
                            ),
                            align: CellAlign.Right,
                            flexSize: 0.3,
                            hideOnWeb: isLedgerAuth,
                            hideOnMobile: true,
                        },
                    ],
                }))}
            />
            {!isLedgerAuth && (
                <StyledButton
                    fullWidth
                    isBig
                    onClick={(e) => claimBack(e)}
                    disabled={!Boolean(selectedClaims.size)}
                    pending={Boolean(pendingId)}
                >
                    claim selected
                </StyledButton>
            )}
        </>
    );
};

export default YourVotes;
