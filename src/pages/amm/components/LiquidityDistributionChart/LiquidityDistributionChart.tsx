import * as d3 from 'd3';
import * as React from 'react';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

import {
    CONCENTRATED_LIQUIDITY_CHART_HEIGHT,
    CONCENTRATED_LIQUIDITY_CHART_MARGIN,
    CONCENTRATED_LIQUIDITY_CHART_WIDTH,
    CONCENTRATED_LIQUIDITY_CHART_ZOOM_MAX,
    CONCENTRATED_LIQUIDITY_CHART_ZOOM_MIN,
} from 'constants/amm';

import {
    clamp,
    formatConcentratedChartPrice,
    priceToTick,
    tickToPrice,
} from 'helpers/amm-concentrated';
import { formatBalance } from 'helpers/format-number';

import { COLORS, hexWithOpacity } from 'styles/style-constants';

import { EmptyDistribution, ZoomButton, ZoomControls } from './LiquidityDistributionChart.styled';

type DistributionItem = {
    tickLower: number;
    tickUpper: number;
    liquidity: number;
    isPreview?: boolean;
};

type PositionedDistributionItem = DistributionItem & {
    x0: number;
    x1: number;
};

type Props = {
    items: DistributionItem[];
    currentTick: number | null;
    decimalsDiff?: number;
    showControls?: boolean;
};

export type LiquidityDistributionChartHandle = {
    panLeft: () => void;
    panRight: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
};

const WIDTH = CONCENTRATED_LIQUIDITY_CHART_WIDTH;
const HEIGHT = CONCENTRATED_LIQUIDITY_CHART_HEIGHT;
const MARGIN = CONCENTRATED_LIQUIDITY_CHART_MARGIN;
const ZOOM_MIN = CONCENTRATED_LIQUIDITY_CHART_ZOOM_MIN;
const ZOOM_MAX = CONCENTRATED_LIQUIDITY_CHART_ZOOM_MAX;

const LiquidityDistributionChart = forwardRef<LiquidityDistributionChartHandle, Props>(
    ({ items, currentTick, decimalsDiff = 0, showControls = true }, ref) => {
        const svgRef = useRef<SVGSVGElement>(null);
        const dragAreaRef = useRef<SVGRectElement>(null);
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
            const currentPrice = tickToPrice(Number(currentTick), decimalsDiff);
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
                  ? Number(currentTick) - targetSpanTicks
                  : -100;
            const dataMax = items.length
                ? Math.max(...items.map(item => item.tickUpper))
                : Number.isFinite(currentTick)
                  ? Number(currentTick) + targetSpanTicks
                  : 100;

            const center = Number.isFinite(currentTick)
                ? Number(currentTick)
                : (dataMin + dataMax) / 2;
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
            setViewCenterTick(Number.isFinite(currentTick) ? Number(currentTick) : null);
        }, [initialZoom, currentTick]);

        const viewDomain = useMemo(() => {
            const span = Math.max(1, domain.max - domain.min);
            const windowSpan = Math.max(1, span / zoom);
            const halfWindow = windowSpan / 2;
            const nextCenter =
                viewCenterTick ??
                (Number.isFinite(currentTick) ? Number(currentTick) : domain.min + span / 2);
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
        const plotWidth = WIDTH - MARGIN.left - MARGIN.right;
        const getFallbackCenter = () => (Number.isFinite(currentTick) ? Number(currentTick) : 0);

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
            setViewCenterTick(Number.isFinite(currentTick) ? Number(currentTick) : null);
        };

        useImperativeHandle(
            ref,
            () => ({
                panLeft,
                panRight,
                zoomIn,
                zoomOut,
                resetView,
            }),
            [zoom, viewSpan, currentTick, initialZoom],
        );

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
                        (value ?? (Number.isFinite(currentTick) ? Number(currentTick) : 0)) +
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
                .range([MARGIN.left, WIDTH - MARGIN.right]);
            const y = d3
                .scaleLinear()
                .domain([0, maxLiquidity])
                .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

            const bars = items
                .map(item => ({
                    ...item,
                    x0: x(item.tickLower),
                    x1: x(item.tickUpper),
                }))
                .filter(item => item.x1 >= MARGIN.left && item.x0 <= WIDTH - MARGIN.right);

            const svg = d3.select(svgRef.current);
            svg.selectAll('rect.background')
                .data([null])
                .join('rect')
                .attr('class', 'background')
                .attr('x', MARGIN.left)
                .attr('y', MARGIN.top)
                .attr('width', WIDTH - MARGIN.left - MARGIN.right)
                .attr('height', HEIGHT - MARGIN.top - MARGIN.bottom)
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
                .attr('x', item => Math.max(MARGIN.left, item.x0))
                .attr('y', item => y(item.liquidity))
                .attr('width', item =>
                    Math.max(
                        2,
                        Math.min(WIDTH - MARGIN.right, item.x1) - Math.max(MARGIN.left, item.x0),
                    ),
                )
                .attr('height', item => HEIGHT - MARGIN.bottom - y(item.liquidity))
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
                .attr('y1', MARGIN.top)
                .attr('y2', HEIGHT - MARGIN.bottom)
                .attr('stroke', COLORS.purple500)
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', '4 4')
                .attr('pointer-events', 'none');

            svg.selectAll('text.current-price-label')
                .data(Number.isFinite(currentTick) ? [currentTick] : [])
                .join('text')
                .attr('class', 'current-price-label')
                .attr('x', tick => x(tick))
                .attr('y', MARGIN.top - 6)
                .attr('text-anchor', 'middle')
                .attr('fill', COLORS.purple500)
                .attr('font-size', 11)
                .attr('pointer-events', 'none')
                .text(
                    price =>
                        `Current price = ${formatConcentratedChartPrice(tickToPrice(Number(price), decimalsDiff))}`,
                );

            const xAxis = d3
                .axisBottom(x)
                .ticks(5)
                .tickFormat(value =>
                    formatConcentratedChartPrice(tickToPrice(Number(value), decimalsDiff)),
                );

            svg.selectAll<SVGGElement, null>('g.axis-x')
                .data([null])
                .join('g')
                .attr('class', 'axis-x')
                .attr('transform', `translate(0, ${HEIGHT - MARGIN.bottom})`)
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
                .attr('transform', `translate(${MARGIN.left}, 0)`)
                .call(g => g.call(yAxis))
                .call(g => g.select('.domain').attr('stroke', COLORS.gray100))
                .call(g => g.selectAll('line').attr('stroke', COLORS.gray100))
                .call(g => g.selectAll('text').attr('fill', COLORS.textGray).attr('font-size', 12))
                .attr('pointer-events', 'none');
        }, [items, currentTick, viewDomain, decimalsDiff]);

        return (
            <>
                <svg
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
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
                        x={MARGIN.left}
                        y={MARGIN.top}
                        width={plotWidth}
                        height={HEIGHT - MARGIN.top - MARGIN.bottom}
                        fill="transparent"
                        style={{
                            cursor:
                                zoom <= ZOOM_MIN ? 'default' : drag.active ? 'grabbing' : 'grab',
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
                                    (Number.isFinite(currentTick) ? Number(currentTick) : 0),
                            });
                        }}
                    />
                </svg>
                {!hasData && <EmptyDistribution>No liquidity data yet</EmptyDistribution>}
                {showControls && (
                    <ZoomControls>
                        <ZoomButton type="button" onClick={panLeft}>
                            ←
                        </ZoomButton>
                        <ZoomButton type="button" onClick={panRight}>
                            →
                        </ZoomButton>
                        <ZoomButton type="button" onClick={zoomOut}>
                            -
                        </ZoomButton>
                        <ZoomButton type="button" onClick={zoomIn}>
                            +
                        </ZoomButton>
                        <ZoomButton type="button" onClick={resetView}>
                            ↺
                        </ZoomButton>
                    </ZoomControls>
                )}
            </>
        );
    },
);

LiquidityDistributionChart.displayName = 'LiquidityDistributionChart';

export default LiquidityDistributionChart;
