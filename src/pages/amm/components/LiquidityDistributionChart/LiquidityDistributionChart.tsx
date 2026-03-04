import * as d3 from 'd3';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
    CONCENTRATED_DISTRIBUTION_REFRESH_MS,
    CONCENTRATED_LIQUIDITY_CHART_HEIGHT,
    CONCENTRATED_LIQUIDITY_CHART_MARGIN,
    CONCENTRATED_LIQUIDITY_CHART_WIDTH,
    CONCENTRATED_LIQUIDITY_CHART_ZOOM_MAX,
    CONCENTRATED_LIQUIDITY_CHART_ZOOM_MIN,
} from 'constants/amm';

import { clamp, priceToTick, tickToPrice } from 'helpers/amm-concentrated';
import {
    buildPoolLiquidityDistributionData,
    fetchUserLiquidityDistributionData,
    type DistributionItem,
} from 'helpers/amm-concentrated-liquidity-chart';
import { formatBalance } from 'helpers/format-number';

import { useUpdateIndex } from 'hooks/useUpdateIndex';

import useAuthStore from 'store/authStore/useAuthStore';

import { PoolExtended } from 'types/amm';

import PageLoader from 'basics/loaders/PageLoader';

import { COLORS, hexWithOpacity } from 'styles/style-constants';

import {
    ChartBody,
    ChartControlButton,
    ChartControls,
    ChartHeader,
    ChartLoader,
    ChartSurface,
    ChartTitle,
    EmptyDistribution,
} from './LiquidityDistributionChart.styled';

type PositionedDistributionItem = DistributionItem & {
    x0: number;
    x1: number;
};

type Props = {
    pool: PoolExtended;
    showControls?: boolean;
    dataSource?: 'pool' | 'user';
    compact?: boolean;
    title?: string;
};

const WIDTH = CONCENTRATED_LIQUIDITY_CHART_WIDTH;
const HEIGHT = CONCENTRATED_LIQUIDITY_CHART_HEIGHT;
const MARGIN = CONCENTRATED_LIQUIDITY_CHART_MARGIN;
const ZOOM_MIN = CONCENTRATED_LIQUIDITY_CHART_ZOOM_MIN;
const ZOOM_MAX = CONCENTRATED_LIQUIDITY_CHART_ZOOM_MAX;
const COMPACT_WIDTH = 560;
const COMPACT_HEIGHT = 220;
const COMPACT_MARGIN = { ...MARGIN, top: 22, right: 14, bottom: 26, left: 52 };

const LiquidityDistributionChart = ({
    pool,
    showControls = true,
    dataSource = 'pool',
    compact = false,
    title,
}: Props) => {
    const { account } = useAuthStore();
    const updateIndex = useUpdateIndex(CONCENTRATED_DISTRIBUTION_REFRESH_MS);
    const isUserSource = dataSource === 'user';
    const svgRef = useRef<SVGSVGElement>(null);
    const dragAreaRef = useRef<SVGRectElement>(null);
    const [userItems, setUserItems] = useState<DistributionItem[]>([]);
    const [userCurrentTick, setUserCurrentTick] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);
    const decimalsDiff = pool.tokens[0].decimal - pool.tokens[1].decimal;
    const chartWidth = compact ? COMPACT_WIDTH : WIDTH;
    const chartHeight = compact ? COMPACT_HEIGHT : HEIGHT;
    const chartMargin = compact ? COMPACT_MARGIN : MARGIN;

    const poolDistributionData = useMemo(
        () => buildPoolLiquidityDistributionData(pool),
        [
            pool.address,
            pool.tick_map,
            pool.current_tick,
            pool.active_liquidity,
            pool.liquidity_usd,
            pool.total_share,
        ],
    );

    useEffect(() => {
        if (!isUserSource) {
            setLoading(false);
            setReady(true);
            return;
        }

        setReady(false);
        setUserItems([]);
        setUserCurrentTick(null);
    }, [isUserSource, pool.address]);

    useEffect(() => {
        if (!isUserSource) {
            return;
        }

        let cancelled = false;

        const loadDistribution = async () => {
            const shouldShowLoader = !ready;
            if (shouldShowLoader) {
                setLoading(true);
            }

            try {
                const distribution = await fetchUserLiquidityDistributionData(
                    pool,
                    account?.accountId(),
                );

                if (cancelled) {
                    return;
                }

                setUserItems(distribution.items);
                setUserCurrentTick(distribution.currentTick);
            } catch {
                if (!cancelled) {
                    setUserItems([]);
                    setUserCurrentTick(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    setReady(true);
                }
            }
        };

        loadDistribution();

        return () => {
            cancelled = true;
        };
    }, [
        isUserSource,
        pool.address,
        pool.liquidity_usd,
        pool.total_share,
        pool.active_liquidity,
        account,
        updateIndex,
    ]);

    const items = isUserSource ? userItems : poolDistributionData.items;
    const currentTick = isUserSource ? userCurrentTick : poolDistributionData.currentTick;

    const [zoom, setZoom] = useState(1);
    const [viewCenterTick, setViewCenterTick] = useState<number | null>(null);
    const [drag, setDrag] = useState<{
        active: boolean;
        startX: number;
        startCenter: number;
    }>({ active: false, startX: 0, startCenter: 0 });

    const targetSpanTicks = useMemo(() => {
        if (!Number.isFinite(currentTick)) {
            return 200;
        }
        const currentPrice = tickToPrice(currentTick, decimalsDiff);
        if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
            return 200;
        }
        const minTick = priceToTick(currentPrice * 0.8, decimalsDiff);
        const maxTick = priceToTick(currentPrice * 1.2, decimalsDiff);
        return Math.max(1, Math.abs(maxTick - minTick));
    }, [currentTick, decimalsDiff]);

    const domain = useMemo(() => {
        const dataMin = items.length
            ? Math.min(...items.map(item => item.tickLower))
            : Number.isFinite(currentTick)
              ? currentTick - targetSpanTicks
              : -100;
        const dataMax = items.length
            ? Math.max(...items.map(item => item.tickUpper))
            : Number.isFinite(currentTick)
              ? currentTick + targetSpanTicks
              : 100;

        const center = Number.isFinite(currentTick) ? currentTick : (dataMin + dataMax) / 2;
        const min = Math.min(dataMin, center - targetSpanTicks);
        const max = Math.max(dataMax, center + targetSpanTicks);

        return { min, max: max === min ? max + 1 : max };
    }, [items, currentTick, targetSpanTicks]);

    const initialZoom = useMemo(() => {
        const domainSpan = Math.max(1, domain.max - domain.min);
        const desiredSpan = Math.max(1, targetSpanTicks);
        return clamp(domainSpan / desiredSpan, ZOOM_MIN, ZOOM_MAX);
    }, [domain, targetSpanTicks]);

    useEffect(() => {
        setZoom(initialZoom);
        setViewCenterTick(Number.isFinite(currentTick) ? currentTick : null);
    }, [initialZoom, currentTick]);

    const viewDomain = useMemo(() => {
        const span = Math.max(1, domain.max - domain.min);
        const windowSpan = Math.max(1, span / zoom);
        const halfWindow = windowSpan / 2;
        const nextCenter =
            viewCenterTick ?? (Number.isFinite(currentTick) ? currentTick : domain.min + span / 2);
        const minCenter = domain.min + halfWindow;
        const maxCenter = domain.max - halfWindow;
        const clampedCenter =
            minCenter <= maxCenter
                ? clamp(nextCenter, minCenter, maxCenter)
                : domain.min + span / 2;
        return [clampedCenter - halfWindow, clampedCenter + halfWindow] as [number, number];
    }, [domain, zoom, currentTick, viewCenterTick]);

    const hasData = items.length > 0;
    const viewSpan = Math.max(1, viewDomain[1] - viewDomain[0]);
    const plotWidth = chartWidth - chartMargin.left - chartMargin.right;
    const getFallbackCenter = () => (Number.isFinite(currentTick) ? currentTick : 0);

    const panLeft = () => {
        if (zoom <= ZOOM_MIN) return;
        setViewCenterTick(value => (value ?? getFallbackCenter()) - viewSpan * 0.25);
    };

    const panRight = () => {
        if (zoom <= ZOOM_MIN) return;
        setViewCenterTick(value => (value ?? getFallbackCenter()) + viewSpan * 0.25);
    };

    const zoomOut = () => {
        setZoom(value => Math.max(ZOOM_MIN, value / 2));
    };

    const zoomIn = () => {
        setZoom(value => Math.min(ZOOM_MAX, value * 2));
    };

    const resetView = () => {
        setZoom(initialZoom);
        setViewCenterTick(Number.isFinite(currentTick) ? currentTick : null);
    };

    useEffect(() => {
        if (!drag.active || zoom <= ZOOM_MIN) {
            return;
        }

        const onMouseMove = (event: MouseEvent) => {
            const rect = dragAreaRef.current?.getBoundingClientRect();
            if (!rect) {
                return;
            }
            const plotWidthPx = rect.width || 1;
            const ticksPerPixel = viewSpan / plotWidthPx;
            const dx = event.clientX - drag.startX;
            setViewCenterTick(drag.startCenter - dx * ticksPerPixel);
        };

        const onMouseUp = () => {
            setDrag(prev => ({ ...prev, active: false }));
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [drag, zoom, viewSpan]);

    useEffect(() => {
        const node = svgRef.current;
        if (!node) {
            return;
        }

        const onWheel = (event: WheelEvent) => {
            if (zoom <= ZOOM_MIN) {
                return;
            }
            event.preventDefault();
            const delta =
                Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
            const ticksPerPixel = viewSpan / plotWidth;
            setViewCenterTick(
                value =>
                    (value ?? (Number.isFinite(currentTick) ? currentTick : 0)) +
                    delta * ticksPerPixel * 0.8,
            );
        };

        node.addEventListener('wheel', onWheel, { passive: false });

        return () => {
            node.removeEventListener('wheel', onWheel);
        };
    }, [zoom, viewSpan, plotWidth, currentTick]);

    useEffect(() => {
        if (!svgRef.current) {
            return;
        }

        const maxLiquidity = d3.max(items, item => item.liquidity) || 1;

        const x = d3
            .scaleLinear()
            .domain(viewDomain)
            .range([chartMargin.left, chartWidth - chartMargin.right]);
        const y = d3
            .scaleLinear()
            .domain([0, maxLiquidity])
            .range([chartHeight - chartMargin.bottom, chartMargin.top]);

        const bars = items
            .map(item => ({
                ...item,
                x0: x(item.tickLower),
                x1: x(item.tickUpper),
            }))
            .filter(
                item => item.x1 >= chartMargin.left && item.x0 <= chartWidth - chartMargin.right,
            );

        const svg = d3.select(svgRef.current);
        svg.selectAll('rect.background')
            .data([null])
            .join('rect')
            .attr('class', 'background')
            .attr('x', chartMargin.left)
            .attr('y', chartMargin.top)
            .attr('width', chartWidth - chartMargin.left - chartMargin.right)
            .attr('height', chartHeight - chartMargin.top - chartMargin.bottom)
            .attr('fill', COLORS.gray50)
            .attr('rx', 8)
            .attr('pointer-events', 'none');

        const plot = svg
            .selectAll<SVGGElement, null>('g.plot')
            .data([null])
            .join('g')
            .attr('class', 'plot');

        plot.selectAll<SVGRectElement, PositionedDistributionItem>('rect.bar')
            .data(bars, item => `${item.tickLower}-${item.tickUpper}-${item.isPreview ? 1 : 0}`)
            .join('rect')
            .attr('class', 'bar')
            .attr('x', item => Math.max(chartMargin.left, item.x0))
            .attr('y', item => y(item.liquidity))
            .attr('width', item =>
                Math.max(
                    2,
                    Math.min(chartWidth - chartMargin.right, item.x1) -
                        Math.max(chartMargin.left, item.x0),
                ),
            )
            .attr('height', item => chartHeight - chartMargin.bottom - y(item.liquidity))
            .attr('fill', item =>
                item.isPreview
                    ? hexWithOpacity(COLORS.purple500, 75)
                    : hexWithOpacity(COLORS.purple500, 35),
            )
            .attr('rx', 2)
            .attr('pointer-events', 'none');

        svg.selectAll('line.current-price')
            .data(Number.isFinite(currentTick) ? [currentTick] : [])
            .join('line')
            .attr('class', 'current-price')
            .attr('x1', tick => x(tick))
            .attr('x2', tick => x(tick))
            .attr('y1', chartMargin.top)
            .attr('y2', chartHeight - chartMargin.bottom)
            .attr('stroke', COLORS.purple500)
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '4 4')
            .attr('pointer-events', 'none');

        svg.selectAll('text.current-price-label')
            .data(Number.isFinite(currentTick) ? [currentTick] : [])
            .join('text')
            .attr('class', 'current-price-label')
            .attr('x', tick => x(tick))
            .attr('y', chartMargin.top - 6)
            .attr('text-anchor', 'middle')
            .attr('fill', COLORS.purple500)
            .attr('font-size', 11)
            .attr('pointer-events', 'none')
            .text(
                price =>
                    `Current price = ${formatBalance(
                        tickToPrice(Number(price), decimalsDiff),
                        true,
                    )}`,
            );

        const xAxis = d3
            .axisBottom(x)
            .ticks(5)
            .tickFormat(value => formatBalance(tickToPrice(Number(value), decimalsDiff), true));

        svg.selectAll<SVGGElement, null>('g.axis-x')
            .data([null])
            .join('g')
            .attr('class', 'axis-x')
            .attr('transform', `translate(0, ${chartHeight - chartMargin.bottom})`)
            .call(g => g.call(xAxis))
            .call(g => g.select('.domain').attr('stroke', COLORS.gray100))
            .call(g => g.selectAll('line').attr('stroke', COLORS.gray100))
            .call(g => g.selectAll('text').attr('fill', COLORS.textGray).attr('font-size', 12))
            .attr('pointer-events', 'none');

        const yAxis = d3
            .axisLeft(y)
            .ticks(4)
            .tickFormat(value => `$${formatBalance(Number(value), true, true)}`);

        svg.selectAll<SVGGElement, null>('g.axis-y')
            .data([null])
            .join('g')
            .attr('class', 'axis-y')
            .attr('transform', `translate(${chartMargin.left}, 0)`)
            .call(g => g.call(yAxis))
            .call(g => g.select('.domain').attr('stroke', COLORS.gray100))
            .call(g => g.selectAll('line').attr('stroke', COLORS.gray100))
            .call(g => g.selectAll('text').attr('fill', COLORS.textGray).attr('font-size', 12))
            .attr('pointer-events', 'none');
    }, [items, currentTick, viewDomain, decimalsDiff, chartWidth, chartHeight, chartMargin]);

    const emptyMessage =
        isUserSource && !account
            ? 'Connect wallet to see your liquidity distribution'
            : 'No liquidity data yet';
    const chartTitle =
        title || (isUserSource ? 'My Liquidity Positions' : 'Liquidity Distribution');

    const controls = showControls ? (
        <ChartControls>
            <ChartControlButton type="button" onClick={panLeft}>
                ←
            </ChartControlButton>
            <ChartControlButton type="button" onClick={panRight}>
                →
            </ChartControlButton>
            <ChartControlButton type="button" onClick={zoomOut}>
                -
            </ChartControlButton>
            <ChartControlButton type="button" onClick={zoomIn}>
                +
            </ChartControlButton>
            <ChartControlButton type="button" onClick={resetView}>
                ↺
            </ChartControlButton>
        </ChartControls>
    ) : null;

    return (
        <ChartSurface>
            <ChartHeader>
                <ChartTitle $compact={compact}>{chartTitle}</ChartTitle>
                {controls}
            </ChartHeader>
            <ChartBody $compact={compact}>
                {loading && !ready ? (
                    <ChartLoader>
                        <PageLoader />
                    </ChartLoader>
                ) : !hasData ? (
                    <EmptyDistribution>{emptyMessage}</EmptyDistribution>
                ) : (
                    <svg
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                        preserveAspectRatio="none"
                        ref={svgRef}
                        tabIndex={0}
                        style={{ width: '100%', height: '100%', display: 'block' }}
                        onKeyDown={event => {
                            if (zoom <= ZOOM_MIN) {
                                return;
                            }
                            if (event.key === 'ArrowLeft') {
                                event.preventDefault();
                                panLeft();
                            }
                            if (event.key === 'ArrowRight') {
                                event.preventDefault();
                                panRight();
                            }
                        }}
                        onMouseUp={() => setDrag(prev => ({ ...prev, active: false }))}
                        onMouseLeave={() => setDrag(prev => ({ ...prev, active: false }))}
                    >
                        <rect
                            ref={dragAreaRef}
                            x={chartMargin.left}
                            y={chartMargin.top}
                            width={plotWidth}
                            height={chartHeight - chartMargin.top - chartMargin.bottom}
                            fill="transparent"
                            style={{
                                cursor:
                                    zoom <= ZOOM_MIN
                                        ? 'default'
                                        : drag.active
                                          ? 'grabbing'
                                          : 'grab',
                            }}
                            onMouseDown={event => {
                                if (zoom <= ZOOM_MIN) {
                                    return;
                                }
                                setDrag({
                                    active: true,
                                    startX: event.clientX,
                                    startCenter:
                                        viewCenterTick ??
                                        (Number.isFinite(currentTick) ? currentTick : 0),
                                });
                            }}
                        />
                    </svg>
                )}
            </ChartBody>
        </ChartSurface>
    );
};

export default LiquidityDistributionChart;
