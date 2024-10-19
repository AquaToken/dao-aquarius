import * as d3 from 'd3';
import { addDays, format, isAfter, set, subDays } from 'date-fns';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import { getDateString } from 'helpers/date';
import { formatBalance } from 'helpers/format-number';

import { PoolStatistics, PoolVolume24h } from 'types/amm';

import { StellarService } from 'services/globalServices';
import { COLORS } from 'web/styles';

import { transformDate } from '../LiquidityChart/LiquidityChart';

const Axis = styled.g`
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.grayText};
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

interface VolumeChartProps {
    data: PoolStatistics[];
    volume24h?: PoolVolume24h;
    isGlobalStat?: boolean;
    width?: number;
    height?: number;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
}

const VolumeChart = ({
    data,
    volume24h = null,
    isGlobalStat = false,
    width = 312,
    height = 264,
    marginTop = 16,
    marginRight = 16,
    marginBottom = 32,
    marginLeft = 16,
}: VolumeChartProps): React.ReactNode => {
    const [daily, last24] = useMemo(() => {
        if (isGlobalStat) {
            const copy = [...data].map(item => ({
                ...item,
                date: transformDate(item.date_str),
                volume: Number(item.volume) / 1e7,
            }));

            volume24h.volume = (Number(volume24h.volume) / 1e7).toString();

            return [copy, volume24h];
        }

        let date = set(transformDate(data[0]?.datetime_str), {
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0,
        });

        const dateMap = new Map();

        while (!isAfter(date, Date.now())) {
            dateMap.set(format(date, 'yyyy-MM-dd'), { date, volume: 0 });
            date = addDays(date, 1);
        }

        const last24Volume = data
            .filter(item => isAfter(transformDate(item.datetime_str), subDays(Date.now(), 1)))
            .reduce((acc, item) => acc + Number(item.volume) / 1e7, 0);

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
                            volume: +acc.get(itemDate)?.volume + Number(item.volume) / 1e7,
                        });
                        return acc;
                    }, dateMap)
                    .values(),
            ],
            { volume: last24Volume },
        ];
    }, [data, isGlobalStat]);

    const [selectedIndex, setSelectedIndex] = useState(null);
    const svg = useRef();
    const gx = useRef();

    const x = d3
        .scaleBand()
        .rangeRound([marginLeft, width - marginRight])
        .domain(daily.map(d => d.date));

    const y = d3
        .scaleLinear()
        .range([height - marginBottom, marginTop + height * 0.4])
        .domain([0, d3.max(daily, d => d.volume) || 1]);

    useEffect(
        () =>
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            void d3.select(gx.current).call(
                d3
                    .axisBottom(x)
                    .scale(x)
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    .tickFormat(d3.timeFormat('%d'))
                    .tickValues(
                        x.domain().filter(function (d, i) {
                            return !(i % 4);
                        }),
                    ),
            ),
        [gx, x],
    );

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
    }, [svg]);

    const selectedItem = daily[selectedIndex];

    return (
        <svg width={width} height={height} ref={svg}>
            <g>
                <GrayText x="16" y="32">
                    {selectedItem
                        ? `Daily volume: ${getDateString(selectedItem?.date?.getTime())} UTC`
                        : `Last 24h volume:`}
                </GrayText>
                <LiquidityValue x="16" y="63">
                    $
                    {formatBalance(
                        (selectedItem || last24)?.volume * StellarService.priceLumenUsd,
                        true,
                        true,
                    )}
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
                    y={y(item.volume)}
                    height={height - marginBottom - y(item.volume)}
                />
            ))}

            <Axis ref={gx} transform={`translate(0,${height - marginBottom})`} />
        </svg>
    );
};

export default VolumeChart;
