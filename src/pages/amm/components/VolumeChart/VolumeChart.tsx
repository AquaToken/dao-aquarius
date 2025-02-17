import * as d3 from 'd3';
import { addDays, format, isAfter, set, subDays } from 'date-fns';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import styled from 'styled-components';

import { convertUTCToLocalDateIgnoringTimezone, getDateString } from 'helpers/date';
import { formatBalance } from 'helpers/format-number';

import { PoolStatistics, PoolVolume24h } from 'types/amm';

import { Breakpoints, COLORS } from 'web/styles';

import { Select, ToggleGroup } from 'basics/inputs';

import { respondDown } from '../../../../web/mixins';
import { transformDate } from '../LiquidityChart/LiquidityChart';

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
    text {
        text-anchor: end;
    }
    path {
        display: none;
    }
`;

const GrayText = styled.text`
    font-size: 1.4rem;
    fill: ${COLORS.grayText};
`;

const LiquidityValue = styled.text`
    font-size: 2rem;
    fill: ${COLORS.titleText};
    font-weight: 700;
`;

const ToggleGroupStyled = styled(ToggleGroup)`
    width: fit-content;

    ${respondDown(Breakpoints.sm)`
        display: none;
    `}
`;

const SelectStyled = styled(Select)`
    display: none;
    width: 12rem;
    height: 4.8rem;
    border-radius: 1rem;

    ${respondDown(Breakpoints.sm)`
        display: flex;
    `}
`;

const ToggleGroupForEmpty = styled(ToggleGroupStyled)`
    position: absolute;
    right: 0;
    top: 1.6rem;
`;

const SelectForEmpty = styled(SelectStyled)`
    position: absolute;
    right: 0;
    top: 1.6rem;
`;

const Empty = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
`;

interface VolumeChartProps {
    data: PoolStatistics[];
    volume24h: Partial<PoolVolume24h>;
    isGlobalStat?: boolean;
    width?: number;
    height?: number;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
}

enum TotalPeriods {
    week = 7,
    month = 30,
    months_3 = 90,
    months_6 = 180,
    year = 365,
}

const GlobalPeriodOptions = [
    { value: TotalPeriods.week, label: 'W' },
    { value: TotalPeriods.month, label: 'M' },
    { value: TotalPeriods.months_3, label: '3M' },
    { value: TotalPeriods.months_6, label: '6M' },
    { value: TotalPeriods.year, label: '1Y' },
];

const PoolPeriodOptions = [
    { value: TotalPeriods.week, label: 'W' },
    { value: TotalPeriods.month, label: 'M' },
];

const VolumeChart = ({
    data: noFilteredData,
    volume24h = null,
    isGlobalStat = false,
    width = 312,
    height = 264,
    marginTop = 16,
    marginRight = 16,
    marginBottom = 32,
    marginLeft = 60,
}: VolumeChartProps): React.ReactNode => {
    const [selectedPeriod, setSelectedPeriod] = useState(TotalPeriods.week);

    const data = useMemo(() => {
        const timeField = isGlobalStat ? 'date_str' : 'datetime_str';
        return noFilteredData.filter(item => {
            if (!item[timeField]) return false;
            const itemDate = transformDate(item[timeField]);
            return isAfter(itemDate, subDays(new Date(), selectedPeriod - (isGlobalStat ? 0 : 1)));
        });
    }, [selectedPeriod, isGlobalStat]);

    const [daily, last24] = useMemo(() => {
        if (isGlobalStat) {
            const copy = [...data].map(item => ({
                ...item,
                date: transformDate(item.date_str),
                volume_usd: Number(item.volume_usd) / 1e7,
            }));

            const volume24hUsd = {
                ...volume24h,
                volume_usd: (Number(volume24h.volume_usd) / 1e7).toString(),
            };

            if (selectedPeriod >= TotalPeriods.months_3) {
                const monthlyData = new Map();

                copy.forEach(item => {
                    const month = format(item.date, 'yyyy-MM');
                    if (!monthlyData.has(month)) {
                        monthlyData.set(month, { date: item.date, volume_usd: 0 });
                    }
                    const existing = monthlyData.get(month);
                    existing.volume_usd += item.volume_usd;
                    monthlyData.set(month, existing);
                });

                const lastNMonths = Array.from(monthlyData.values()).slice(
                    -selectedPeriod / TotalPeriods.month,
                );

                return [lastNMonths, volume24hUsd];
            }

            return [copy, volume24hUsd];
        }

        let date = set(transformDate(data[0]?.datetime_str), {
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0,
        });

        const dateMap = new Map();

        while (!isAfter(date, Date.now())) {
            dateMap.set(format(date, 'yyyy-MM-dd'), { date, volume_usd: 0 });
            date = addDays(date, 1);
        }

        return [
            [
                ...data
                    .reduce((acc, item) => {
                        const itemDate = item.datetime_str?.split(' ')[0];

                        if (!acc.has(itemDate)) {
                            return acc;
                        }

                        acc.set(itemDate, {
                            date: acc.get(itemDate)?.date || itemDate,
                            volume_usd:
                                +acc.get(itemDate)?.volume_usd + Number(item.volume_usd) / 1e7,
                        });
                        return acc;
                    }, dateMap)
                    .values(),
            ],
            { volume_usd: +volume24h.volume_usd / 1e7 },
        ];
    }, [data, isGlobalStat, selectedPeriod, volume24h]);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const svg = useRef();
    const gx = useRef();
    const gy = useRef();

    const x = d3
        .scaleBand()
        .rangeRound([marginLeft, width - marginRight])
        .domain(daily.map(d => d.date))
        .padding(0.3);

    const y = d3
        .scaleLinear()
        .range([height - marginBottom, marginTop + height * 0.4])
        .domain([0, d3.max(daily, d => d.volume_usd) || 1]);

    useEffect(() => {
        const tickCount = 3;
        const domain = x.domain();
        const step = Math.max(1, Math.floor(domain.length / tickCount));
        const tickValues = domain.filter((_, i) => i % step === 0);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        d3.select(gx.current).call(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            d3.axisBottom(x).tickFormat(d3.timeFormat('%b %d')).tickValues(tickValues),
        );
    }, [gx, x]);

    useEffect(
        () =>
            void d3.select(gy.current).call(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                d3
                    .axisLeft(y)
                    .ticks(3)
                    .tickFormat(d =>
                        d !== 0 ? `$${+d >= 1 ? d3.format('~s')(d) : d3.format('~f')(d)}` : '',
                    ),
            ),
        [gy, y],
    );

    useEffect(() => {
        if (!svg.current) {
            return;
        }

        // Удаление старых элементов foreignObject, чтобы избежать наложения
        d3.select(svg.current).selectAll('foreignObject').remove();

        // Append foreignObject for React component
        const foreignObject = d3
            .select(svg.current)
            .append('foreignObject')
            .attr('x', 0)
            .attr('y', marginTop)
            .attr('width', width)
            .attr('height', height);

        // Create a div inside foreignObject
        const div = foreignObject
            .append('xhtml:div')
            .attr('id', 'toggle-group-volume')
            .style('position', 'absolute')
            .style('top', 0)
            .style('right', 0);

        // Render Tooltip inside div
        const root = createRoot(document.getElementById('toggle-group-volume'));
        root.render(
            <>
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
                />
            </>,
        );

        return () => {
            root.unmount();
        };
    }, [svg, selectedPeriod, width]);

    const onMouseMove = event => {
        const [mouseX] = d3.pointer(event);

        // Check if the mouse position is within the chart bounds
        if (mouseX < marginLeft || mouseX > width - marginRight) {
            setSelectedIndex(null);
            return;
        }

        // Find the closest index based on the x-scale
        const date = x.domain().find(d => {
            const posX = x(d) + x.bandwidth() / 2;
            return mouseX >= posX - x.bandwidth() / 2 && mouseX < posX + x.bandwidth() / 2;
        });

        // Set the selected index to the matching date index
        const index = daily.findIndex(item => item.date === date);
        setSelectedIndex(index !== -1 ? index : null);
    };

    useEffect(() => {
        if (!svg.current) {
            return;
        }
        d3.select(svg.current)
            .on('mousemove touchmove', event => {
                onMouseMove(event);
            })
            .on('mouseout', () => {
                setSelectedIndex(null);
            });
    }, [svg, data, width]);

    if (!data.length) {
        return (
            <Empty style={{ width, height }}>
                <ToggleGroupForEmpty
                    options={isGlobalStat ? GlobalPeriodOptions : PoolPeriodOptions}
                    value={selectedPeriod}
                    onChange={setSelectedPeriod}
                    isRounded
                />
                <SelectForEmpty
                    options={isGlobalStat ? GlobalPeriodOptions : PoolPeriodOptions}
                    value={selectedPeriod}
                    onChange={setSelectedPeriod}
                />
                <span>No data for selected period</span>
            </Empty>
        );
    }

    const selectedItem = daily[selectedIndex];

    return (
        <svg width={width} height={height} ref={svg}>
            <g>
                <GrayText x="16" y="32">
                    {selectedItem
                        ? `${
                              selectedPeriod >= TotalPeriods.months_3 ? 'Monthly' : 'Daily'
                          } volume: ${getDateString(
                              convertUTCToLocalDateIgnoringTimezone(selectedItem?.date)?.getTime(),
                              { withoutDay: selectedPeriod >= TotalPeriods.months_3 },
                          )}`
                        : `Last 24h volume:`}
                </GrayText>
                <LiquidityValue x="16" y="63">
                    ${formatBalance((selectedItem || last24)?.volume_usd, true, true)}
                </LiquidityValue>
            </g>

            {daily.map((item, i) => (
                <rect
                    rx="1"
                    fill={selectedIndex === i ? COLORS.tooltip : COLORS.gray}
                    stroke={COLORS.white}
                    key={i}
                    x={x(item.date)}
                    width={x.bandwidth()}
                    y={y(item.volume_usd)}
                    height={height - marginBottom - y(item.volume_usd)}
                />
            ))}

            <Axis ref={gx} transform={`translate(0,${height - marginBottom})`} />
            <AxisY ref={gy} transform={`translate(${marginLeft},0)`} />
        </svg>
    );
};

export default VolumeChart;
