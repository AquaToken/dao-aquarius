import * as React from 'react';
import { ReactElement } from 'react';
import styled from 'styled-components';

import { getQuorumPercentage, isQuorumReached } from 'helpers/dao';
import { roundToPrecision } from 'helpers/format-number';

import { Proposal } from 'types/governance';

import Fail from 'assets/icons/status/fail-red.svg';
import Info from 'assets/icons/status/icon-info-16.svg';

import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { flexAllCenter, flexRowSpaceBetween, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import ResultProgressLine from './ResultProgressLine/ResultProgressLine';

import { SimpleProposalResultsLabels } from '../../../pages/GovernanceVoteProposalPage';

const ResultBlock = styled.div`
    width: 100%;
`;

const Header = styled.div`
    ${flexRowSpaceBetween};
    color: ${COLORS.textGray};
`;

const Title = styled.h5`
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.textPrimary};
`;

const Quorum = styled.div`
    height: 3.5rem;
    margin-top: 3.2rem;
    font-size: 1.4rem;
    line-height: 2rem;
    ${flexRowSpaceBetween};
`;

const Label = styled.div`
    color: ${COLORS.textGray};
`;

const FailIcon = styled(Fail)`
    height: 1.4rem;
    width: 1.4rem;
    margin-right: 0.6rem;

    rect {
        fill: ${COLORS.white};
    }
    path {
        stroke: ${COLORS.red500};
    }
`;

const InfoIconWrap = styled.div`
    margin-left: 1.3rem;
    height: 1.6rem;
    cursor: help;
`;

const TooltipInner = styled.div`
    width: 28.8rem;
    white-space: pre-wrap;
`;

const StatusTag = styled.div`
    height: 3rem;
    padding: 0.25rem 1rem;
    ${flexAllCenter};
    width: min-content;
    white-space: nowrap;
    border-radius: 1.5rem;
    background-color: ${COLORS.red500};
    color: ${COLORS.white};
    font-weight: 400;
    line-height: 2.5rem;
    margin-left: 0.8rem;

    ${respondDown(Breakpoints.xs)`
        display: none;
    `}
`;

const QuorumResult = styled.div<{ $isApproved: boolean }>`
    margin: 0 0.8rem 0 auto;
    color: ${({ $isApproved }) => ($isApproved ? COLORS.textPrimary : COLORS.red500)};
`;

const getResultsData = (proposal: Proposal) => {
    const {
        is_simple_proposal: isSimple,
        vote_for_result: voteFor,
        vote_against_result: voteAgainst,
        vote_abstain_result: voteAbstain,
        ice_circulating_supply: iceCirculatingSupply,
    } = proposal;

    if (isSimple) {
        const voteForValue = Number(voteFor);
        const voteAgainstValue = Number(voteAgainst);
        const voteAbstainValue = Number(voteAbstain);

        const percentFor =
            (voteForValue / (voteForValue + voteAgainstValue + voteAbstainValue)) * 100;

        const percentAgainst =
            (voteAgainstValue / (voteForValue + voteAgainstValue + voteAbstainValue)) * 100;

        const roundedPercentFor = roundToPrecision(percentFor, 2);
        const roundedPercentAgainst = roundToPrecision(percentAgainst, 2);

        const isIceSupported = Number(iceCirculatingSupply) !== 0;

        return [
            {
                label: SimpleProposalResultsLabels.votesFor,
                percentage: Number.isNaN(percentFor) ? '' : `${roundedPercentFor}%`,
                amount: voteFor,
                isIceSupported,
            },
            {
                label: SimpleProposalResultsLabels.votesAgainst,
                percentage: Number.isNaN(percentFor)
                    ? ''
                    : `${roundToPrecision(roundedPercentAgainst, 2)}%`,
                amount: voteAgainst,
                isIceSupported,
            },
        ];
    }
    return null;
};

const CurrentResults = ({ proposal }: { proposal: Proposal }): ReactElement => {
    const results = getResultsData(proposal);
    const isEnd = new Date() >= new Date(proposal.end_at);

    const percentVote = getQuorumPercentage(proposal);
    const isApproved = isQuorumReached(proposal);

    return (
        <ResultBlock>
            <Header>
                <Title>{isEnd ? 'Final result' : 'Current result'}</Title>
                {!isEnd && <span>Updating every 5 min</span>}
            </Header>

            {results?.map(result => (
                <ResultProgressLine key={result.label} result={result} />
            ))}
            <Quorum>
                <Label>Participation Rate:</Label>
                <QuorumResult $isApproved={isApproved}>
                    {roundToPrecision(percentVote, 2)}%
                </QuorumResult>
                <Label>(&gt;{proposal.percent_for_quorum}% needed)</Label>
                {!isApproved && (
                    <StatusTag>
                        <FailIcon /> Not enough votes
                    </StatusTag>
                )}
                <InfoIconWrap>
                    <Tooltip
                        content={
                            <TooltipInner>
                                Participation rate is the percentage of the circulating AQUA and ICE
                                supply that has taken part in the voting. Participation rate is
                                required to be above {proposal.percent_for_quorum}% for the proposal
                                to be approved.
                            </TooltipInner>
                        }
                        position={
                            +window.innerWidth > 992
                                ? TOOLTIP_POSITION.bottom
                                : TOOLTIP_POSITION.left
                        }
                        showOnHover
                    >
                        <Info />
                    </Tooltip>
                </InfoIconWrap>
            </Quorum>
        </ResultBlock>
    );
};

export default CurrentResults;
