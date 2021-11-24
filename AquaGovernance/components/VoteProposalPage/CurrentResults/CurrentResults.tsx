import * as React from 'react';
import styled from 'styled-components';
import ResultProgressLine from './ResultProgressLine/ResultProgressLine';
import { COLORS } from '../../../../common/styles';
import { roundToPrecision } from '../../../../common/helpers/helpers';
import { SimpleProposalResultsLabels } from '../VoteProposalPage';
import { Proposal } from '../../../api/types';
import { flexAllCenter, flexRowSpaceBetween } from '../../../../common/mixins';
import Fail from '../../../../common/assets/img/icon-fail.svg';

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
    } = proposal;

    if (isSimple) {
        const voteForValue = Number(voteFor);
        const voteAgainstValue = Number(voteAgainst);
        const percentFor = (voteForValue / (voteForValue + voteAgainstValue)) * 100;
        const roundedPercent = roundToPrecision(percentFor, 2);

        return [
            {
                label: SimpleProposalResultsLabels.votesFor,
                percentage: Number.isNaN(percentFor) ? '' : `${roundedPercent}%`,
                amount: voteFor,
            },
            {
                label: SimpleProposalResultsLabels.votesAgainst,
                percentage: Number.isNaN(percentFor)
                    ? ''
                    : `${roundToPrecision(100 - Number(roundedPercent), 2)}%`,
                amount: voteAgainst,
            },
        ];
    }
    return null;
};

const CurrentResults = ({ proposal }: { proposal: Proposal }): JSX.Element => {
    const results = getResultsData(proposal);
    const isEnd = new Date() >= new Date(proposal.end_at);
    const percentVote = 4;
    const isApproved = percentVote > 5;

    return (
        <ResultBlock>
            <Header>
                <Title>{isEnd ? 'Final result' : 'Current result'}</Title>
                {!isEnd && <span>Updating every 5 min</span>}
            </Header>

            {results?.map((result) => {
                return <ResultProgressLine key={result.label} result={result} />;
            })}
            <Quorum>
                <Label>Minimum Approval:</Label>
                <QuorumResult isApproved={isApproved}>{percentVote}%</QuorumResult>
                <Label>(&gt;5% needed)</Label>
                {!isApproved && (
                    <StatusTag>
                        <FailIcon /> Not enough votes
                    </StatusTag>
                )}
            </Quorum>
        </ResultBlock>
    );
};

export default CurrentResults;
