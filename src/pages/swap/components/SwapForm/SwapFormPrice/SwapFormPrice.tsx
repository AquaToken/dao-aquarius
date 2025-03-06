import * as React from 'react';
import styled from 'styled-components';

import { formatBalance } from 'helpers/format-number';

import { COLORS } from 'web/styles';

import Revert from 'assets/icon-revert.svg';

import { DotsLoader } from 'basics/loaders';

const Container = styled.div`
    color: ${COLORS.grayText};
    margin: 1.6rem 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    cursor: pointer;
    height: 1.7rem;

    svg {
        margin-left: 0.6rem;
    }
`;

interface SwapFormPriceProps {
    baseAmount: string;
    counterAmount: string;
    pending: boolean;
    baseCode: string;
    counterCode: string;
    isReverted: boolean;
    setIsReverted: (isReverted: boolean) => void;
    hasError: boolean;
}

const SwapFormPrice = ({
    baseAmount,
    counterAmount,
    pending,
    baseCode,
    counterCode,
    isReverted,
    setIsReverted,
    hasError,
}: SwapFormPriceProps) => {
    if ((!Number(baseAmount) && !Number(counterAmount)) || hasError) {
        return null;
    }

    if (pending || !baseAmount || !counterAmount) {
        return (
            <Container>
                1 {baseCode} = <DotsLoader style={{ margin: '0 0.5rem' }} /> {counterCode}
            </Container>
        );
    }

    return (
        <Container onClick={() => setIsReverted(!isReverted)}>
            {isReverted
                ? `1 ${counterCode} = ${formatBalance(+baseAmount / +counterAmount)} ${baseCode}`
                : `1 ${baseCode} = ${formatBalance(+counterAmount / +baseAmount)} ${counterCode}`}
            <Revert />
        </Container>
    );
};

export default SwapFormPrice;
