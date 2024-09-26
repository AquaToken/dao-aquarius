import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import { Asset } from 'types/stellar';

import { flexRowSpaceBetween, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import ToggleGroup from 'basics/inputs/ToggleGroup';

import { Bribe } from 'pages/bribes/api/types';
import { MarketVotesExtra } from 'pages/vote/api/types';

import MarketCurrentBribes from './MarketCurrentBribes/MarketCurrentBribes';
import MarketUpcomingBribes from './MarketUpcomingBribes/MarketUpcomingBribes';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.white};
    padding: 4.2rem 3.2rem 2rem;
    border-radius: 0.5rem;
`;

const Header = styled.div`
    ${flexRowSpaceBetween};

    ${respondDown(Breakpoints.md)`
      flex-direction: column;
      margin-bottom: 3.2rem;
      align-items: flex-start;
    `}
`;

const Title = styled.span`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};

    ${respondDown(Breakpoints.md)`
        margin-bottom: 1.6rem;
    `}
`;

enum BribeBlockStates {
    current = 'current',
    upcoming = 'upcoming',
}

const OPTIONS = [
    { label: 'This week', value: BribeBlockStates.current },
    { label: 'Upcoming', value: BribeBlockStates.upcoming },
];

interface MarketBribesProps {
    base: Asset;
    counter: Asset;
    bribes: Bribe[];
    extra: MarketVotesExtra;
    marketKey: string;
}

const MarketBribes = ({ base, counter, bribes, extra, marketKey }: MarketBribesProps) => {
    const [blockState, setBlockState] = useState(BribeBlockStates.current);
    return (
        <Container>
            <Header>
                <Title>
                    Bribes for {base.code} / {counter.code}
                </Title>
                <ToggleGroup value={blockState} options={OPTIONS} onChange={setBlockState} />
            </Header>
            {blockState === BribeBlockStates.current && (
                <MarketCurrentBribes extra={extra} bribes={bribes} />
            )}
            {blockState === BribeBlockStates.upcoming && (
                <MarketUpcomingBribes marketKey={marketKey} />
            )}
        </Container>
    );
};

export default MarketBribes;
