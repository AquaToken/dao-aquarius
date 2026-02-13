import * as React from 'react';
import styled from 'styled-components';

import { roundToPrecision } from 'helpers/format-number';

import { ProposalSimple } from 'types/governance';

import { flexAllCenter } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

import { SummaryTitle, SummaryValue } from '../ProposalPreview';

const ProgressLine = styled.div`
    width: 100%;
`;

const Label = styled.div`
    width: 100%;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.textGray};
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.2rem;
`;

const Vote = styled.div`
    ${flexAllCenter};
`;

const Outer = styled.div`
    position: relative;
    height: 0.8rem;
    border-radius: 8px;
    width: 100%;
    background-color: ${COLORS.red500};
`;

const Inner = styled.div<{ $width: string; $color: string }>`
    position: absolute;
    height: 0.8rem;
    border-radius: ${({ $width }) => ($width === '100%' ? '0.8rem' : '0.8rem 0 0 0.8rem')};
    border-right: ${({ $width }) => ($width === '100%' ? 'none' : `0.1rem solid ${COLORS.white}`)};
    width: ${({ $width }) => $width};
    background-color: ${({ $color }) => $color};
`;

const CurrentResults = ({ proposal }: { proposal: ProposalSimple }) => {
    const {
        vote_for_result: voteFor,
        vote_against_result: voteAgainst,
        vote_abstain_result: voteAbstain,
    } = proposal;

    const voteForValue = Number(voteFor);
    const voteAgainstValue = Number(voteAgainst);
    const voteAbstainValue = Number(voteAbstain);

    const percentAgainst =
        (voteAgainstValue / (voteForValue + voteAgainstValue + voteAbstainValue)) * 100;
    const percentFor = (voteForValue / (voteForValue + voteAgainstValue + voteAbstainValue)) * 100;
    const percentAbstain =
        (voteAbstainValue / (voteForValue + voteAgainstValue + voteAbstainValue)) * 100;

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
                <span>Against {roundToPrecision(percentAgainst, 2)}%</span>
            </Label>
            <Outer>
                <Inner $width={`${percentFor + percentAbstain}%`} $color={COLORS.gray100} />
                <Inner $width={`${percentFor}%`} $color={COLORS.purple500} />
            </Outer>
        </ProgressLine>
    );
};

export default CurrentResults;
