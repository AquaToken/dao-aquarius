import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { LoginTypes } from '../../../../../../store/authStore/types';
import Table, { CellAlign } from '../../../../../../common/basics/Table';
import { Breakpoints, COLORS } from '../../../../../../common/styles';
import Pair from '../../../common/Pair';
import { formatBalance, getDateString } from '../../../../../../common/helpers/helpers';
import Tooltip, { TOOLTIP_POSITION } from '../../../../../../common/basics/Tooltip';
import Dislike from '../../../../../../common/assets/img/icon-dislike-gray.svg';
import { BuildSignAndSubmitStatuses } from '../../../../../../common/services/wallet-connect.service';
import {
    DOWN_ICE_CODE,
    ICE_ISSUER,
    UP_ICE_CODE,
} from '../../../../../../common/services/stellar.service';
import { StellarService, ToastService } from '../../../../../../common/services/globalServices';
import ErrorHandler from '../../../../../../common/helpers/error-handler';
import { useIsMounted } from '../../../../../../common/hooks/useIsMounted';
import Checkbox from '../../../../../../common/basics/Checkbox';
import useAuthStore from '../../../../../../store/authStore/useAuthStore';
import styled from 'styled-components';
import { respondDown } from '../../../../../../common/mixins';
import Button from '../../../../../../common/basics/Button';
import LinkIcon from '../../../../../../common/assets/img/icon-external-link.svg';
import { MarketPair } from '../../../../../profile/api/types';
import { openCurrentWalletIfExist } from '../../../../../../common/helpers/wallet-connect-helpers';

const CheckboxMobile = styled(Checkbox)`
    display: none;
    margin-right: 1.5rem;

    ${respondDown(Breakpoints.md)`
        display: block;
    `}
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

const TooltipInner = styled.span`
    font-size: 1.4rem;
    line-height: 2rem;
    margin-left: 0 !important;
`;

const StyledButton = styled(Button)`
    margin-top: 2.3rem;
`;

const Link = styled(LinkIcon)`
    cursor: pointer;
`;

const LinkMobile = styled(Link)`
    display: none;

    ${respondDown(Breakpoints.md)`
        display: block;
    `}
`;

const Amount = styled.span`
    text-align: right;
`;

const ClaimButton = styled(Button)`
    ${respondDown(Breakpoints.md)`
         width: 100%;
         height: 5.4rem;
    `};
`;

const TooltipStyled = styled(Tooltip)`
    margin-left: 0.8rem;
`;

export const goToStellarExpert = ({ transactions }) => {
    const tab = window.open('', '_blank');
    transactions().then((res) => {
        const hash = res?.records?.[0]?.hash;
        if (hash) {
            tab.location.href = `https://stellar.expert/explorer/public/tx/${hash}`;
        }
    });
};

const VotesList = ({
    votes,
    pair,
    withoutClaimDate,
}: {
    votes: any[];
    pair?: MarketPair;
    withoutClaimDate?: boolean;
}) => {
    const [pendingId, setPendingId] = useState(null);
    const [claims, setClaims] = useState(votes);
    const [selectedClaims, setSelectedClaims] = useState(new Map());

    const { account } = useAuthStore();

    const isMounted = useIsMounted();

    const selectClaim = useCallback(
        (claim) => {
            if (selectedClaims.has(claim.id)) {
                selectedClaims.delete(claim.id);
            } else {
                selectedClaims.set(claim.id, claim);
            }

            setSelectedClaims(new Map(selectedClaims));
        },
        [setSelectedClaims, selectedClaims],
    );

    const selectAll = useCallback(() => {
        if (selectedClaims.size !== 0) {
            return setSelectedClaims(new Map());
        }
        const all = claims.reduce((acc, claim) => {
            if (new Date(claim.claimBackDate) <= new Date()) {
                acc.set(claim.id, claim);
            }
            return acc;
        }, new Map());

        setSelectedClaims(new Map(all));
    }, [setSelectedClaims, selectedClaims, claims]);

    const noPendingClaims = useMemo(() => {
        if (!claims) {
            return true;
        }
        return claims.every((claim) => new Date(claim.claimBackDate) > new Date());
    }, [claims]);

    const getActionHeadCell = useCallback(() => {
        if (account.authType === LoginTypes.ledger) {
            return { children: '', align: CellAlign.Center, flexSize: 0.6 };
        }

        return {
            children: (
                <Checkbox
                    checked={Boolean(selectedClaims.size)}
                    onChange={() => {
                        selectAll();
                    }}
                    disabled={noPendingClaims || Boolean(pendingId)}
                />
            ),
            align: CellAlign.Center,
            flexSize: 0.3,
        };
    }, [account, selectedClaims, selectAll, pendingId]);

    const getActionBlock = useCallback(
        (claim) => {
            if (account.authType === LoginTypes.ledger) {
                return {
                    children: (
                        <ClaimButton
                            isSmall
                            onClick={() => onSubmit(claim)}
                            disabled={
                                (Boolean(pendingId) && claim.id !== pendingId) ||
                                new Date(claim.claimBackDate) > new Date()
                            }
                            pending={claim.id === pendingId}
                        >
                            Claim
                        </ClaimButton>
                    ),
                    align: CellAlign.Center,
                    flexSize: 0.6,
                };
            }

            return {
                children: (
                    <Checkbox
                        checked={selectedClaims.has(claim.id)}
                        onChange={() => {
                            selectClaim(claim);
                        }}
                        disabled={new Date(claim.claimBackDate) > new Date() || Boolean(pendingId)}
                    />
                ),
                align: CellAlign.Center,
                flexSize: 0.3,
                hideOnMobile: true,
            };
        },
        [pendingId, account, selectedClaims, selectClaim, pendingId],
    );
    const onSubmit = async (claim?: any) => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        try {
            setPendingId(claim?.id || 'any');

            let hasUpvote = Boolean(claim?.assetCode === UP_ICE_CODE);
            let hasDownvote = Boolean(claim?.assetCode === DOWN_ICE_CODE);

            const ops = claim
                ? StellarService.createClaimOperations(claim.id)
                : Array.from(selectedClaims.values()).reduce((acc, cb) => {
                      if (cb.assetCode === UP_ICE_CODE) {
                          hasUpvote = true;
                      }
                      if (cb.assetCode === DOWN_ICE_CODE) {
                          hasDownvote = true;
                      }
                      return [...acc, ...StellarService.createClaimOperations(cb.id)];
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

            if (
                (claim && claims.length === 1) ||
                (!claim && selectedClaims.size === claims.length)
            ) {
                close();
            }

            if (isMounted.current) {
                setPendingId(null);
                setClaims(
                    claims.filter((cb) =>
                        claim ? claim.id !== cb.id : !selectedClaims.has(cb.id),
                    ),
                );
                setSelectedClaims(new Map());
            }

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
            if (isMounted.current) {
                setPendingId(null);
            }
        }
    };
    return (
        <div>
            {account.authType !== LoginTypes.ledger && (
                <SelectAllMobile
                    checked={Boolean(selectedClaims.size)}
                    onChange={() => {
                        selectAll();
                    }}
                    disabled={noPendingClaims || Boolean(pendingId)}
                    label="Select all"
                />
            )}
            <Table
                head={[
                    { children: 'Pair', hideOnWeb: Boolean(pair), flexSize: 1.5 },
                    { children: 'Vote date' },
                    { children: 'Amount', align: CellAlign.Right },
                    {
                        children: 'Claim back date',
                        align: CellAlign.Right,
                        hideOnWeb: withoutClaimDate,
                    },
                    getActionHeadCell(),
                    { children: '', align: CellAlign.Center, flexSize: 0.1 },
                ]}
                body={claims.map((claim) => ({
                    key: claim.id,
                    isNarrow: true,
                    mobileBackground: COLORS.lightGray,
                    mobileFontSize: '1.4rem',
                    rowItems: [
                        {
                            children: (
                                <>
                                    <CheckboxMobile
                                        checked={selectedClaims.has(claim.id)}
                                        onChange={() => {
                                            selectClaim(claim);
                                        }}
                                        disabled={
                                            new Date(claim.claimBackDate) > new Date() ||
                                            Boolean(pendingId)
                                        }
                                    />
                                    <Pair
                                        base={{
                                            code: pair?.asset1_code || claim.asset1_code,
                                            issuer: pair?.asset1_issuer || claim.asset1_issuer,
                                        }}
                                        counter={{
                                            code: pair?.asset2_code || claim.asset2_code,
                                            issuer: pair?.asset2_issuer || claim.asset2_issuer,
                                        }}
                                        withoutDomains
                                        withoutLink
                                    />
                                    <LinkMobile
                                        onClick={() => {
                                            goToStellarExpert(claim);
                                        }}
                                    />
                                </>
                            ),
                            hideOnWeb: Boolean(pair),
                            flexSize: 1.5,
                        },
                        {
                            children: claim.last_modified_time
                                ? getDateString(new Date(claim.last_modified_time).getTime(), {
                                      withTime: true,
                                  })
                                : 'No data',
                            label: 'Vote date:',
                        },
                        {
                            children: (
                                <>
                                    <Amount>
                                        {formatBalance(claim.amount)} {claim.assetCode}
                                    </Amount>
                                    {claim.isDownVote && (
                                        <TooltipStyled
                                            content={<TooltipInner>Downvote</TooltipInner>}
                                            position={
                                                +window.innerWidth > 992
                                                    ? TOOLTIP_POSITION.top
                                                    : TOOLTIP_POSITION.left
                                            }
                                            showOnHover
                                        >
                                            <Dislike />
                                        </TooltipStyled>
                                    )}
                                </>
                            ),
                            label: 'Amount:',
                            align: CellAlign.Right,
                        },
                        {
                            children: (
                                <>
                                    <label>Claim back date:</label>
                                    <span>
                                        {new Date(claim.claimBackDate) > new Date()
                                            ? getDateString(
                                                  new Date(claim.claimBackDate).getTime(),
                                                  {
                                                      withTime: true,
                                                  },
                                              )
                                            : 'Ready to claim'}
                                    </span>
                                </>
                            ),
                            align: CellAlign.Right,
                            hideOnWeb: withoutClaimDate,
                        },
                        getActionBlock(claim),
                        {
                            children: (
                                <Link
                                    onClick={() => {
                                        goToStellarExpert(claim);
                                    }}
                                />
                            ),
                            align: CellAlign.Right,
                            flexSize: 0.1,
                            hideOnMobile: true,
                        },
                    ],
                }))}
            />
            {account.authType !== LoginTypes.ledger && (
                <StyledButton
                    disabled={!Boolean(selectedClaims.size)}
                    fullWidth
                    isBig
                    pending={Boolean(pendingId)}
                    onClick={() => onSubmit()}
                >
                    Claim selected
                </StyledButton>
            )}
        </div>
    );
};

export default VotesList;
