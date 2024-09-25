import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import DailyStats from './DailyStats/DailyStats';
import LightWeightChart, { PeriodOptions } from './LightWeightChart/LightWeightChart';

import ExternalLink from '../../../../common/basics/ExternalLink';
import Select from '../../../../common/basics/Select';
import ToggleGroup from '../../../../common/basics/ToggleGroup';
import { getAssetString } from '../../../../common/helpers/helpers';
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
    align-items: center;
    margin-bottom: 5rem;

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

const ToggleGroupWeb = styled(ToggleGroup)`
    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const ToggleGroupMobile = styled(Select)`
    display: none;

    ${respondDown(Breakpoints.md)`
        display: flex;
        margin-bottom  3.2rem
    `}
`;

const ExternalLinkStyled = styled(ExternalLink)`
    margin-top: 4rem;
`;

const OPTIONS = [
    { label: '1m', value: PeriodOptions.min_1 },
    { label: '5m', value: PeriodOptions.min_5 },
    { label: '15m', value: PeriodOptions.min_15 },
    { label: '1h', value: PeriodOptions.hour },
    { label: '1d', value: PeriodOptions.day },
    { label: '1w', value: PeriodOptions.week },
];

const TradeStats = ({ base, counter }) => {
    const [period, setPeriod] = useState(PeriodOptions.hour);

    return (
        <Container>
            <Header>
                <Title>Market stats</Title>
                <ToggleGroupWeb value={period} options={OPTIONS} onChange={setPeriod} />
            </Header>

            <DailyStats base={base} counter={counter} />

            <ToggleGroupMobile value={period} options={OPTIONS} onChange={setPeriod} />

            <LightWeightChart base={base} counter={counter} period={period} />

            <ExternalLinkStyled
                href={`https://stellarx.com/markets/${getAssetString(base)}/${getAssetString(
                    counter,
                )}`}
            >
                See SDEX on StellarX
            </ExternalLinkStyled>
        </Container>
    );
};

export default TradeStats;
