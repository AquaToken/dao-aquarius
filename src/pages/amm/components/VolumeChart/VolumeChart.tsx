import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { formatBalance, getDateString } from '../../../../common/helpers/helpers';
import { COLORS } from '../../../../common/styles';

import * as d3 from 'd3';
import { transformDate } from '../LiquidityChart/LiquidityChart';
import styled from 'styled-components';
import { addDays, format, isAfter, set } from 'date-fns';

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

const VolumeChart = ({
    data,
    width = 312,
    height = 264,
    marginTop = 16,
    marginRight = 16,
    marginBottom = 32,
    marginLeft = 16,
}) => {
    const processedData = useMemo(() => {
        let date = set(transformDate(data[0].datetime_str), {
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

        return [
            ...data
                .reduce((acc, item) => {
                    const itemDate = item.datetime_str.split(' ')[0];

                    acc.set(itemDate, {
                        date: acc.get(itemDate).date,
                        volume: acc.get(itemDate).volume + item.volume / 1e7,
                    });
                    return acc;
                }, dateMap)
                .values(),
        ];
    }, [data]);

    const [selectedIndex, setSelectedIndex] = useState(null);
    const svg = useRef();
    const gx = useRef();

    const x = d3
        .scaleBand()
        .rangeRound([marginLeft, width - marginRight])
        .domain(processedData.map((d) => d.date));

    const y = d3
        .scaleLinear()
        .range([height - marginBottom, marginTop + height * 0.4])
        .domain([0, d3.max(processedData, (d) => d.volume) || 1]);

    useEffect(
        () =>
            void d3.select(gx.current).call(
                d3
                    .axisBottom()
                    .scale(x)
                    .tickFormat(d3.timeFormat('%b %d'))
                    .tickValues(
                        x.domain().filter(function (d, i) {
                            return !(i % 4);
                        }),
                    ),
            ),
        [gx, x],
    );

    useEffect(() => {
        if (!svg.current) {
            return;
        }
        d3.select(svg.current)
            .on('mousemove touchmove', (event) => {
                onMouseMove(event);
            })
            .on('mouseout', () => {
                setSelectedIndex(null);
            });
    }, [svg]);

    const onMouseMove = (event) => {
        if (
            event.offsetX < marginLeft ||
            event.offsetX >= x.bandwidth() * processedData.length + marginLeft
        ) {
            return setSelectedIndex(null);
        }

        const index = Math.floor((event.offsetX - marginLeft) / x.bandwidth());

        setSelectedIndex(index);
    };

    return (
        <svg width={width} height={height} ref={svg}>
            <g>
                <GrayText x="16" y="32">
                    Volume 24h
                </GrayText>
                <LiquidityValue x="16" y="63">
                    {formatBalance(
                        processedData[
                            selectedIndex === null ? processedData.length - 1 : selectedIndex
                        ].volume,
                        true,
                        true,
                    )}{' '}
                    XLM
                </LiquidityValue>
                {selectedIndex !== null && (
                    <GrayText x="16" y="87">
                        {getDateString(processedData[selectedIndex].date.getTime())}
                    </GrayText>
                )}
            </g>

            {processedData.map((item, i) => (
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
