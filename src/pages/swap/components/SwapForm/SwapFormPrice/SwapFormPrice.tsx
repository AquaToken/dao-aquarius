import * as React from 'react';
import styled from 'styled-components';

import { formatBalance } from 'helpers/format-number';

import { COLORS } from 'web/styles';

import Revert from 'assets/icon-revert.svg';

const Container = styled.div`
    color: ${COLORS.grayText};
    margin-top: 3rem;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    cursor: pointer;

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
}

const SwapFormPrice = ({
    baseAmount,
    counterAmount,
    pending,
    baseCode,
    counterCode,
    isReverted,
    setIsReverted,
}: SwapFormPriceProps) => {
    if (!baseAmount || !counterAmount || pending) {
        return null;
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
