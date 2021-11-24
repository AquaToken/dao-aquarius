import * as React from 'react';
import styled from 'styled-components';
import ResultProgressLine from './ResultProgressLine/ResultProgressLine';
import { COLORS } from '../../../../common/styles';
import { roundToPrecision } from '../../../../common/helpers/helpers';
import { SimpleProposalResultsLabels } from '../VoteProposalPage';
import { Proposal } from '../../../api/types';
import { flexAllCenter, flexRowSpaceBetween } from '../../../../common/mixins';
import Fail from '../../../../common/assets/img/icon-fail.svg';
import Info from '../../../../common/assets/img/icon-info.svg';
import Tooltip, { TOOLTIP_POSITION } from '../../../../common/basics/Tooltip';
import { useState } from 'react';
import { MINIMUM_APPROVAL_PERCENT } from '../../MainPage/MainPage';

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
    const [showTooltip, setShowTooltip] = useState(false);
    const results = getResultsData(proposal);
    const isEnd = new Date() >= new Date(proposal.end_at);

    const votesSum = Number(proposal.vote_against_result) + Number(proposal.vote_for_result);
    const percentVote = (votesSum / Number(proposal.aqua_circulating_supply)) * 100;
    const isApproved = percentVote > MINIMUM_APPROVAL_PERCENT;

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
                <QuorumResult isApproved={isApproved}>
                    {roundToPrecision(percentVote, 2)}%
                </QuorumResult>
                <Label>(&gt;5% needed)</Label>
                {!isApproved && (
                    <StatusTag>
                        <FailIcon /> Not enough votes
                    </StatusTag>
                )}
                <InfoIconWrap
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <Tooltip
                        content={
                            <TooltipInner>
                                Minimum Approval is the percentage of the total AQUA token supply
                                that is required to vote on a proposal before it can be approved.{' '}
                            </TooltipInner>
                        }
                        position={TOOLTIP_POSITION.bottom}
                        isShow={showTooltip}
                    >
                        <Info />
                    </Tooltip>
                </InfoIconWrap>
            </Quorum>
        </ResultBlock>
    );
};

export default CurrentResults;
