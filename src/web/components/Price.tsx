import * as React from 'react';
import styled from 'styled-components';

import { formatBalance } from 'helpers/format-number';

import { Token, TokenType } from 'types/token';

import Revert from 'assets/icon-revert.svg';

import { DotsLoader } from 'basics/loaders';

import { COLORS } from '../styles';

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
    base: Token;
    counter: Token;
    isReverted: boolean;
    setIsReverted: (isReverted: boolean) => void;
    hasError: boolean;
}

const Price = ({
    baseAmount,
    counterAmount,
    pending,
    base,
    counter,
    isReverted,
    setIsReverted,
    hasError,
    ...props
}: SwapFormPriceProps) => {
    if ((!Number(baseAmount) && !Number(counterAmount)) || hasError) {
        return null;
    }

    if (pending || !baseAmount || !counterAmount) {
        return (
            <Container>
                1 {base.code} = <DotsLoader style={{ margin: '0 0.5rem' }} /> {counter.code}
            </Container>
        );
    }

    return (
        <Container onClick={() => setIsReverted(!isReverted)} {...props}>
            {isReverted
                ? `1 ${counter.code} = ${formatBalance(
                      +(+baseAmount / +counterAmount).toFixed(
                          base.type === TokenType.soroban ? base.decimal : 7,
                      ),
                  )} ${base.code}`
                : `1 ${base.code} = ${formatBalance(
                      +(+counterAmount / +baseAmount).toFixed(
                          counter.type === TokenType.soroban ? counter.decimal : 7,
                      ),
                  )} ${counter.code}`}
            <Revert />
        </Container>
    );
};

export default Price;
