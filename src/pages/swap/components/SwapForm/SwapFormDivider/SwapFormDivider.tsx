import * as React from 'react';
import styled from 'styled-components';

import { flexAllCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import SwapIcon from 'assets/icon-arrows-circle.svg';

import PageLoader from 'basics/loaders/PageLoader';

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 3rem 0 4rem;
    height: 4.8rem;

    ${respondDown(Breakpoints.md)`
       margin: 1rem 0 0;
    `}
`;

const RevertButton = styled.div`
    cursor: pointer;
    padding: 1rem;
    border-radius: 0.3rem;
    ${flexAllCenter};

    &:hover {
        background-color: ${COLORS.lightGray};
    }
`;

interface SwapFormDividerProps {
    pending: boolean;
    onRevert: () => void;
}

const SwapFormDivider = ({ pending, onRevert }: SwapFormDividerProps): React.ReactNode => (
    <Container>
        {pending ? (
            <PageLoader />
        ) : (
            <RevertButton onClick={() => onRevert()}>
                <SwapIcon />
            </RevertButton>
        )}
    </Container>
);

export default SwapFormDivider;
