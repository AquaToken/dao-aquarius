import * as React from 'react';
import styled from 'styled-components';

import { flexAllCenter } from 'web/mixins';
import { COLORS } from 'web/styles';

import SwapIcon from 'assets/icon-arrows-circle.svg';

import PageLoader from 'basics/loaders/PageLoader';

const Container = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    height: 4rem;
    width: 4rem;
    border-radius: 50%;
    border: 0.1rem solid ${COLORS.gray};
    background-color: ${COLORS.white};
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transform: translate(-50%, -50%);

    &:hover {
        border: 0.1rem solid ${COLORS.grayText};
    }
`;

const RevertButton = styled.div`
    cursor: pointer;
    padding: 1rem;
    border-radius: 0.3rem;
    ${flexAllCenter};
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
