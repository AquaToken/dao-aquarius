import * as React from 'react';
import styled, { css } from 'styled-components';
import { COLORS } from '../../../../../common/styles';

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

const progressLineStyles = css`
    height: 0.8rem;
    border-radius: 8px;
`;

const Outer = styled.div`
    ${progressLineStyles};
    width: 100%;
    background-color: ${COLORS.gray};
`;

const Inner = styled.div<{ width: string; isAgainst: boolean }>`
    ${progressLineStyles};
    width: ${({ width }) => width};
    background-color: ${({ isAgainst }) => (isAgainst ? COLORS.pinkRed : COLORS.purple)};
`;

const ResultProgressLine = ({
    result,
}: {
    result: { label: string; percentage: string; amount: string };
}): JSX.Element => {
    const { label, percentage, amount } = result;
    return (
        <ProgressLine>
            <Label>
                <span>{label}</span>
                <span>
                    {percentage} - {amount} AQUA
                </span>
            </Label>
            <Outer>
                <Inner width={percentage} isAgainst={label === 'Votes Against'} />
            </Outer>
        </ProgressLine>
    );
};

export default ResultProgressLine;
