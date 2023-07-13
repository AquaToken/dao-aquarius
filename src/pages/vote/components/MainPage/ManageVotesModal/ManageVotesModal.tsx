import * as React from 'react';
import {
    ModalDescription,
    ModalProps,
    ModalTitle,
} from '../../../../../common/modals/atoms/ModalAtoms';
import { StellarService, ToastService } from '../../../../../common/services/globalServices';
import useAuthStore from '../../../../../store/authStore/useAuthStore';
import Pair from '../../common/Pair';
import { PairStats } from '../../../api/types';
import styled from 'styled-components';
import { flexAllCenter, respondDown } from '../../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../../common/styles';
import { formatBalance, getDateString } from '../../../../../common/helpers/helpers';
import Dislike from '../../../../../common/assets/img/icon-dislike-gray.svg';
import Tooltip, { TOOLTIP_POSITION } from '../../../../../common/basics/Tooltip';
import { useEffect, useState } from 'react';
import Button from '../../../../../common/basics/Button';
import LinkIcon from '../../../../../common/assets/img/icon-external-link.svg';
import ExternalLink from '../../../../../common/basics/ExternalLink';
import {
    BuildSignAndSubmitStatuses,
    openApp,
} from '../../../../../common/services/wallet-connect.service';
import { useIsMounted } from '../../../../../common/hooks/useIsMounted';
import { LoginTypes } from '../../../../../store/authStore/types';
import ErrorHandler from '../../../../../common/helpers/error-handler';
import Table, { CellAlign } from '../../../../../common/basics/Table';

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

const Amount = styled.span`
    text-align: right;
`;

const TooltipStyled = styled(Tooltip)`
    margin-left: 0.8rem;
`;

export const ClaimButton = styled(Button)`
    ${respondDown(Breakpoints.md)`
         width: 100%;
         height: 5.4rem;
    `};
`;

export const WebLink = styled(LinkIcon)`
    cursor: pointer;

    ${respondDown(Breakpoints.md)`
        display: none;
    `};
`;

export const MobileLink = styled(ExternalLink)`
    display: none;

    ${respondDown(Breakpoints.md)`
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
    `};
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

const TooltipInner = styled.span`
    font-size: 1.4rem;
    line-height: 2rem;
    margin-left: 0 !important;
`;

const ManageVotesModal = ({ params, close }: ModalProps<{ pair: PairStats }>) => {
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
            <Table
                head={[
                    { children: 'Vote date' },
                    { children: 'Amount', align: CellAlign.Right },
                    { children: 'Claim back date', align: CellAlign.Right },
                    { children: '', align: CellAlign.Center, flexSize: 0.1 },
                ]}
                body={claims.map((claim) => ({
                    key: claim.id,
                    isNarrow: true,
                    mobileBackground: COLORS.lightGray,
                    mobileFontSize: '1.4rem',
                    rowItems: [
                        {
                            children: getDateString(new Date(claim.last_modified_time).getTime(), {
                                withTime: true,
                            }),
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
                            children:
                                new Date(claim.claimBackDate) > new Date() ? (
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
                                ),
                            align: CellAlign.Right,
                        },
                        {
                            children: (
                                <>
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
                                </>
                            ),
                            align: CellAlign.Right,
                            flexSize: 0.1,
                        },
                    ],
                }))}
            />
        </Container>
    );
};

export default ManageVotesModal;
