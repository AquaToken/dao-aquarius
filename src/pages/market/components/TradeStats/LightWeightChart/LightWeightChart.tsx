import { createChart, CrosshairMode, LineStyle } from 'lightweight-charts';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import PageLoader from 'basics/loaders/PageLoader';

import { formatBalance } from '../../../../../common/helpers/helpers';
import { useDebounce } from '../../../../../common/hooks/useDebounce';
import { flexAllCenter } from '../../../../../common/mixins';
import { StellarService } from '../../../../../common/services/globalServices';
import { COLORS } from '../../../../../common/styles';
import { convertLocalDateToUTCIgnoringTimezone } from '../../../../bribes/pages/AddBribePage';

const Chart = styled.div`
    display: flex;
    width: 100%;
    height: 45rem;
    position: relative;
`;

const Loader = styled.div`
    ${flexAllCenter};
    background: ${COLORS.lightGray};
    font-size: 1.6rem;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
`;

const Statistic = styled.div<{ isUp: boolean }>`
    position: absolute;
    left: 2.4rem;
    top: 0.8rem;
    z-index: 2;
    color: ${({ isUp }) => (isUp ? '#4caf50' : '#ef5350')};
`;

const StatisticLabel = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
    margin-right: 0.8rem;
`;

const StatisticValue = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    margin-right: 1.6rem;
`;

export enum PeriodOptions {
    min_1 = 60000,
    min_5 = 300000,
    min_15 = 900000,
    hour = 3600000,
    day = 86400000,
    week = 604800000,
}

const AGGREGATIONS_DEPS = {
    // 3 days
    [PeriodOptions.min_1]: 3 * 24 * 60 * 60 * 1000,
    // 1 week
    [PeriodOptions.min_5]: 7 * 24 * 60 * 60 * 1000,
    // 1 month
    [PeriodOptions.min_15]: 31 * 24 * 60 * 60 * 1000,
    // 6 months
    [PeriodOptions.hour]: 6 * 31 * 24 * 60 * 60 * 1000,
    // 3 years
    [PeriodOptions.day]: 3 * 12 * 31 * 24 * 60 * 60 * 1000,
    // 5 years
    [PeriodOptions.week]: 5 * 12 * 31 * 24 * 60 * 60 * 1000,
};

const getTime = (timestamp, period) =>
    period >= PeriodOptions.day
        ? new Date(+timestamp).getTime() / 1000
        : convertLocalDateToUTCIgnoringTimezone(new Date(+timestamp)).getTime() / 1000;

const processChartData = (tradeAggregations, period) => {
    const nullTrades = [];

    const copyTradeAggregations = [...tradeAggregations];

    const formattedTradeAggregations = copyTradeAggregations
        .reverse()
        .map(({ open, close, timestamp, high, low, base_volume }, index) => ({
            open: index === 0 ? +open : +copyTradeAggregations[index - 1].close,
            close: +close,
            time: getTime(timestamp, period),
            timestamp: +timestamp,
            high: +high,
            low: +low,
            value: +base_volume,
        }));

    copyTradeAggregations.forEach(({ open, close, timestamp, high, low, base_volume }, index) => {
        if (index !== 0 && timestamp - copyTradeAggregations[index - 1].timestamp > period) {
            for (
                let i = +copyTradeAggregations[index - 1].timestamp + period;
                i < +timestamp;
                i += period
            ) {
                nullTrades.push({
                    open: +copyTradeAggregations[index - 1].close,
                    close: +copyTradeAggregations[index - 1].close,
                    time: getTime(i, period),
                    timestamp: i,
                    high: +copyTradeAggregations[index - 1].close,
                    low: +copyTradeAggregations[index - 1].close,
                    value: 0,
                });
            }
        }
    });
    return [...formattedTradeAggregations, ...nullTrades].sort((a, b) => a.time - b.time);
};

const processNextData = (newData, oldData, period) => {
    const processedNewData = processChartData(newData, period);

    const lastNewItem = processedNewData[processedNewData.length - 1];

    oldData[0].open = lastNewItem.close;

    const lastNewItemTimestamp = +lastNewItem.timestamp;
    const firstOldItemTimestamp = +oldData[0].timestamp;

    const nullTrades = [];

    if (firstOldItemTimestamp - lastNewItemTimestamp !== period) {
        for (let i = lastNewItemTimestamp + period; i !== firstOldItemTimestamp; i += period) {
            nullTrades.push({
                open: +lastNewItem.close,
                close: +lastNewItem.close,
                time: getTime(i, period),
                timestamp: i,
                high: +lastNewItem.close,
                low: +lastNewItem.close,
                value: 0,
            });
        }
    }

    return [...processedNewData, ...nullTrades, ...oldData].sort((a, b) => a.time - b.time);
};

const LIMIT = 50;

const LightWeightChart = ({ base, counter, period }) => {
    const [loading, setLoading] = useState(false);
    const [nextLoading, setNextLoading] = useState(false);
    const [tradeAggregations, setTradeAggregations] = useState(null);
    const [nextTradeAggregations, setNextTradeAggregations] = useState(null);
    const [chart, setChart] = useState(null);
    const [histogram, setHistogram] = useState(null);
    const [candlestick, setCandlestick] = useState(null);
    const [updateId, setUpdateId] = useState(0);
    const [hoveredItem, setHoveredItem] = useState(null);

    const debouncedUpdateId = useDebounce(updateId, 700);

    const chartData = useRef(null);

    useEffect(() => {
        createLWChart();

        return () => {
            if (chart) {
                chart.unsubscribeVisibleTimeRangeChange(timeRangeHandler);
                chart.unsubscribeCrosshairMove(crosshairHandler);
            }
        };
    }, []);

    useEffect(() => {
        setNextTradeAggregations(null);
        setLoading(true);
        const endDate = Date.now();
        const startDate = endDate - AGGREGATIONS_DEPS[period];

        StellarService.getTradeAggregations(base, counter, startDate, endDate, period, LIMIT).then(
            res => {
                setTradeAggregations(res.records);
                if (res.records.length === LIMIT) {
                    setNextTradeAggregations(res.next);
                }
                setLoading(false);
            },
        );
    }, [period]);

    useEffect(() => {
        if (loading || !tradeAggregations) {
            return;
        }

        const data = processChartData(tradeAggregations, period);
        chartData.current = data;

        histogram.setData(
            data.map(item => ({
                ...item,
                color:
                    +item.open <= +item.close ? 'rgba(76, 175, 80, 0.5)' : 'rgba(239, 83, 80, 0.5)',
            })),
        );
        candlestick.setData(data);
        chart.timeScale().fitContent();
    }, [loading, tradeAggregations]);

    const createLWChart = () => {
        if (chart) {
            return;
        }

        const chartInstance = createChart('lightweight', {
            layout: { background: { color: COLORS.lightGray }, textColor: COLORS.titleText },
            rightPriceScale: {
                autoScale: true,
                invertScale: false,
                alignLabels: true,
                borderVisible: true,
                borderColor: COLORS.placeholder,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.2,
                },
            },
            timeScale: {
                rightOffset: 10,
                fixLeftEdge: false,
                lockVisibleTimeRangeOnResize: true,
                rightBarStaysOnScroll: true,
                borderVisible: true,
                borderColor: COLORS.placeholder,
                visible: true,
                timeVisible: true,
            },
            crosshair: {
                vertLine: {
                    color: COLORS.purple,
                    width: 1,
                    style: 3,
                    visible: true,
                    labelVisible: true,
                },
                horzLine: {
                    color: COLORS.purple,
                    width: 1,
                    style: 3,
                    visible: true,
                    labelVisible: true,
                },
                mode: CrosshairMode.Normal,
            },
            grid: {
                vertLines: {
                    color: COLORS.placeholder,
                    style: LineStyle.SparseDotted,
                    visible: true,
                },
                horzLines: {
                    color: COLORS.placeholder,
                    style: LineStyle.SparseDotted,
                    visible: true,
                },
            },
            localization: {
                locale: 'en-US',
            },
            handleScale: {
                axisPressedMouseMove: false,
            },
        });
        const histogramInstance = chartInstance.addHistogramSeries({
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '2',
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
            priceLineVisible: false,
            lastValueVisible: false,
        });

        const candlestickInstance = chartInstance.addCandlestickSeries({
            upColor: '#4caf50',
            downColor: '#ef5350',
            wickVisible: true,
            borderVisible: true,
            priceFormat: { type: 'price', precision: 7, minMove: 0.0000001 },
        });

        setChart(chartInstance);
        setCandlestick(candlestickInstance);
        setHistogram(histogramInstance);

        chartInstance.timeScale().subscribeVisibleTimeRangeChange(timeRangeHandler);

        chartInstance.subscribeCrosshairMove(crosshairHandler);
    };

    const timeRangeHandler = ({ from }) => {
        if (from === chartData.current[0].time) {
            setUpdateId(prevState => prevState + 1);
        }
    };

    const crosshairHandler = res => {
        const currentItem = chartData.current?.find(({ time }) => res.time === time);

        if (currentItem) {
            setHoveredItem(currentItem);
        }
    };

    const loadMore = () => {
        if (!nextTradeAggregations || nextLoading) {
            return;
        }

        setNextLoading(true);

        nextTradeAggregations.then(res => {
            setNextTradeAggregations(res.records.length === LIMIT ? res.next : null);

            const data = processNextData(res.records, chartData.current, period);

            chartData.current = data;

            histogram.setData(
                data.map(item => ({
                    ...item,
                    color:
                        +item.open <= +item.close
                            ? 'rgba(76, 175, 80, 0.5)'
                            : 'rgba(239, 83, 80, 0.5)',
                })),
            );
            candlestick.setData(data);
            setNextLoading(false);
        });
    };

    useEffect(() => {
        loadMore();
    }, [debouncedUpdateId]);

    return (
        <Chart id="lightweight">
            {hoveredItem && (
                <Statistic isUp={hoveredItem.open <= hoveredItem.close}>
                    <StatisticLabel>
                        {base.code}/{counter.code}
                    </StatisticLabel>
                    <StatisticLabel>O:</StatisticLabel>
                    <StatisticValue>{formatBalance(hoveredItem.open)}</StatisticValue>
                    <StatisticLabel>H:</StatisticLabel>
                    <StatisticValue>{formatBalance(hoveredItem.high)}</StatisticValue>
                    <StatisticLabel>L:</StatisticLabel>
                    <StatisticValue>{formatBalance(hoveredItem.low)}</StatisticValue>
                    <StatisticLabel>C:</StatisticLabel>
                    <StatisticValue>{formatBalance(hoveredItem.close)}</StatisticValue>
                    <StatisticLabel>VOL:</StatisticLabel>
                    <StatisticValue>
                        {formatBalance(hoveredItem.value, true)} {base.code}
                    </StatisticValue>
                </Statistic>
            )}
            {!tradeAggregations?.length && <Loader>No trade history found!</Loader>}
            {loading && (
                <Loader>
                    <PageLoader />
                </Loader>
            )}
        </Chart>
    );
};

export default LightWeightChart;
