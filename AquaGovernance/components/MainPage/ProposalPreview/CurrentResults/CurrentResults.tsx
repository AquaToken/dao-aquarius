import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../../../common/styles';
import { flexAllCenter } from '../../../../../common/mixins';
import { ProposalSimple } from '../../../../api/types';
import { roundToPrecision } from '../../../../../common/helpers/helpers';
import { SummaryTitle, SummaryValue } from '../ProposalPreview';

const ProgressLine = styled.div`
    width: 100%;
`;

const Label = styled.div`
    width: 100%;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.2rem;
`;

const Vote = styled.div`
    ${flexAllCenter};
`;

const Outer = styled.div`
    height: 0.8rem;
    border-radius: 8px;
    width: 100%;
    background-color: ${COLORS.pinkRed};
`;

const Inner = styled.div<{ width: string }>`
    height: 0.8rem;
    border-radius: ${({ width }) => (width === '100%' ? '0.8rem' : '0.8rem 0 0 0.8rem')};
    border-right: ${({ width }) => (width === '100%' ? 'none' : `0.1rem solid ${COLORS.white}`)};
    width: ${({ width }) => width};
    background-color: ${COLORS.purple};
`;

const CurrentResults = ({ proposal }: { proposal: ProposalSimple }) => {
    const { vote_for_result: voteFor, vote_against_result: voteAgainst } = proposal;

    const voteForValue = Number(voteFor);
    const voteAgainstValue = Number(voteAgainst);
    const percentFor = (voteForValue / (voteForValue + voteAgainstValue)) * 100;

    if (Number.isNaN(percentFor)) {
        return (
            <>
                <SummaryTitle>Result:</SummaryTitle>
                <SummaryValue>No votes yet</SummaryValue>
            </>
        );
    }

    return (
        <ProgressLine>
            <Label>
                <Vote>For {roundToPrecision(percentFor, 2)}%</Vote>
                <span>Against {roundToPrecision(100 - percentFor, 2)}%</span>
            </Label>
            <Outer>
                <Inner width={`${percentFor}%`} />
            </Outer>
        </ProgressLine>
    );
};

export default CurrentResults;
