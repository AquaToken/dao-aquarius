import * as React from 'react';
import {
    ModalDescription,
    ModalProps,
    ModalTitle,
} from '../../../../common/modals/atoms/ModalAtoms';
import { StellarService, ToastService } from '../../../../common/services/globalServices';
import useAuthStore from '../../../../common/store/authStore/useAuthStore';
import Pair from '../../common/Pair';
import { PairStats } from '../../../api/types';
import styled from 'styled-components';
import { flexAllCenter, respondDown } from '../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { formatBalance, getDateString } from '../../../../common/helpers/helpers';
import Dislike from '../../../../common/assets/img/icon-dislike-gray.svg';
import Tooltip, { TOOLTIP_POSITION } from '../../../../common/basics/Tooltip';
import { useEffect, useState } from 'react';
import Button from '../../../../common/basics/Button';
import LinkIcon from '../../../../common/assets/img/icon-external-link.svg';
import ExternalLink from '../../../../common/basics/ExternalLink';
import {
    BuildSignAndSubmitStatuses,
    openApp,
} from '../../../../common/services/wallet-connect.service';
import { useIsMounted } from '../../../../common/hooks/useIsMounted';
import { LoginTypes } from '../../../../common/store/authStore/types';
import ErrorHandler from '../../../../common/helpers/error-handler';

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

const PairBlock = styled.div`
    ${flexAllCenter};
    padding: 3.4rem 0;
    border-radius: 0.5rem;
    background: ${COLORS.lightGray};
    margin-bottom: 2.3rem;
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

const TableRow = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
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

const Cell = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
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

const DateCell = styled(Cell)`
    flex: 1;
    justify-content: flex-start;
`;

const Amount = styled(Cell)`
    flex: 1;

    span {
        margin-left: 0.8rem;
    }
`;

const Claim = styled(Cell)`
    flex: 1;
`;

const Link = styled(Cell)`
    flex: 0.1;
    max-width: 3rem;

    ${respondDown(Breakpoints.md)`
        flex: 1;  
        max-width: unset;
        justify-content: center;
    `};
`;

const ClaimButton = styled(Button)`
    ${respondDown(Breakpoints.md)`
         width: 100%;
         height: 5.4rem;
    `};
`;

const WebLink = styled(LinkIcon)`
    cursor: pointer;

    ${respondDown(Breakpoints.md)`
        display: none;
    `};
`;

const MobileLink = styled(ExternalLink)`
    display: none;

    ${respondDown(Breakpoints.md)`
        display: block;    
    `};
`;

const goToStellarExpert = ({ transactions }) => {
    transactions().then((res) => {
        const hash = res?.records?.[0]?.hash;
        if (hash) {
            window.open(`https://stellar.expert/explorer/public/tx/${hash}`, '_blank');
        }
    });
};

const ManageVotesModal = ({ params, close }: ModalProps<{ pair: PairStats }>) => {
    const [showTooltipId, setShowTooltipId] = useState(null);
    const [pendingId, setPendingId] = useState(null);
    const [claims, setClaims] = useState(null);
    const { pair } = params;
    const { account } = useAuthStore();

    useEffect(() => {
        setClaims(StellarService.getPairVotes(pair, account.accountId())?.reverse());
    }, []);

    const isMounted = useIsMounted();

    if (!claims) {
        return null;
    }

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

            if (claims.length === 1) {
                close();
            }
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

    return (
        <Container>
            <ModalTitle>Manage your votes</ModalTitle>
            <ModalDescription>
                View your votes for a pair and claim unlocked votes back
            </ModalDescription>
            <PairBlock>
                <Pair
                    verticalDirections
                    base={{ code: pair.asset1_code, issuer: pair.asset1_issuer }}
                    counter={{ code: pair.asset2_code, issuer: pair.asset2_issuer }}
                />
            </PairBlock>
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
                                    {getDateString(new Date(claim.claimBackDate).getTime(), {
                                        withTime: true,
                                    })}
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
        </Container>
    );
};

export default ManageVotesModal;
