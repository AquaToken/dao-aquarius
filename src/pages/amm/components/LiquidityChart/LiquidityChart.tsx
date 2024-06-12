import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import * as d3 from 'd3';
import styled from 'styled-components';
import { COLORS } from '../../../../common/styles';
import { formatBalance, getDateString } from '../../../../common/helpers/helpers';
import { StellarService } from '../../../../common/services/globalServices';

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

export const transformDate = (date_str) => {
    const [date, time = ''] = date_str.split(' ');

    const [year, month, day] = date.split('-');
    const [hour = 0, minute = 0, second = 0] = time.split(':');
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
};

const LiquidityChart = ({
    data,
    width = 312,
    height = 264,
    marginTop = 16,
    marginRight = 16,
    marginBottom = 32,
    marginLeft = 16,
}) => {
    const [selectedIndex, setSelectedIndex] = useState(null);
    const svg = useRef();
    const gx = useRef();
    const x = d3
        .scaleTime()
        .range([marginLeft, width - marginRight])
        .domain(
            d3.extent(data, (d) => transformDate(d.datetime_str || d.date_str)) as [Date, Date],
        );
    const y = d3
        .scaleLinear()
        .range([height - marginBottom, marginTop + height * 0.4])
        .domain([d3.min(data, (d) => d.liquidity / 1e7), d3.max(data, (d) => d.liquidity / 1e7)]);

    const line = d3
        .line()
        .x((d) => x(transformDate(d.datetime_str || d.date_str)))
        .y((d) => y(d.liquidity / 1e7))
        .curve(d3.curveMonotoneX);

    const path = (data) => {
        const lineValues = line(data).slice(1);
        const splitedValues = lineValues.split(',');

        return `M${splitedValues[0]},${height - marginBottom},${lineValues},l0,${
            height - marginBottom - splitedValues[splitedValues.length - 1]
        }`;
    };

    useEffect(
        () =>
            void d3.select(gx.current).call(
                d3
                    .axisBottom()
                    .scale(x)
                    .tickFormat(d3.timeFormat('%d'))
                    .ticks(d3.timeDay.filter((d) => d3.timeDay.count(0, d) % 3 === 0)),
            ),
        [gx, x],
    );

    useEffect(() => {
        if (!svg.current) {
            return;
        }
        d3.select(svg.current)
            .on('mousemove touchmove', (event) => {
                onMouseMove(event.offsetX);
            })
            .on('mouseout', () => {
                setSelectedIndex(null);
            });
    }, [svg]);

    const onMouseMove = (xCoord) => {
        const nearestIndex = d3.bisectCenter(
            data.map((item) => transformDate(item.datetime_str || item.date_str)),
            x.invert(xCoord),
        );
        setSelectedIndex(nearestIndex);
    };

    return (
        <svg width={width} height={height} ref={svg}>
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
                        (data[selectedIndex === null ? data.length - 1 : selectedIndex].liquidity /
                            1e7) *
                            StellarService.priceLumenUsd,
                        true,
                        true,
                    )}
                </LiquidityValue>
                {selectedIndex !== null && (
                    <GrayText x="16" y="87">
                        {getDateString(
                            transformDate(
                                data[selectedIndex].datetime_str || data[selectedIndex].date_str,
                            ).getTime(),
                            {
                                withTime: true,
                            },
                        )}
                    </GrayText>
                )}
            </g>
            <Axis ref={gx} transform={`translate(0,${height - marginBottom})`} />

            <path fill="none" stroke={COLORS.tooltip} strokeWidth="2" d={line(data)} />
            <path fill="url(#gradient)" stroke="transparent" strokeWidth="0" d={path(data)} />

            {selectedIndex && (
                <g>
                    <line
                        stroke={COLORS.border}
                        strokeWidth="1"
                        x1={x(
                            transformDate(
                                data[selectedIndex].datetime_str || data[selectedIndex].date_str,
                            ),
                        )}
                        y1={height - marginBottom}
                        x2={x(
                            transformDate(
                                data[selectedIndex].datetime_str || data[selectedIndex].date_str,
                            ),
                        )}
                        y2={height * 0.4}
                    />
                    <circle
                        stroke={COLORS.white}
                        strokeWidth="2"
                        r="2.5"
                        fill={COLORS.tooltip}
                        cx={x(
                            transformDate(
                                data[selectedIndex].datetime_str || data[selectedIndex].date_str,
                            ),
                        )}
                        cy={y(data[selectedIndex].liquidity / 1e7)}
                    />
                </g>
            )}
        </svg>
    );
};

export default LiquidityChart;
