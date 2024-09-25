import * as React from 'react';
import styled from 'styled-components';

import SwapIcon from 'assets/icon-arrows-circle.svg';

import PageLoader from '../../../../../common/basics/PageLoader';
import { flexAllCenter, respondDown } from '../../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../../common/styles';

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

const SwapFormDivider = ({ pending, onRevert }) => {
    return (
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
};

export default SwapFormDivider;
