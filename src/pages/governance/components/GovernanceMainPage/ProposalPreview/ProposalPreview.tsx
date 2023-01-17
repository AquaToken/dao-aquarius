import * as React from 'react';
import { useEffect, useState } from 'react';
import { ProposalSimple } from '../../../api/types';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../../common/styles';
import ProposalStatus, { PROPOSAL_STATUS } from '../ProposalStatus/ProposalStatus';
import {
    formatBalance,
    getDateString,
    roundToPrecision,
} from '../../../../../common/helpers/helpers';
import IconFail from '../../../../../common/assets/img/icon-fail.svg';
import IconSuccess from '../../../../../common/assets/img/icon-success.svg';
import Aqua from '../../../../../common/assets/img/aqua-logo-small.svg';
import Ice from '../../../../../common/assets/img/ice-logo.svg';
import CurrentResults from './CurrentResults/CurrentResults';
import { Link } from 'react-router-dom';
import { flexAllCenter, respondDown } from '../../../../../common/mixins';
import useAuthStore from '../../../../../store/authStore/useAuthStore';
import { StellarService, ToastService } from '../../../../../common/services/globalServices';
import {
    AQUA_CODE,
    AQUA_ISSUER,
    GOV_ICE_CODE,
    ICE_ISSUER,
    StellarEvents,
} from '../../../../../common/services/stellar.service';
import DotsLoader from '../../../../../common/basics/DotsLoader';
import Button from '../../../../../common/basics/Button';
import { LoginTypes } from '../../../../../store/authStore/types';
import {
    BuildSignAndSubmitStatuses,
    openApp,
} from '../../../../../common/services/wallet-connect.service';
import ErrorHandler from '../../../../../common/helpers/error-handler';
import { GovernanceRoutes } from '../../../../../routes';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    border: 0.1rem solid ${COLORS.border};
    box-sizing: border-box;
    border-radius: 5px;
    padding: 3.4rem 3.2rem 3.2rem;
    background-color: ${COLORS.white};

    &:hover {
        background-color: ${COLORS.lightGray};
    }

    &:not(:last-child) {
        margin-bottom: 4rem;
    }

    a {
        text-decoration: none;
    }
`;

const Header = styled.div`
    margin-bottom: 1.6rem;
    display: grid;
    grid-template-areas: 'id title status';
    grid-template-columns: min-content auto 1fr;
    align-items: center;
    grid-column-gap: 1.5rem;

    ${respondDown(Breakpoints.lg)`
        grid-template-areas: 'id status' 'title title';
        grid-template-columns: min-content 1fr;
        grid-row-gap: 1.5rem;
    `}
`;

const Title = styled.span`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
    margin-right: auto;
    grid-area: title;
    align-items: center;
`;

const Id = styled.div`
    padding: 0.2rem 0.4rem;
    ${flexAllCenter};
    background: ${COLORS.lightGray};
    color: ${COLORS.grayText};
    font-size: 1.4rem;
    font-weight: 400;
    line-height: 2rem;
    grid-area: id;
    height: min-content;
    border-radius: 0.5rem;
`;

const ProposalStatusStyled = styled(ProposalStatus)`
    margin-left: auto;
    grid-area: status;
`;

const Text = styled.div`
    display: -webkit-box;
    max-height: 6rem;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 2.4rem;
    font-weight: 400;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};

    ${respondDown(Breakpoints.md)`
        -webkit-line-clamp: 5;
        max-height: 10rem;
    `}
`;

const SummaryBlock = styled.div`
    display: flex;
    justify-content: space-between;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
    `}
`;

export const SummaryColumn = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    max-width: 30%;

    ${respondDown(Breakpoints.md)`
         max-width: unset;
         margin-bottom: 1.6rem;
    `}
`;

export const SummaryTitle = styled.div`
    font-weight: 400;
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.grayText};
    margin-bottom: 0.8rem;
`;

export const SummaryValue = styled.div`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 2.4rem;
    color: ${COLORS.paragraphText};
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
`;

const IconNotEnoughVotes = styled(IconFail)`
    height: 1.6rem;
    width: 1.6rem;
    margin-right: 0.5rem;
    rect {
        fill: ${COLORS.gray};
    }

    path {
        stroke: ${COLORS.placeholder};
    }
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

const ActiveParticipationRate = styled.div`
    margin-top: 2.4rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.8rem 2.4rem;
    background: ${COLORS.lightGray};
    border-radius: 0.5rem;
    color: ${COLORS.grayText};

    div {
        display: flex;
        align-items: center;
    }
`;

const Red = styled.span`
    color: ${COLORS.pinkRed};
`;

const TableRow = styled.div`
    display: flex;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};

    &:not(:last-child) {
        margin-bottom: 2.2rem;
    }

    ${respondDown(Breakpoints.md)`
         flex-direction: column;
         background: ${COLORS.lightGray};
         padding: 1.2rem;
         font-size: 1.4rem;
    `}
`;

const TableHead = styled(TableRow)`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    margin-bottom: 2.7rem;

    ${respondDown(Breakpoints.md)`
         display: none;
    `}
`;

const TableCell = styled.div`
    display: flex;
    align-items: center;
    flex: 1;

    span {
        display: flex;
        align-items: center;
    }

    label {
        display: none;
    }

    ${respondDown(Breakpoints.md)`
        justify-content: space-between;
        
        &:not(:last-child) {
            margin-bottom: 1rem;
        }
        
        label {
            display: inline;
        }
    `}
`;

const TableCellRight = styled(TableCell)`
    justify-content: flex-end;

    ${respondDown(Breakpoints.md)`
         justify-content: space-between;
   `}
`;

const getStatus = (proposal: ProposalSimple) => {
    switch (proposal.proposal_status) {
        case 'DISCUSSION':
            return PROPOSAL_STATUS.DISCUSSION;
        case 'VOTING':
            return PROPOSAL_STATUS.ACTIVE;
        case 'VOTED':
            return PROPOSAL_STATUS.CLOSED;
    }
};

const ProposalPreview = ({
    proposal,
    withMyVotes,
}: {
    proposal: ProposalSimple;
    withMyVotes: boolean;
}) => {
    const [claimUpdateId, setClaimUpdateId] = useState(0);
    const [claims, setClaims] = useState(null);
    const [pendingId, setPendingId] = useState(null);

    const { account } = useAuthStore();

    useEffect(() => {
        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                setClaimUpdateId((prevState) => prevState + 1);
            }
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        if (!account || !withMyVotes) {
            setClaimUpdateId(0);
            setClaims(null);
            return;
        }
        setClaims(StellarService.getVotesForProposal(proposal, account.accountId()));
    }, [claimUpdateId, account, withMyVotes]);

    const status = getStatus(proposal);

    const getVotedProposalResult = () => {
        const {
            vote_for_result: voteFor,
            vote_against_result: voteAgainst,
            aqua_circulating_supply: aquaCirculatingSupply,
            ice_circulating_supply: iceCirculatingSupply,
            percent_for_quorum: percentForQuorum,
        } = proposal;

        const voteForValue = Number(voteFor);
        const voteAgainstValue = Number(voteAgainst);

        const isVoteForWin = voteForValue > voteAgainstValue;

        const percentFor = (voteForValue / (voteForValue + voteAgainstValue)) * 100;

        const percentAgainst = (voteAgainstValue / (voteForValue + voteAgainstValue)) * 100;

        if (Number.isNaN(percentFor)) {
            return <span>No votes yet</span>;
        }

        const rate =
            ((voteForValue + voteAgainstValue) /
                (Number(aquaCirculatingSupply) + Number(iceCirculatingSupply))) *
            100;

        const isCancelled = rate < percentForQuorum;

        if (isCancelled) {
            return (
                <>
                    <IconNotEnoughVotes />
                    <span>Not enough votes</span>
                </>
            );
        }

        const roundedPercentFor = roundToPrecision(percentFor, 2);
        const roundedPercentAgainst = roundToPrecision(percentAgainst, 2);

        return (
            <>
                {isVoteForWin ? <IconFor /> : <IconAgainst />}
                {isVoteForWin ? 'For (' : 'Against ('}
                {isVoteForWin ? roundedPercentFor : roundedPercentAgainst}% votes)
            </>
        );
    };

    const getParticipationRate = () => {
        const {
            vote_for_result: voteFor,
            vote_against_result: voteAgainst,
            aqua_circulating_supply: aquaCirculatingSupply,
            ice_circulating_supply: iceCirculatingSupply,
        } = proposal;

        const voteForValue = Number(voteFor);
        const voteAgainstValue = Number(voteAgainst);

        const rate =
            ((voteForValue + voteAgainstValue) /
                (Number(aquaCirculatingSupply) + Number(iceCirculatingSupply))) *
            100;

        const roundedRate = roundToPrecision(rate, 2);

        return `${roundedRate}% (${formatBalance(voteForValue + voteAgainstValue, true)} ${
            Number(iceCirculatingSupply) === 0 ? 'AQUA' : 'AQUA + ICE'
        })`;
    };

    const getActiveParticipationRate = () => {
        const {
            vote_for_result: voteFor,
            vote_against_result: voteAgainst,
            aqua_circulating_supply: aquaCirculatingSupply,
            ice_circulating_supply: iceCirculatingSupply,
            percent_for_quorum: percentForQuorum,
        } = proposal;

        const voteForValue = Number(voteFor);
        const voteAgainstValue = Number(voteAgainst);

        const rate =
            ((voteForValue + voteAgainstValue) /
                (Number(aquaCirculatingSupply) + Number(iceCirculatingSupply))) *
            100;

        if (rate >= percentForQuorum || rate === 0) {
            return null;
        }

        const roundedRate = roundToPrecision(rate, 2);

        return (
            <ActiveParticipationRate>
                <span>
                    Participation rate: <Red>{roundedRate}%</Red> ({'>'}
                    {percentForQuorum}% needed)
                </span>
                <div>
                    <IconAgainst />
                    Not enough votes
                </div>
            </ActiveParticipationRate>
        );
    };

    const claimBack = async (event, id, isAqua) => {
        event.stopPropagation();
        event.preventDefault();

        if (account.authType === LoginTypes.walletConnect) {
            openApp();
        }

        try {
            setPendingId(id);
            const ops = StellarService.createClaimOperations(id);
            const asset = StellarService.createAsset(
                isAqua ? AQUA_CODE : GOV_ICE_CODE,
                isAqua ? AQUA_ISSUER : ICE_ISSUER,
            );
            const tx = await StellarService.buildTx(account, ops);

            const processedTx = await StellarService.processIceTx(tx, asset);

            const result = await account.signAndSubmitTx(processedTx);

            setPendingId(null);

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
            setPendingId(null);
        }
    };

    const getActionBlock = (balanceId, isAqua) => {
        if (!claims) {
            return <DotsLoader />;
        }

        const claim = claims.find(({ id }) => id === balanceId);

        if (!claim) {
            return 'Claimed';
        }

        const claimBackTimestamp = new Date(claim.claimBackDate).getTime();

        if (claimBackTimestamp > Date.now()) {
            return getDateString(claimBackTimestamp, { withTime: true });
        }

        return (
            <Button
                isSmall
                pending={balanceId === pendingId}
                disabled={Boolean(pendingId) && balanceId !== pendingId}
                onClick={(event) => claimBack(event, balanceId, isAqua)}
            >
                claim
            </Button>
        );
    };

    return (
        <Container>
            <Link to={`${GovernanceRoutes.proposal}/${proposal.id}/`}>
                <Header>
                    <Id>#{proposal.id}</Id>
                    <Title>{proposal.title}</Title>
                    <ProposalStatusStyled status={status} />
                </Header>
                <Text>{proposal.text.replace(/<[^>]*>?/gm, ' ')}</Text>
                <SummaryBlock>
                    {proposal.proposal_status === 'DISCUSSION' && !withMyVotes && (
                        <>
                            <SummaryColumn>
                                <SummaryTitle>Discussion created:</SummaryTitle>
                                <SummaryValue>
                                    {getDateString(new Date(proposal.created_at).getTime(), {
                                        withTime: true,
                                    })}
                                </SummaryValue>
                            </SummaryColumn>
                            <SummaryColumn>
                                <SummaryTitle>Latest edit:</SummaryTitle>
                                <SummaryValue>
                                    {getDateString(new Date(proposal.last_updated_at).getTime(), {
                                        withTime: true,
                                    })}
                                </SummaryValue>
                            </SummaryColumn>
                            <SummaryColumn>
                                <SummaryTitle>Discussion channel:</SummaryTitle>
                                <SummaryValue>{proposal.discord_channel_name}</SummaryValue>
                            </SummaryColumn>
                        </>
                    )}
                    {proposal.proposal_status === 'VOTED' && !withMyVotes && (
                        <>
                            <SummaryColumn>
                                <SummaryTitle>Voting end:</SummaryTitle>
                                <SummaryValue>
                                    {getDateString(new Date(proposal.end_at).getTime(), {
                                        withTime: true,
                                    })}
                                </SummaryValue>
                            </SummaryColumn>
                            <SummaryColumn>
                                <SummaryTitle>Result:</SummaryTitle>
                                <SummaryValue>{getVotedProposalResult()}</SummaryValue>
                            </SummaryColumn>
                            <SummaryColumn>
                                <SummaryTitle>Participation rate:</SummaryTitle>
                                <SummaryValue>{getParticipationRate()}</SummaryValue>
                            </SummaryColumn>
                        </>
                    )}
                    {proposal.proposal_status === 'VOTING' && !withMyVotes && (
                        <>
                            <SummaryColumn>
                                <SummaryTitle>Voting ends:</SummaryTitle>
                                <SummaryValue>
                                    {getDateString(new Date(proposal.end_at).getTime(), {
                                        withTime: true,
                                    })}
                                </SummaryValue>
                            </SummaryColumn>
                            <SummaryColumn>
                                <SummaryTitle>Discussion channel:</SummaryTitle>
                                <SummaryValue>{proposal.discord_channel_name}</SummaryValue>
                            </SummaryColumn>
                            <SummaryColumn>
                                <CurrentResults proposal={proposal} />
                            </SummaryColumn>
                        </>
                    )}
                </SummaryBlock>
                {proposal.proposal_status === 'VOTING' &&
                    !withMyVotes &&
                    getActiveParticipationRate()}
                {withMyVotes && (
                    <>
                        <TableHead>
                            <TableCell>Time</TableCell>
                            <TableCell>Vote</TableCell>
                            <TableCellRight>Voted</TableCellRight>
                            <TableCellRight>Claim back date</TableCellRight>
                        </TableHead>
                        {proposal.logvote_set.map((log) => (
                            <TableRow key={log.claimable_balance_id}>
                                <TableCell>
                                    <label>Time:</label>
                                    {getDateString(new Date(log.created_at).getTime(), {
                                        withTime: true,
                                        withoutYear: true,
                                    })}
                                </TableCell>
                                <TableCell>
                                    <label>Vote:</label>
                                    <span>
                                        {log.vote_choice === 'vote_for' ? (
                                            <IconFor />
                                        ) : (
                                            <IconAgainst />
                                        )}
                                        {log.vote_choice === 'vote_for'
                                            ? 'Vote For'
                                            : 'Vote Against'}
                                    </span>
                                </TableCell>
                                <TableCellRight>
                                    <label>Voted:</label>
                                    <span>
                                        {formatBalance(Number(log.amount))}
                                        {log.asset_code === 'AQUA' ? <AquaLogo /> : <IceLogo />}
                                    </span>
                                </TableCellRight>
                                <TableCellRight>
                                    <label>Claim back date:</label>
                                    {getActionBlock(
                                        log.claimable_balance_id,
                                        log.asset_code === 'AQUA',
                                    )}
                                </TableCellRight>
                            </TableRow>
                        ))}
                    </>
                )}
            </Link>
        </Container>
    );
};

export default ProposalPreview;
