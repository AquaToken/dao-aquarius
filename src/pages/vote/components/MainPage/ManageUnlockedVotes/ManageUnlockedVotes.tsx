import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../../common/styles';
import { formatBalance, getDateString } from '../../../../../common/helpers/helpers';
import { StellarService, ToastService } from '../../../../../common/services/globalServices';
import {
    BuildSignAndSubmitStatuses,
    openApp,
} from '../../../../../common/services/wallet-connect.service';
import Tooltip, { TOOLTIP_POSITION } from '../../../../../common/basics/Tooltip';
import { respondDown } from '../../../../../common/mixins';
import useAuthStore from '../../../../../store/authStore/useAuthStore';
import Button from '../../../../../common/basics/Button';
import { useIsMounted } from '../../../../../common/hooks/useIsMounted';
import {
    DOWN_ICE_CODE,
    ICE_ISSUER,
    StellarEvents,
    UP_ICE_CODE,
} from '../../../../../common/services/stellar.service';
import Pair from '../../common/Pair';
import Dislike from '../../../../../common/assets/img/icon-dislike-gray.svg';
import { ModalDescription, ModalTitle } from '../../../../../common/modals/atoms/ModalAtoms';
import { LoginTypes } from '../../../../../store/authStore/types';
import ErrorHandler from '../../../../../common/helpers/error-handler';

const Container = styled.div`
    width: 80.6rem;
    max-height: 80vh;
    padding-right: 0.5rem;
    overflow: auto;

    &::-webkit-scrollbar {
        width: 0.5rem;
    }

    /* Track */
    &::-webkit-scrollbar-track {
        background: ${COLORS.white};
    }

    /* Handle */
    &::-webkit-scrollbar-thumb {
        background: ${COLORS.purple};
        border-radius: 0.25rem;
    }

    ${respondDown(Breakpoints.md)`
          width: 100%;
          max-height: unset;
      `};
`;

const TableHeader = styled.div`
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.grayText};
    display: flex;

    margin-bottom: 1.8rem;

    ${respondDown(Breakpoints.md)`
        display: none;
    `};
`;

const DislikeIcon = styled(Dislike)`
    margin-left: 0.8rem;
`;

const TableRow = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    display: flex;
    color: ${COLORS.paragraphText};
    margin-bottom: 0.6rem;

    ${respondDown(Breakpoints.md)`
         flex-direction: column;
         background: ${COLORS.lightGray};
         padding: 2rem;
         border-radius: 0.5rem;
         
         &:not(:last-child) {
             margin-bottom: 1rem;
         }
    `};
`;

const Cell = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex: 1;
    text-align: right;
    span {
        margin-left: 0.8rem;
    }
    label {
        display: none;
    }

    ${respondDown(Breakpoints.md)`
        label {
            display: inline;
            margin-right: auto;
            color: ${COLORS.grayText};
        }
        
        &:not(:last-child) {
            margin-bottom: 1rem;
        }

    `};
`;

const PairCell = styled(Cell)`
    flex: 1.5;
    justify-content: flex-start;
`;

const ButtonCell = styled(Cell)`
    flex: 0.5;
`;

const ClaimButton = styled(Button)`
    ${respondDown(Breakpoints.md)`
         width: 100%;
         height: 5.4rem;
    `};
`;

const ButtonContainer = styled.div`
    margin-top: 2.5rem;
    padding-top: 3.2rem;
    border-top: 0.1rem dashed ${COLORS.gray};
`;

const EmptyList = styled.span`
    font-size: 1.6rem;
`;

const TooltipInner = styled.span`
    font-size: 1.4rem;
    line-height: 2rem;
    margin-left: 0 !important;
`;

const ClaimAllModal = ({ params, close }) => {
    const [pendingId, setPendingId] = useState(null);
    const [pendingAll, setPendingAll] = useState(false);
    const [claims, setClaims] = useState(null);
    const [updateId, setUpdateId] = useState(1);
    const { pairs } = params;
    const { account } = useAuthStore();

    const isMounted = useIsMounted();

    useEffect(() => {
        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                setUpdateId((prevState) => prevState + 1);
            }
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        const processedClaims = pairs.reduce((acc, pair) => {
            acc = [
                ...acc,
                ...StellarService.getPairVotes(pair, account.accountId())
                    .filter((claim) => new Date(claim.claimBackDate) < new Date())
                    .map((item) => ({ ...pair, ...item })),
            ];
            return acc;
        }, []);
        setClaims(processedClaims);
    }, [updateId]);

    const claimVotes = async (claim?: any) => {
        if (account.authType === LoginTypes.walletConnect) {
            openApp();
        }
        try {
            if (claim) {
                setPendingId(claim.id);
            } else {
                setPendingAll(true);
            }
            let hasUpvote = claim && claim.assetCode === UP_ICE_CODE;
            let hasDownvote = claim && claim.assetCode === DOWN_ICE_CODE;

            const ops = claim
                ? StellarService.createClaimOperations(claim.id)
                : claims.reduce((acc, cb) => {
                      if (cb.assetCode === UP_ICE_CODE) {
                          hasUpvote = true;
                      }
                      if (cb.assetCode === DOWN_ICE_CODE) {
                          hasDownvote = true;
                      }
                      acc = [...acc, ...StellarService.createClaimOperations(cb.id)];
                      return acc;
                  }, []);

            let tx = await StellarService.buildTx(account, ops);

            if (hasUpvote) {
                tx = await StellarService.processIceTx(
                    tx,
                    StellarService.createAsset(UP_ICE_CODE, ICE_ISSUER),
                );
            }

            if (hasDownvote) {
                tx = await StellarService.processIceTx(
                    tx,
                    StellarService.createAsset(DOWN_ICE_CODE, ICE_ISSUER),
                );
            }

            const result = await account.signAndSubmitTx(tx);

            if (isMounted.current) {
                setPendingId(null);
                setPendingAll(false);
            }

            if (
                (result as { status: BuildSignAndSubmitStatuses }).status ===
                BuildSignAndSubmitStatuses.pending
            ) {
                ToastService.showSuccessToast('More signatures required to complete');
                return;
            }
            if (claims.length === 1 || !claim) {
                close();
            }
            if (isMounted.current && Boolean(claim)) {
                setClaims(claims.filter((cb) => cb.id !== claim.id));
            }
            ToastService.showSuccessToast(
                Boolean(claim)
                    ? 'Your vote has been claimed back'
                    : 'Your votes have been claimed back',
            );
            StellarService.getClaimableBalances(account.accountId());
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            if (isMounted.current) {
                setPendingId(null);
                setPendingAll(false);
            }
        }
    };

    // TODO remove this after backend fix
    const hasBothUpvoteAndDownvote = useMemo(() => {
        if (!claims || !claims.length) {
            return false;
        }
        return (
            claims.some(({ assetCode }) => assetCode === DOWN_ICE_CODE) &&
            claims.some(({ assetCode }) => assetCode === UP_ICE_CODE)
        );
    }, [claims]);

    if (!claims) {
        return null;
    }

    return (
        <Container>
            <ModalTitle>Manage unlocked votes</ModalTitle>
            <ModalDescription>View your unlocked votes and claim back</ModalDescription>
            {claims.length ? (
                <>
                    <TableHeader>
                        <PairCell>Pair</PairCell>
                        <Cell>Vote date</Cell>
                        <Cell>Amount</Cell>
                        <ButtonCell />
                    </TableHeader>
                    {claims.map((claim) => (
                        <TableRow key={claim.id}>
                            <PairCell>
                                <Pair
                                    base={{ code: claim.asset1_code, issuer: claim.asset1_issuer }}
                                    counter={{
                                        code: claim.asset2_code,
                                        issuer: claim.asset2_issuer,
                                    }}
                                    withoutDomains
                                />
                            </PairCell>
                            <Cell>
                                <label>Vote date:</label>
                                {getDateString(new Date(claim.last_modified_time).getTime(), {
                                    withTime: true,
                                })}
                            </Cell>
                            <Cell>
                                <label>Amount:</label>
                                {claim.isDownVote && (
                                    <Tooltip
                                        content={<TooltipInner>Downvote</TooltipInner>}
                                        position={TOOLTIP_POSITION.top}
                                        showOnHover
                                    >
                                        <DislikeIcon />
                                    </Tooltip>
                                )}
                                <span>
                                    {formatBalance(claim.amount)} {claim.asset.split(':')[0]}
                                </span>
                            </Cell>
                            <ButtonCell>
                                <ClaimButton
                                    isSmall
                                    onClick={() => claimVotes(claim)}
                                    disabled={
                                        (Boolean(pendingId) && claim.id !== pendingId) || pendingAll
                                    }
                                    pending={claim.id === pendingId}
                                >
                                    Claim
                                </ClaimButton>
                            </ButtonCell>
                        </TableRow>
                    ))}
                    {account.authType !== LoginTypes.ledger && !hasBothUpvoteAndDownvote && (
                        <ButtonContainer>
                            <Button
                                fullWidth
                                pending={pendingAll}
                                disabled={Boolean(pendingId)}
                                onClick={() => claimVotes()}
                            >
                                claim all
                            </Button>
                        </ButtonContainer>
                    )}
                </>
            ) : (
                <>
                    <EmptyList>You don't have unlocked votes</EmptyList>
                    <ButtonContainer>
                        <Button fullWidth onClick={() => close()}>
                            close
                        </Button>
                    </ButtonContainer>
                </>
            )}
        </Container>
    );
};

export default ClaimAllModal;
