import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { getDateString } from 'helpers/date';
import { formatBalance, roundToPrecision } from 'helpers/format-number';

import { flexAllCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import IconFail from 'assets/icon-fail.svg';
import IconSuccess from 'assets/icon-success.svg';

import CurrentResults from './CurrentResults/CurrentResults';
import YourVotes from './YourVotes/YourVotes';

import { GovernanceRoutes } from '../../../../../routes';
import { ProposalSimple } from '../../../api/types';
import ProposalStatus, { PROPOSAL_STATUS } from '../ProposalStatus/ProposalStatus';

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
    max-width: 33%;

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
                                <SummaryValue>Proposal #{proposal.id}</SummaryValue>
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
                                <SummaryValue>Proposal #{proposal.id}</SummaryValue>
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

                {withMyVotes && <YourVotes proposal={proposal} />}
            </Link>
        </Container>
    );
};

export default ProposalPreview;
