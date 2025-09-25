import * as React from 'react';
import styled from 'styled-components';

import { COLORS } from 'web/styles';

import Present from 'assets/icon-precent-white.svg';
import Success from 'assets/icon-success-white.svg';

const Container = styled.div<{ $isComplete: boolean }>`
    display: flex;
    gap: 0.4rem;
    height: 3.2rem;
    align-items: center;
    padding: 0 1rem;
    border-radius: 4.5rem;
    background-color: ${({ $isComplete }) => ($isComplete ? COLORS.green500 : COLORS.purple500)};
    font-weight: 700;
    font-size: 1.6rem;
    line-height: 100%;
    color: ${COLORS.white};
    text-transform: uppercase;
    white-space: nowrap;
`;

const SuccessIcon = styled(Success)`
    path {
        stroke: ${COLORS.green500};
    }
`;

interface Props {
    isComplete: boolean;
}

const TaskStatus = ({ isComplete }: Props): React.ReactNode => (
    <Container $isComplete={isComplete}>
        {isComplete ? <SuccessIcon /> : <Present />}
        <span>{isComplete ? 'Done' : '5 USDC'}</span>
    </Container>
);

export default TaskStatus;
