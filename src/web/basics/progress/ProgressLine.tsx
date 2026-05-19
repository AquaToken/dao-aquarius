import * as React from 'react';
import styled, { css } from 'styled-components';

import { flexAllCenter } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

const Container = styled.div`
    width: 100%;
`;

const Labels = styled.div`
    width: 100%;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.textGray};
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
    background-color: ${COLORS.gray100};
`;

type InnerProps = {
    $width: string;
    $color?: string;
    $isAnimated?: boolean;
};

type ProgressLineProps = {
    percent: number;
    leftLabel: string;
    rightLabel: React.ReactNode;
    color?: string;
    isAnimated?: boolean;
};

const Inner = styled.div<InnerProps>`
    ${progressLineStyles};
    width: ${({ $width }) => $width};
    background-color: ${({ $color }) => $color || COLORS.purple500};
    transition: ${({ $isAnimated }) => ($isAnimated ? 'width 500ms ease-out' : 'none')};
    will-change: ${({ $isAnimated }) => ($isAnimated ? 'width' : 'auto')};
`;

const ProgressLine = ({
    percent,
    leftLabel,
    rightLabel,
    color = COLORS.purple500,
    isAnimated = false,
}: ProgressLineProps): React.ReactElement => (
    <Container>
        <Labels>
            <LeftLabel>{leftLabel}</LeftLabel>
            <span>{rightLabel}</span>
        </Labels>
        <Outer>
            <Inner $width={`${percent}%`} $color={color} $isAnimated={isAnimated} />
        </Outer>
    </Container>
);

export default ProgressLine;
