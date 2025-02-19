import * as d3 from 'd3';
import { isAfter, subDays } from 'date-fns';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import { ChartPeriods } from 'constants/charts';

import { convertUTCToLocalDateIgnoringTimezone, getDateString } from 'helpers/date';
import { formatBalance } from 'helpers/format-number';

import { PoolStatistics } from 'types/amm';

import { Breakpoints, COLORS } from 'web/styles';

import EmptyChart from 'assets/empty-chart.svg';

import { Select, ToggleGroup } from 'basics/inputs';

import { flexAllCenter, respondDown } from '../../../../web/mixins';

const Container = styled.div`
    ${flexAllCenter};
    position: relative;
`;

const Axis = styled.g`
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.grayText};

    path {
        color: ${COLORS.border};
    }

    line {
        display: none;
    }
`;

const AxisY = styled(Axis)`
    path {
        display: none;
    }
`;

const GrayText = styled.text`
    font-size: 1.4rem;
    fill: ${COLORS.grayText};

    ${respondDown(Breakpoints.sm)`
       font-size: 1.2rem;
    `}
`;

const LiquidityValue = styled.text`
    font-size: 2rem;
    fill: ${COLORS.titleText};
    font-weight: 700;

    ${respondDown(Breakpoints.sm)`
       font-size: 1.6rem;
    `}
`;

const ToggleGroupStyled = styled(ToggleGroup)`
    width: fit-content;
    position: absolute;
    right: 0;
    top: 1.6rem;

    ${respondDown(Breakpoints.sm)`
        display: none;
    `}
`;

const SelectStyled = styled(Select)`
    display: none;
    width: 8rem;
    height: 4.8rem;
    border-radius: 1rem;
    justify-content: flex-start;
    position: absolute;
    right: 0;
    top: 1.6rem;

    & > div {
        padding-left: 1rem;

        & > div {
            padding-left: 1rem;
        }
    }

    & > svg {
        right: 0.4rem;
    }

    ${respondDown(Breakpoints.sm)`
        display: flex;
    `}
`;

const Empty = styled.div`
    ${flexAllCenter};
    flex-direction: column;
    gap: 1.6rem;
    color: ${COLORS.grayText};
`;

export const transformDate = (date_str: string) => {
    if (!date_str) {
        return new Date();
    }
    const [date, time = ''] = date_str.split(' ');

    const [year, month, day] = date.split('-');
    const [hour = 0, minute = 0, second = 0] = time.split(':');
    return new Date(+year, +month - 1, +day, +hour, +minute, +second);
};

interface LiquidityChartProps {
    data: PoolStatistics[];
    currentLiquidity?: string;
    isGlobalStat?: boolean;
    width?: number;
    height?: number;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
    defaultPeriod?: ChartPeriods;
}

const GlobalPeriodOptions = [
    { value: ChartPeriods.week, label: 'W' },
    { value: ChartPeriods.month, label: 'M' },
    { value: ChartPeriods.months_3, label: '3M' },
    { value: ChartPeriods.months_6, label: '6M' },
    { value: ChartPeriods.year, label: '1Y' },
];

const PoolPeriodOptions = [
    { value: ChartPeriods.week, label: 'W' },
    { value: ChartPeriods.month, label: 'M' },
];

const LiquidityChart = ({
    data: noFilteredData,
    currentLiquidity,
    isGlobalStat,
    defaultPeriod = ChartPeriods.week,
    width = 312,
    height = 264,
    marginTop = 16,
    marginRight = 24,
    marginBottom = 32,
    marginLeft = 60,
}: LiquidityChartProps) => {
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState(defaultPeriod);

    const data = useMemo(() => {
        const timeField = isGlobalStat ? 'date_str' : 'datetime_str';
        return noFilteredData.filter(item => {
            if (!item[timeField]) return false;
            const itemDate = transformDate(item[timeField]);
            return isAfter(itemDate, subDays(new Date(), selectedPeriod - (isGlobalStat ? 0 : 1)));
        });
    }, [selectedPeriod, isGlobalStat]);

    const svg = useRef();
    const gx = useRef();
    const gy = useRef();

    const x = d3
        .scaleTime()
        .range([marginLeft, width - marginRight])
        .domain(d3.extent(data, d => transformDate(d.datetime_str || d.date_str)) as [Date, Date]);
    const y = d3
        .scaleLinear()
        .range([height - marginBottom, marginTop + height * 0.4])
        .domain([
            d3.min(data, d => Number(d.liquidity_usd) / 1e7),
            d3.max(data, d => Number(d.liquidity_usd) / 1e7),
        ]);

    const line = d3
        .line<PoolStatistics>()
        .x(d => x(transformDate(d.datetime_str || d.date_str))) // Transform the date
        .y(d => y(Number(d.liquidity_usd) / 1e7)) // Scale liquidity value
        .curve(d3.curveMonotoneX);

    const path = (data: PoolStatistics[]) => {
        const lineValues = line(data).slice(1);
        const splitedValues = lineValues.split(',');

        return `M${splitedValues[0]},${height - marginBottom},${lineValues},l0,${
            height - marginBottom - +splitedValues[splitedValues.length - 1]
        }`;
    };

    useEffect(() => {
        const tickValues =
            width < 300
                ? [
                      transformDate(data[0]?.date_str ?? data[0]?.datetime_str),
                      transformDate(
                          data[data.length - 1]?.date_str ?? data[data.length - 1]?.datetime_str,
                      ),
                  ]
                : undefined;

        d3.select(gx.current).call(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            d3.axisBottom(x).tickFormat(d3.timeFormat('%b %d')).tickValues(tickValues).ticks(2),
        );
    }, [gx, x, width]);

    useEffect(
        () =>
            void d3.select(gy.current).call(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                d3
                    .axisLeft(y)
                    .ticks(3)
                    .tickFormat(d => `$${+d >= 1 ? d3.format('~s')(d) : d3.format('.4f')(d)}`),
            ),
        [gy, y],
    );

    const onMouseMove = xCoord => {
        const nearestIndex = d3.bisectCenter(
            data.map(item => transformDate(item.datetime_str || item.date_str)),
            x.invert(xCoord),
        );
        setSelectedIndex(nearestIndex);
    };

    useEffect(() => {
        if (!svg.current) {
            return;
        }
        d3.select(svg.current)
            .on('mousemove touchmove', event => {
                onMouseMove(event.offsetX);
            })
            .on('mouseout', () => {
                setSelectedIndex(null);
            });
    }, [svg, data, width]);

    return (
        <Container style={{ width: '100%', height }}>
            <ToggleGroupStyled
                options={isGlobalStat ? GlobalPeriodOptions : PoolPeriodOptions}
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                isRounded
            />
            <SelectStyled
                options={isGlobalStat ? GlobalPeriodOptions : PoolPeriodOptions}
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                placeholder="Set"
            />
            {data.length ? (
                <svg width="100%" height={height} ref={svg}>
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#8620B9" stopOpacity="0.6"></stop>
                            <stop offset="100%" stopColor="#D9D9D9" stopOpacity="0"></stop>
                        </linearGradient>
                    </defs>
                    <g>
                        <GrayText x="16" y="32">
                            Liquidity
                        </GrayText>
                        <LiquidityValue x="16" y="63">
                            $
                            {formatBalance(
                                (selectedIndex === null
                                    ? +currentLiquidity || +data[data.length - 1]?.liquidity_usd
                                    : +data[selectedIndex]?.liquidity_usd) / 1e7,
                                true,
                                true,
                            )}
                        </LiquidityValue>
                        {selectedIndex !== null && (
                            <GrayText x="16" y="87">
                                {getDateString(
                                    convertUTCToLocalDateIgnoringTimezone(
                                        transformDate(
                                            data[selectedIndex]?.datetime_str ||
                                                data[selectedIndex]?.date_str,
                                        ),
                                    )?.getTime(),
                                    {
                                        withTime: !isGlobalStat,
                                    },
                                )}
                            </GrayText>
                        )}
                    </g>

                    <Axis ref={gx} transform={`translate(0,${height - marginBottom})`} />
                    <AxisY ref={gy} transform={`translate(${marginLeft}, 0)`} />

                    <path fill="none" stroke={COLORS.tooltip} strokeWidth="2" d={line(data)} />
                    <path
                        fill="url(#gradient)"
                        stroke="transparent"
                        strokeWidth="0"
                        d={path(data)}
                    />
                    <g>
                        {Boolean(selectedIndex) && (
                            <>
                                <line
                                    stroke={COLORS.tooltip}
                                    strokeOpacity={0.2}
                                    strokeDasharray="4 4"
                                    strokeWidth="1"
                                    x1={x(
                                        transformDate(
                                            data[selectedIndex]?.datetime_str ||
                                                data[selectedIndex]?.date_str,
                                        ),
                                    )}
                                    y1={height - marginBottom}
                                    x2={x(
                                        transformDate(
                                            data[selectedIndex]?.datetime_str ||
                                                data[selectedIndex]?.date_str,
                                        ),
                                    )}
                                    y2={height * 0.4}
                                />
                                <line
                                    stroke={COLORS.tooltip}
                                    strokeOpacity={0.2}
                                    strokeDasharray="4 4"
                                    strokeWidth="1"
                                    x1={marginLeft}
                                    y1={y(Number(data[selectedIndex].liquidity_usd) / 1e7)}
                                    x2={width - marginRight}
                                    y2={y(Number(data[selectedIndex].liquidity_usd) / 1e7)}
                                />
                                <circle
                                    stroke={COLORS.white}
                                    strokeWidth="2"
                                    r="2.5"
                                    fill={COLORS.tooltip}
                                    cx={x(
                                        transformDate(
                                            data[selectedIndex]?.datetime_str ||
                                                data[selectedIndex]?.date_str,
                                        ),
                                    )}
                                    cy={y(Number(data[selectedIndex].liquidity_usd) / 1e7)}
                                />
                            </>
                        )}
                    </g>
                </svg>
            ) : (
                <Empty>
                    <EmptyChart />
                    <span>No data for selected period</span>
                </Empty>
            )}
        </Container>
    );
};

export default LiquidityChart;
