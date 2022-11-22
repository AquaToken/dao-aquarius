import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { useEffect, useState } from 'react';
import { StellarService, ToastService } from '../../../../common/services/globalServices';
import useAuthStore from '../../../../common/store/authStore/useAuthStore';
import { StellarEvents } from '../../../../common/services/stellar.service';
import PageLoader from '../../../../common/basics/PageLoader';
import { formatBalance, getDateString } from '../../../../common/helpers/helpers';
import Tooltip, { TOOLTIP_POSITION } from '../../../../common/basics/Tooltip';
import Dislike from '../../../../common/assets/img/icon-dislike-gray.svg';
import { respondDown } from '../../../../common/mixins';
import { LoginTypes } from '../../../../common/store/authStore/types';
import {
    BuildSignAndSubmitStatuses,
    openApp,
} from '../../../../common/services/wallet-connect.service';
import ErrorHandler from '../../../../common/helpers/error-handler';
import { useIsMounted } from '../../../../common/hooks/useIsMounted';
import {
    Amount,
    Claim,
    ClaimButton,
    DateCell,
    goToStellarExpert,
    MobileLink,
    TableHeader,
    WebLink,
    Link,
} from '../../MainPage/ManageVotesModal/ManageVotesModal';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.white};
    padding: 4.2rem 3.2rem 2rem;
    border-radius: 0.5rem;
`;

const Title = styled.span`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    margin-bottom: 1.6rem;
    color: ${COLORS.titleText};
`;

const Loader = styled.div`
    display: flex;
    padding: 5rem 0;
`;

const Description = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.descriptionText};
    opacity: 0.7;
    margin-bottom: 3.2rem;
`;

const TableRow = styled.div`
    font-size: 1.6rem;
    line-height: 5rem;
    display: flex;
    color: ${COLORS.paragraphText};

    &:not(:last-child) {
        margin-bottom: 0.6rem;
    }

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

const YourVotes = ({ votesData }) => {
    const [showTooltipId, setShowTooltipId] = useState(null);
    const [pendingId, setPendingId] = useState(null);

    const { account, isLogged } = useAuthStore();

    const [claims, setClaims] = useState(
        isLogged ? StellarService.getPairVotes(votesData, account.accountId())?.reverse() : null,
    );

    const isMounted = useIsMounted();

    useEffect(() => {
        if (!account) {
            setClaims(null);
            return;
        }
        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                setClaims(StellarService.getPairVotes(votesData, account.accountId())?.reverse());
            }
        });

        return () => unsub();
    }, [account]);

    const onSubmit = async ({ id, assetCode, assetIssuer }) => {
        if (account.authType === LoginTypes.walletConnect) {
            openApp();
        }
        try {
            setPendingId(id);
            const ops = StellarService.createClaimOperations(id);
            const asset = StellarService.createAsset(assetCode, assetIssuer);
            const tx = await StellarService.buildTx(account, ops);

            const processedTx = await StellarService.processIceTx(tx, asset);

            const result = await account.signAndSubmitTx(processedTx);

            if (isMounted.current) {
                setPendingId(null);
                setClaims(claims.filter((claim) => claim.id !== id));
            }

            if (
                (result as { status: BuildSignAndSubmitStatuses }).status ===
                BuildSignAndSubmitStatuses.pending
            ) {
                ToastService.showSuccessToast('More signatures required to complete');
                return;
            }
            ToastService.showSuccessToast('Your vote has been claimed back');
            StellarService.getClaimableBalances(account.accountId());
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            if (isMounted.current) {
                setPendingId(null);
            }
        }
    };

    if (!claims) {
        return (
            <Container>
                <Title>Your votes</Title>
                <Loader>
                    <PageLoader />
                </Loader>
            </Container>
        );
    }

    return (
        <Container>
            <Title>Your votes</Title>
            {claims.length ? (
                <>
                    <Description>
                        View your votes for a pair and claim unlocked votes back
                    </Description>
                    <TableHeader>
                        <DateCell>Vote date</DateCell>
                        <Amount>Amount</Amount>
                        <Claim>Claim back date</Claim>
                        <Link />
                    </TableHeader>
                    {claims.map((claim) => (
                        <TableRow key={claim.id}>
                            <DateCell>
                                <label>Vote date:</label>
                                {getDateString(new Date(claim.last_modified_time).getTime(), {
                                    withTime: true,
                                })}
                            </DateCell>
                            <Amount>
                                <label>Amount:</label>
                                {claim.isDownVote && (
                                    <Tooltip
                                        content={<span>Downvote</span>}
                                        position={TOOLTIP_POSITION.top}
                                        isShow={showTooltipId === claim.id}
                                    >
                                        <Dislike
                                            onMouseEnter={() => setShowTooltipId(claim.id)}
                                            onMouseLeave={() => setShowTooltipId(null)}
                                        />
                                    </Tooltip>
                                )}
                                <span>
                                    {formatBalance(claim.amount)} {claim.assetCode}
                                </span>
                            </Amount>
                            <Claim>
                                {new Date(claim.claimBackDate) > new Date() ? (
                                    <>
                                        <label>Claim back date:</label>
                                        <span>
                                            {getDateString(
                                                new Date(claim.claimBackDate).getTime(),
                                                {
                                                    withTime: true,
                                                },
                                            )}
                                        </span>
                                    </>
                                ) : (
                                    <ClaimButton
                                        isSmall
                                        onClick={() => onSubmit(claim)}
                                        disabled={Boolean(pendingId) && claim.id !== pendingId}
                                        pending={claim.id === pendingId}
                                    >
                                        Claim
                                    </ClaimButton>
                                )}
                            </Claim>
                            <Link>
                                <MobileLink
                                    onClick={() => {
                                        goToStellarExpert(claim);
                                    }}
                                >
                                    Stellar Expert
                                </MobileLink>
                                <WebLink
                                    onClick={() => {
                                        goToStellarExpert(claim);
                                    }}
                                />
                            </Link>
                        </TableRow>
                    ))}
                </>
            ) : (
                <Description>You didn't vote for this pair</Description>
            )}
        </Container>
    );
};

export default YourVotes;
