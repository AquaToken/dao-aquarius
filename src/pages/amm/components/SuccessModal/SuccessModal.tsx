import * as React from 'react';
import styled from 'styled-components';
import { flexAllCenter, respondDown } from '../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { ModalTitle } from '../../../../common/modals/atoms/ModalAtoms';
import Pair from '../../../vote/components/common/Pair';
import Button from '../../../../common/basics/Button';

const Container = styled.div`
    width: 52.3rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const AssetsInfo = styled.div`
    ${flexAllCenter};
    padding: 3.5rem 0;
    background-color: ${COLORS.lightGray};
    border-radius: 0.5rem;
    margin-top: 4rem;
`;

const StyledButton = styled(Button)`
    margin-left: auto;
    margin-top: 4.8rem;
`;

const SuccessModal = ({ params, close }) => {
    const { base, counter, baseAmount, counterAmount, title, isSwap } = params;
    return (
        <Container>
            <ModalTitle>{title ?? 'Success'}</ModalTitle>
            <AssetsInfo>
                <Pair
                    base={base}
                    counter={counter}
                    verticalDirections
                    withoutLink
                    baseAmount={baseAmount}
                    counterAmount={counterAmount}
                    isSwapResult={isSwap}
                />
            </AssetsInfo>
            <StyledButton onClick={() => close()}>done</StyledButton>
        </Container>
    );
};

export default SuccessModal;
