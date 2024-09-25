import * as React from 'react';
import styled, { css } from 'styled-components';

import { flexAllCenter } from '../mixins';
import { COLORS } from '../styles';

const Container = styled.div`
    width: 100%;
`;

const Labels = styled.div`
    width: 100%;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.7rem;
`;

const LeftLabel = styled.div`
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

const Inner = styled.div<{ width: string }>`
    ${progressLineStyles};
    width: ${({ width }) => width};
    background-color: ${COLORS.purple};
`;

const ProgressLine = ({
    percent,
    leftLabel,
    rightLabel,
}: {
    percent: number;
    leftLabel: string;
    rightLabel: string | React.ReactNode;
}): JSX.Element => {
    return (
        <Container>
            <Labels>
                <LeftLabel>{leftLabel}</LeftLabel>
                <span>{rightLabel}</span>
            </Labels>
            <Outer>
                <Inner width={`${percent}%` || '0'} />
            </Outer>
        </Container>
    );
};

export default ProgressLine;
