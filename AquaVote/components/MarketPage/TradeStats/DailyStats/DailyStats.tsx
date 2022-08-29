import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../../common/styles';
import { useEffect, useMemo, useState } from 'react';
import { StellarService } from '../../../../../common/services/globalServices';
import { respondDown } from '../../../../../common/mixins';
import DotsLoader from '../../../../../common/basics/DotsLoader';
import { formatBalance } from '../../../../../common/helpers/helpers';

const Details = styled.div`
    display: flex;
    margin-bottom: 3.2rem;

    ${respondDown(Breakpoints.md)`
         flex-direction: column;
    `}
`;

const DetailsColumn = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;

    ${respondDown(Breakpoints.md)`
         margin-bottom: 3.2rem;
    `}
`;

const DetailTitle = styled.span`
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.grayText};
    margin-bottom: 0.8rem;
`;

const DetailValue = styled.span`
    font-size: 1.6rem;
    line-height: 2.4rem;
    color: ${COLORS.paragraphText};
    width: min-content;
    white-space: nowrap;
`;

const Change = styled.div<{ isPositive: boolean }>`
    color: ${({ isPositive }) => (isPositive ? COLORS.purple : COLORS.pinkRed)};
`;

const PERIOD_24H = 24 * 60 * 60 * 1000;
const RESOLUTION_MINUTE = 60 * 1000;
const RESOLUTION_15_MIN = 15 * 60 * 1000;

const DailyStats = ({ base, counter }) => {
    const [last15MinutesTrades, setLast15MinutesTrades] = useState(null);
    const [lastMinuteTrade, setLastMinuteTrade] = useState(null);

    useEffect(() => {
        const endDate = Date.now();
        const startDate = endDate - PERIOD_24H;

        StellarService.getTradeAggregations(
            base,
            counter,
            startDate,
            endDate + RESOLUTION_15_MIN,
            RESOLUTION_15_MIN,
            100,
        ).then((res) => {
            setLast15MinutesTrades(res.records);
        });

        StellarService.getTradeAggregations(
            base,
            counter,
            startDate,
            endDate + RESOLUTION_MINUTE,
            RESOLUTION_MINUTE,
            1,
        ).then((res) => {
            setLastMinuteTrade(res.records);
        });
    }, []);

    const { lastPrice, volume24, change24 } = useMemo(() => {
        if (!lastMinuteTrade || !last15MinutesTrades) {
            return { lastPrice: null, volume24: null, change24: null };
        }

        if (!lastMinuteTrade.length || !last15MinutesTrades.length) {
            return { lastPrice: '-', volume24: '-', change24: '-' };
        }

        const lastPrice = Number(lastMinuteTrade[0].close);
        const volume24 = last15MinutesTrades.reduce((acc, item) => {
            acc += Number(item.counter_volume);
            return acc;
        }, 0);
        const change24 = (
            (lastPrice / last15MinutesTrades[last15MinutesTrades.length - 1].open - 1) * 100 || 0
        ).toFixed(2);

        return { lastPrice, change24, volume24 };
    }, [lastMinuteTrade, last15MinutesTrades]);

    return (
        <Details>
            <DetailsColumn>
                <DetailTitle>Last price</DetailTitle>
                <DetailValue>
                    {lastPrice !== null ? (
                        `${
                            lastPrice === '-'
                                ? '-'
                                : `1 ${base.code} = ${lastPrice} ${counter.code}`
                        }`
                    ) : (
                        <DotsLoader />
                    )}
                </DetailValue>
            </DetailsColumn>
            <DetailsColumn>
                <DetailTitle>Volume 24h</DetailTitle>
                <DetailValue>
                    {volume24 ? (
                        volume24 === '-' ? (
                            '-'
                        ) : (
                            `${formatBalance(volume24, true)} ${counter.code}`
                        )
                    ) : (
                        <DotsLoader />
                    )}
                </DetailValue>
            </DetailsColumn>
            <DetailsColumn>
                <DetailTitle>Change 24h</DetailTitle>
                <DetailValue>
                    {change24 ? (
                        change24 === '-' ? (
                            '-'
                        ) : (
                            <Change isPositive={Number(change24) >= 0}>{change24}%</Change>
                        )
                    ) : (
                        <DotsLoader />
                    )}
                </DetailValue>
            </DetailsColumn>
        </Details>
    );
};

export default DailyStats;
