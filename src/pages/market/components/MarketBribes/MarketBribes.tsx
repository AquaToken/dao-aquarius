import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import ToggleGroup from 'basics/inputs/ToggleGroup';

import MarketCurrentBribes from './MarketCurrentBribes/MarketCurrentBribes';
import MarketUpcomingBribes from './MarketUpcomingBribes/MarketUpcomingBribes';

import { flexRowSpaceBetween, respondDown } from '../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../common/styles';

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

const MarketBribes = ({ base, counter, bribes, extra, marketKey }) => {
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
