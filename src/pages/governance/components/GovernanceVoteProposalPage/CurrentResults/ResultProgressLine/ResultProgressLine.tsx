import * as React from 'react';
import styled, { css } from 'styled-components';

import { formatBalance } from 'helpers/format-number';

import { flexAllCenter } from 'web/mixins';
import { COLORS } from 'web/styles';

import Fail from 'assets/icon-fail.svg';
import Success from 'assets/icon-success.svg';

import { SimpleProposalResultsLabels } from '../../../../pages/GovernanceVoteProposalPage';

const ProgressLine = styled.div`
    width: 100%;
    margin-top: 3.2rem;
`;

const Label = styled.div`
    width: 100%;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.7rem;
`;

const IconStyles = css`
    height: 1.6rem;
    width: 1.6rem;
    margin-right: 0.8rem;
`;

const SuccessIcon = styled(Success)`
    ${IconStyles}
`;

const FailIcon = styled(Fail)`
    ${IconStyles}
`;

const Vote = styled.div`
    ${flexAllCenter};
`;

const progressLineStyles = css`
    height: 0.8rem;
    border-radius: 8px;
`;

const Outer = styled.div`
    ${progressLineStyles};
    width: 100%;
    background-color: ${COLORS.gray};
`;

const Inner = styled.div<{ $width: string; $isAgainst: boolean }>`
    ${progressLineStyles};
    width: ${({ $width }) => $width};
    background-color: ${({ $isAgainst }) => ($isAgainst ? COLORS.pinkRed : COLORS.purple)};
`;

const ResultProgressLine = ({
    result,
}: {
    result: { label: string; percentage: string; amount: string; isIceSupported: boolean };
}): JSX.Element => {
    const { label, percentage, amount, isIceSupported } = result;
    const resultDescription = `${percentage ? `${percentage} - ` : ''}${formatBalance(
        Number(amount),
    )} ${isIceSupported ? 'AQUA + ICE' : 'AQUA'}`;

    const isFor = SimpleProposalResultsLabels.votesFor === label;

    return (
        <ProgressLine>
            <Label>
                <Vote>
                    {isFor ? <SuccessIcon /> : <FailIcon />}
                    {label}
                </Vote>
                <span>{resultDescription}</span>
            </Label>
            <Outer>
                <Inner
                    $width={percentage || '0'}
                    $isAgainst={label === SimpleProposalResultsLabels.votesAgainst}
                />
            </Outer>
        </ProgressLine>
    );
};

export default ResultProgressLine;
