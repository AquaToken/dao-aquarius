import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { processIceTx } from 'api/ice';

import { GD_ICE_CODE, GOV_ICE_CODE, ICE_ISSUER } from 'constants/assets';

import { getDateString } from 'helpers/date';
import ErrorHandler from 'helpers/error-handler';
import { formatBalance } from 'helpers/format-number';
import { createAsset } from 'helpers/token';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import { StellarService, ToastService } from 'services/globalServices';
import { StellarEvents } from 'services/stellar/events/events';

import Aqua from 'assets/aqua/aqua-logo.svg';
import IconFail from 'assets/icons/status/fail-red.svg';
import IconSuccess from 'assets/icons/status/success.svg';
import Ice from 'assets/tokens/ice-logo.svg';

import Button from 'basics/buttons/Button';
import Checkbox from 'basics/inputs/Checkbox';
import DotsLoader from 'basics/loaders/DotsLoader';
import Table, { CellAlign } from 'basics/Table';

import { respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import { LogVote, ProposalSimple } from '../../../../api/types';

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

interface YourVotesProps {
    proposal: ProposalSimple;
}

const YourVotes = ({ proposal }: YourVotesProps): React.ReactNode => {
    const [claimUpdateId, setClaimUpdateId] = useState(0);
    const [claims, setClaims] = useState(null);
    const [selectedClaims, setSelectedClaims] = useState(new Map());
    const [pendingId, setPendingId] = useState(null);

    const { account } = useAuthStore();

    const isLedgerAuth = useMemo(() => account?.authType === LoginTypes.ledger, [account]);

    useEffect(() => {
        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                setClaimUpdateId(prevState => prevState + 1);
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
        setClaims(StellarService.cb.getVotesForProposal(proposal, account.accountId()));
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

    const claimBack = async (event: React.MouseEvent, log?: LogVote) => {
        event.stopPropagation();
        event.preventDefault();

        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }

        try {
            setPendingId(log?.claimable_balance_id || 'all');
            let hasIce = log?.asset_code === GOV_ICE_CODE;
            let hasGdIce = log?.asset_code === GD_ICE_CODE;

            const ops = log
                ? StellarService.op.createClaimOperations(log.claimable_balance_id)
                : Array.from(selectedClaims.values()).reduce((acc, cb) => {
                      if (cb.asset_code === GOV_ICE_CODE) {
                          hasIce = true;
                      }

                      if (cb.asset_code === GD_ICE_CODE) {
                          hasGdIce = true;
                      }
                      return [
                          ...acc,
                          ...StellarService.op.createClaimOperations(cb.claimable_balance_id),
                      ];
                  }, []);

            let tx = await StellarService.tx.buildTx(account, ops);

            if (hasIce) {
                tx = await processIceTx(tx, createAsset(GOV_ICE_CODE, ICE_ISSUER));
            }

            if (hasGdIce) {
                tx = await processIceTx(tx, createAsset(GD_ICE_CODE, ICE_ISSUER));
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
            StellarService.cb.getClaimableBalances(account.accountId());
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            setPendingId(null);
        }
    };

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
                    onClick={event => claimBack(event, vote)}
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
        (event: React.MouseEvent, log: LogVote) => {
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
        (event: React.MouseEvent) => {
            event.stopPropagation();
            event.preventDefault();

            if (selectedClaims.size) {
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

    return (
        <>
            {!isLedgerAuth && (
                <SelectAllMobile
                    disabled={!unlockedClaims.length || pendingId}
                    checked={Boolean(selectedClaims.size)}
                    onChange={(_, event: React.MouseEvent) => selectAll(event)}
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
                body={proposal.logvote_set.map(log => ({
                    key: log.claimable_balance_id,
                    isNarrow: true,
                    mobileBackground: COLORS.gray50,
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
                    onClick={(e: React.MouseEvent) => claimBack(e)}
                    disabled={!selectedClaims.size}
                    pending={Boolean(pendingId)}
                >
                    claim selected
                </StyledButton>
            )}
        </>
    );
};

export default YourVotes;
