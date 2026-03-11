import * as React from 'react';
import { ReactElement } from 'react';
import styled, { css } from 'styled-components';

import { VoteOptions } from 'constants/dao';

import { formatBalance } from 'helpers/format-number';

import { VoteIcon } from 'basics/icons';

import { flexAllCenter } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

const ProgressLine = styled.div`
    width: 100%;
    margin-top: 3.2rem;
`;

const Label = styled.div`
    width: 100%;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.textGray};
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.7rem;
`;

const Vote = styled.div`
    ${flexAllCenter};
    gap: 0.5rem;
`;

const progressLineStyles = css`
    height: 0.8rem;
    border-radius: 8px;
`;

const Outer = styled.div`
    ${progressLineStyles};
    width: 100%;
    background-color: ${COLORS.gray100};
`;

const Inner = styled.div<{ $width: string; $isAgainst: boolean; $isAbstain: boolean }>`
    ${progressLineStyles};
    width: ${({ $width }) => $width};
    background-color: ${({ $isAgainst, $isAbstain }) =>
        $isAgainst ? COLORS.red500 : $isAbstain ? COLORS.gray200 : COLORS.purple500};
`;

const ResultProgressLine = ({
    result,
}: {
    result: {
        percentage: string;
        amount: string;
        votingTokens: string;
        vote: VoteOptions;
    };
}): ReactElement => {
    const { percentage, amount, votingTokens, vote } = result;
    const resultDescription = `${percentage ? `${percentage} - ` : ''}${formatBalance(
        Number(amount),
    )} ${votingTokens}`;

    return (
        <ProgressLine>
            <Label>
                <Vote>
                    <VoteIcon option={vote} />
                    {vote}
                </Vote>
                <span>{resultDescription}</span>
            </Label>
            <Outer>
                <Inner
                    $width={percentage || '0'}
                    $isAgainst={vote === VoteOptions.against}
                    $isAbstain={vote === VoteOptions.abstain}
                />
            </Outer>
        </ProgressLine>
    );
};

export default ResultProgressLine;
