import * as React from 'react';
import styled from 'styled-components';

import { formatBalance } from 'helpers/format-number';

import IceSymbol from 'assets/icon-ice-symbol.svg';

import { COLORS } from '../styles';

const Container = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0 0.8rem;
    height: 2.8rem;
    border: ${({ $color }) => `0.2rem solid ${$color}`};
    color: ${({ $color }) => $color};
    border-radius: 0.7rem;
    cursor: help;
`;

const Icon = styled(IceSymbol)<{ $color: string }>`
    path {
        fill: ${({ $color }) => $color};
    }
`;

const colors = {
    blue: COLORS.blue700,
    purple: COLORS.purple500,
} as const;

interface Props {
    value: number;
    color: keyof typeof colors;
}

const ApyBoosted = ({ value, color }: Props) => (
    <Container $color={colors[color]}>
        <Icon $color={colors[color]} />
        {formatBalance(+value.toFixed(2))}%
    </Container>
);

export default ApyBoosted;
