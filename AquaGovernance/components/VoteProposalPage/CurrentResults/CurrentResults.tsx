import * as React from 'react';
import styled from 'styled-components';
import ResultProgressLine from './ResultProgressLine/ResultProgressLine';
import { COLORS } from '../../../../common/styles';
import { roundToPrecision } from '../../../../common/helpers/helpers';
import { SimpleProposalResultsLabels } from '../VoteProposalPage';
import { Proposal } from '../../../api/types';

const ResultBlock = styled.div`
    width: 100%;
`;

const Title = styled.h5`
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
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
    return (
        <ResultBlock>
            <Title>Current result</Title>
            {results?.map((result) => {
                return <ResultProgressLine key={result.label} result={result} />;
            })}
        </ResultBlock>
    );
};

export default CurrentResults;
