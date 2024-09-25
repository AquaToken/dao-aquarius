import * as React from 'react';
import styled from 'styled-components';

import Fail from 'assets/icon-fail.svg';
import Info from 'assets/icon-info.svg';

import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import ResultProgressLine from './ResultProgressLine/ResultProgressLine';

import { roundToPrecision } from '../../../../../common/helpers/helpers';
import { flexAllCenter, flexRowSpaceBetween, respondDown } from '../../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../../common/styles';
import { Proposal } from '../../../api/types';
import { SimpleProposalResultsLabels } from '../../../pages/GovernanceVoteProposalPage';

const ResultBlock = styled.div`
    width: 100%;
`;

const Header = styled.div`
    ${flexRowSpaceBetween};
    color: ${COLORS.grayText};
`;

const Title = styled.h5`
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
`;

const Quorum = styled.div`
    height: 3.5rem;
    margin-top: 3.2rem;
    font-size: 1.4rem;
    line-height: 2rem;
    ${flexRowSpaceBetween};
`;

const Label = styled.div`
    color: ${COLORS.grayText};
`;

const FailIcon = styled(Fail)`
    height: 1.4rem;
    width: 1.4rem;
    margin-right: 0.6rem;

    rect {
        fill: ${COLORS.white};
    }
    path {
        stroke: ${COLORS.pinkRed};
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
    background-color: ${COLORS.pinkRed};
    color: ${COLORS.white};
    font-weight: 400;
    line-height: 2.5rem;
    margin-left: 0.8rem;

    ${respondDown(Breakpoints.xs)`
        display: none;
    `}
`;

const QuorumResult = styled.div<{ isApproved: boolean }>`
    margin: 0 0.8rem 0 auto;
    color: ${({ isApproved }) => (isApproved ? COLORS.titleText : COLORS.pinkRed)};
`;

const getResultsData = (proposal: Proposal) => {
    const {
        is_simple_proposal: isSimple,
        vote_for_result: voteFor,
        vote_against_result: voteAgainst,
        ice_circulating_supply: iceCirculatingSupply,
    } = proposal;

    if (isSimple) {
        const voteForValue = Number(voteFor);
        const voteAgainstValue = Number(voteAgainst);
        const percentFor = (voteForValue / (voteForValue + voteAgainstValue)) * 100;
        const roundedPercent = roundToPrecision(percentFor, 2);
        const isIceSupported = Number(iceCirculatingSupply) !== 0;

        return [
            {
                label: SimpleProposalResultsLabels.votesFor,
                percentage: Number.isNaN(percentFor) ? '' : `${roundedPercent}%`,
                amount: voteFor,
                isIceSupported,
            },
            {
                label: SimpleProposalResultsLabels.votesAgainst,
                percentage: Number.isNaN(percentFor)
                    ? ''
                    : `${roundToPrecision(100 - Number(roundedPercent), 2)}%`,
                amount: voteAgainst,
                isIceSupported,
            },
        ];
    }
    return null;
};

const CurrentResults = ({ proposal }: { proposal: Proposal }): JSX.Element => {
    const results = getResultsData(proposal);
    const isEnd = new Date() >= new Date(proposal.end_at);

    const votesSum = Number(proposal.vote_against_result) + Number(proposal.vote_for_result);
    const percentVote =
        (votesSum /
            (Number(proposal.aqua_circulating_supply) + Number(proposal.ice_circulating_supply))) *
        100;
    const isApproved = percentVote > proposal.percent_for_quorum;

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
                <QuorumResult isApproved={isApproved}>
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
