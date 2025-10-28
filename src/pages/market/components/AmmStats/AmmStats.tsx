import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import { Asset } from 'types/stellar';

import { ToggleGroup } from 'basics/inputs';

import { flexRowSpaceBetween, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import ClassicAmmStats from 'pages/market/components/AmmStats/ClassicAmmStats/ClassicAmmStats';
import SorobanAmmStats from 'pages/market/components/AmmStats/SorobanAmmStats/SorobanAmmStats';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.white};
    padding: 4.2rem 3.2rem 2rem;
    border-radius: 0.5rem;

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 1.6rem;
    `}
`;

const Header = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 3.2rem;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
    `}
`;

const Title = styled.span`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.textPrimary};

    ${respondDown(Breakpoints.md)`
        margin-bottom: 1.6rem;
    `}
`;

interface Props {
    assets: Asset[];
}

enum PoolTypes {
    classic = 'classic',
    soroban = 'soroban',
}

const OPTIONS = [
    { label: 'Soroban AMM', value: PoolTypes.soroban },
    { label: 'Classic AMM', value: PoolTypes.classic },
];

const AmmStats = ({ assets }: Props) => {
    const [ammType, setAmmType] = useState(PoolTypes.soroban);
    return (
        <Container>
            <Header>
                <Title>AMM stats</Title>
                <ToggleGroup value={ammType} options={OPTIONS} onChange={setAmmType} />
            </Header>
            {ammType === PoolTypes.classic && (
                <ClassicAmmStats base={assets[0]} counter={assets[1]} />
            )}
            {ammType === PoolTypes.soroban && <SorobanAmmStats assets={assets} />}
        </Container>
    );
};

export default AmmStats;
