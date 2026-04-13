import * as d3 from 'd3';
import * as React from 'react';
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

import {
    CONCENTRATED_DISTRIBUTION_REFRESH_MS,
    CONCENTRATED_LIQUIDITY_CHART_HEIGHT,
    CONCENTRATED_LIQUIDITY_CHART_MARGIN,
    CONCENTRATED_LIQUIDITY_CHART_WIDTH,
    CONCENTRATED_LIQUIDITY_CHART_ZOOM_MAX,
    CONCENTRATED_LIQUIDITY_CHART_ZOOM_MIN,
} from 'constants/amm';

import { clamp, priceToTick, snapDown, snapUp, tickToPrice } from 'helpers/amm-concentrated';
import {
    buildPoolLiquidityDistributionData,
    fetchUserLiquidityDistributionData,
} from 'helpers/amm-concentrated-liquidity-chart';
import { formatBalance } from 'helpers/format-number';

import { useUpdateIndex } from 'hooks/useUpdateIndex';

import useAuthStore from 'store/authStore/useAuthStore';

import { PoolExtended } from 'types/amm';
import {
    DistributionItem,
    UserDistributionPositionDetail,
} from 'types/amm-concentrated-liquidity-chart';

import PageLoader from 'basics/loaders/PageLoader';

import { COLORS, hexWithOpacity } from 'styles/style-constants';

import {
    ChartBody,
    ChartControlButton,
    ChartControls,
    ChartHeader,
    ChartLoader,
    ChartSurface,
    ChartTooltip,
    ChartTooltipStack,
    ChartTitle,
    EmptyDistribution,
} from './LiquidityDistributionChart.styled';

import ConcentratedPositionCard from '../ConcentratedLiquidity/components/ConcentratedPositionCard/ConcentratedPositionCard';

type PositionedDistributionItem = DistributionItem & {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
};

type Props = {
    pool: PoolExtended;
    showControls?: boolean;
    dataSource?: 'pool' | 'user';
    compact?: boolean;
    title?: string;
    currentTickOverride?: number | null;
    selectableRange?: {
        tickLower: number | null;
        tickUpper: number | null;
        tickSpacing: number | null;
        minTickBound: number;
        maxTickBound: number;
        disabled?: boolean;
        onChange: (tickLower: number, tickUpper: number) => void;
    } | null;
};

export type LiquidityDistributionChartHandle = {
    resetView: () => void;
};

const WIDTH = CONCENTRATED_LIQUIDITY_CHART_WIDTH;
const HEIGHT = CONCENTRATED_LIQUIDITY_CHART_HEIGHT;
const MARGIN = CONCENTRATED_LIQUIDITY_CHART_MARGIN;
const ZOOM_MIN = CONCENTRATED_LIQUIDITY_CHART_ZOOM_MIN;
const ZOOM_MAX = CONCENTRATED_LIQUIDITY_CHART_ZOOM_MAX;
const COMPACT_WIDTH = 560;
const COMPACT_HEIGHT = 220;
const DEFAULT_MARGIN = { ...MARGIN, left: 28 };
const COMPACT_MARGIN = { ...MARGIN, top: 22, right: 14, bottom: 26, left: 10 };

const LiquidityDistributionChart = React.forwardRef<LiquidityDistributionChartHandle, Props>(
    (
        {
            pool,
            showControls = true,
            dataSource = 'pool',
            compact = false,
            title,
            currentTickOverride = null,
            selectableRange = null,
        }: Props,
        ref,
    ) => {
        const { account } = useAuthStore();
        const updateIndex = useUpdateIndex(CONCENTRATED_DISTRIBUTION_REFRESH_MS);
        const isUserSource = dataSource === 'user';
        const chartBodyRef = useRef<HTMLDivElement>(null);
        const svgRef = useRef<SVGSVGElement>(null);
        const [userItems, setUserItems] = useState<DistributionItem[]>([]);
        const [userPositionDetails, setUserPositionDetails] = useState<
            UserDistributionPositionDetail[]
        >([]);
        const [userCurrentTick, setUserCurrentTick] = useState<number | null>(null);
        const [loading, setLoading] = useState(false);
        const [ready, setReady] = useState(false);
        const [rangeDragHandle, setRangeDragHandle] = useState<'lower' | 'upper' | null>(null);
        const [hoveredPositionKeys, setHoveredPositionKeys] = useState<string[]>([]);
        const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(
            null,
        );
        const decimalsDiff = pool.tokens[0].decimal - pool.tokens[1].decimal;
        const [chartSize, setChartSize] = useState({
            width: compact ? COMPACT_WIDTH : WIDTH,
            height: compact ? COMPACT_HEIGHT : HEIGHT,
        });
        const chartWidth = chartSize.width;
        const chartHeight = chartSize.height;
        const chartMargin = compact ? COMPACT_MARGIN : DEFAULT_MARGIN;

        const poolDistributionData = useMemo(
            () => buildPoolLiquidityDistributionData(pool),
            [
                pool.address,
                pool.tick_map,
                pool.current_tick,
                pool.active_liquidity,
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
            setUserPositionDetails([]);
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
                    setUserPositionDetails(distribution.positionDetails || []);
                    setUserCurrentTick(distribution.currentTick);
                } catch {
                    if (!cancelled) {
                        setUserItems([]);
                        setUserPositionDetails([]);
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
            pool.total_share,
            pool.active_liquidity,
            account,
            updateIndex,
        ]);

        useEffect(() => {
            const updateChartSize = () => {
                if (!chartBodyRef.current) {
                    return;
                }

                const computedStyle = window.getComputedStyle(chartBodyRef.current);
                const horizontalPadding =
                    parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
                const verticalPadding =
                    parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);

                const nextWidth = Math.max(
                    240,
                    Math.round(chartBodyRef.current.offsetWidth - horizontalPadding),
                );
                const nextHeight = Math.max(
                    160,
                    Math.round(chartBodyRef.current.offsetHeight - verticalPadding),
                );

                setChartSize(current =>
                    current.width === nextWidth && current.height === nextHeight
                        ? current
                        : { width: nextWidth, height: nextHeight },
                );
            };

            updateChartSize();

            const handleResize = () => {
                requestAnimationFrame(updateChartSize);
            };

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }, [compact, ready]);

        const items = isUserSource ? userItems : poolDistributionData.items;
        const currentTick =
            currentTickOverride ??
            (isUserSource ? userCurrentTick : poolDistributionData.currentTick);

        const [zoom, setZoom] = useState(1);
        const [viewCenterTick, setViewCenterTick] = useState<number | null>(null);
        const [hasManualViewport, setHasManualViewport] = useState(false);
        const [drag, setDrag] = useState<{
            active: boolean;
            startX: number;
            startCenter: number;
        }>({ active: false, startX: 0, startCenter: 0 });

        const selectedRangeCenterTick = useMemo(() => {
            if (
                !selectableRange ||
                selectableRange.tickLower === null ||
                selectableRange.tickUpper === null
            ) {
                return null;
            }

            return (selectableRange.tickLower + selectableRange.tickUpper) / 2;
        }, [selectableRange]);

        const userPositionsSpanTicks = useMemo(() => {
            if (!isUserSource || !items.length) {
                return null;
            }

            const minTick = Math.min(...items.map(item => item.tickLower));
            const maxTick = Math.max(...items.map(item => item.tickUpper));

            return Math.max(1, maxTick - minTick);
        }, [isUserSource, items]);

        const defaultCenterTick = useMemo(() => {
            if (Number.isFinite(selectedRangeCenterTick)) {
                return selectedRangeCenterTick;
            }

            if (isUserSource && items.length) {
                const minTick = Math.min(...items.map(item => item.tickLower));
                const maxTick = Math.max(...items.map(item => item.tickUpper));

                return (minTick + maxTick) / 2;
            }

            return Number.isFinite(currentTick) ? currentTick : null;
        }, [currentTick, isUserSource, items, selectedRangeCenterTick]);

        const targetSpanTicks = useMemo(() => {
            if (
                selectableRange &&
                selectableRange.tickLower !== null &&
                selectableRange.tickUpper !== null
            ) {
                const selectedSpan = Math.max(
                    1,
                    selectableRange.tickUpper - selectableRange.tickLower,
                );
                return Math.max(1, Math.ceil(selectedSpan * (compact ? 1.12 : 1.18)));
            }

            if (isUserSource && userPositionsSpanTicks !== null) {
                return Math.max(1, Math.ceil(userPositionsSpanTicks * (compact ? 1.12 : 1.18)));
            }

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
        }, [
            selectableRange,
            isUserSource,
            userPositionsSpanTicks,
            currentTick,
            decimalsDiff,
            compact,
        ]);

        const domain = useMemo(() => {
            if (selectableRange) {
                const boundMin = Math.min(
                    selectableRange.minTickBound,
                    selectableRange.maxTickBound,
                );
                const boundMax = Math.max(
                    selectableRange.minTickBound,
                    selectableRange.maxTickBound,
                );

                return {
                    min: boundMin,
                    max: boundMax === boundMin ? boundMax + 1 : boundMax,
                };
            }

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
            const referenceMin = Number.isFinite(currentTick)
                ? Math.min(dataMin, currentTick)
                : dataMin;
            const referenceMax = Number.isFinite(currentTick)
                ? Math.max(dataMax, currentTick)
                : dataMax;

            const center =
                defaultCenterTick !== null ? defaultCenterTick : (referenceMin + referenceMax) / 2;
            const min = Math.min(referenceMin, center - targetSpanTicks);
            const max = Math.max(referenceMax, center + targetSpanTicks);

            return { min, max: max === min ? max + 1 : max };
        }, [items, currentTick, targetSpanTicks, defaultCenterTick, selectableRange]);

        const initialZoom = useMemo(() => {
            if (isUserSource && !selectableRange) {
                return ZOOM_MIN;
            }

            const domainSpan = Math.max(1, domain.max - domain.min);
            const desiredSpan = Math.max(1, targetSpanTicks);
            return clamp(domainSpan / desiredSpan, ZOOM_MIN, ZOOM_MAX);
        }, [domain, isUserSource, selectableRange, targetSpanTicks]);

        useEffect(() => {
            if (rangeDragHandle || hasManualViewport) {
                return;
            }

            setZoom(initialZoom);
            setViewCenterTick(defaultCenterTick);
        }, [initialZoom, defaultCenterTick, rangeDragHandle, hasManualViewport]);

        useEffect(() => {
            setHasManualViewport(false);
        }, [pool.address, selectableRange?.minTickBound, selectableRange?.maxTickBound]);

        const viewDomain = useMemo(() => {
            const span = Math.max(1, domain.max - domain.min);
            const windowSpan = Math.max(1, span / zoom);
            const halfWindow = windowSpan / 2;
            const nextCenter =
                viewCenterTick ??
                (Number.isFinite(currentTick) ? currentTick : domain.min + span / 2);
            const minCenter = domain.min + halfWindow;
            const maxCenter = domain.max - halfWindow;
            const clampedCenter =
                minCenter <= maxCenter
                    ? clamp(nextCenter, minCenter, maxCenter)
                    : domain.min + span / 2;
            return [clampedCenter - halfWindow, clampedCenter + halfWindow] as [number, number];
        }, [domain, zoom, currentTick, viewCenterTick]);

        const xAxisTickValues = useMemo(() => {
            if (!selectableRange || selectableRange.tickSpacing === null) {
                return null;
            }

            const [domainMin, domainMax] = viewDomain;
            const span = Math.max(1, domainMax - domainMin);
            const targetTickCount = compact ? 4 : 5;
            const rawStep = span / Math.max(1, targetTickCount - 1);
            const tickStep = Math.max(
                selectableRange.tickSpacing,
                Math.ceil(rawStep / selectableRange.tickSpacing) * selectableRange.tickSpacing,
            );
            const tickValues = new Set<number>([domainMin, domainMax]);

            for (let tick = snapUp(domainMin, tickStep); tick < domainMax; tick += tickStep) {
                tickValues.add(tick);
            }

            return [...tickValues].sort((a, b) => a - b);
        }, [compact, selectableRange, viewDomain]);

        const displayedXAxisTickValues = useMemo(() => {
            const [domainMin, domainMax] = viewDomain;
            const candidateTicks = (
                xAxisTickValues ?? d3.ticks(domainMin, domainMax, zoom < 4 ? 3 : compact ? 4 : 5)
            ).sort((a, b) => a - b);
            const innerTicks =
                candidateTicks.length > 2 ? candidateTicks.slice(1, -1) : candidateTicks;
            const limitedTicks =
                zoom < 4 && innerTicks.length > 3
                    ? [
                          innerTicks[0],
                          innerTicks[Math.floor((innerTicks.length - 1) / 2)],
                          innerTicks[innerTicks.length - 1],
                      ]
                    : innerTicks;
            const seenLabels = new Set<string>();

            return limitedTicks.filter(tick => {
                const label = formatBalance(tickToPrice(Number(tick), decimalsDiff), true, true);

                if (seenLabels.has(label)) {
                    return false;
                }

                seenLabels.add(label);
                return true;
            });
        }, [compact, decimalsDiff, viewDomain, xAxisTickValues, zoom]);

        const hasData = items.length > 0;
        const viewSpan = Math.max(1, viewDomain[1] - viewDomain[0]);
        const plotWidth = chartWidth - chartMargin.left - chartMargin.right;
        const maxLiquidity = d3.max(items, item => item.liquidity) || 1;
        const x = useMemo(
            () =>
                d3
                    .scaleLinear()
                    .domain(viewDomain)
                    .range([chartMargin.left, chartWidth - chartMargin.right]),
            [viewDomain, chartMargin.left, chartMargin.right, chartWidth],
        );
        const y = useMemo(
            () =>
                d3
                    .scaleLinear()
                    .domain([0, maxLiquidity])
                    .range([chartHeight - chartMargin.bottom, chartMargin.top]),
            [maxLiquidity, chartHeight, chartMargin.bottom, chartMargin.top],
        );
        const bars = useMemo(
            () =>
                items
                    .map(item => ({
                        ...item,
                        x0: x(item.tickLower),
                        x1: x(item.tickUpper),
                        y0: y(item.liquidity),
                        y1: chartHeight - chartMargin.bottom,
                    }))
                    .filter(
                        item =>
                            item.x1 >= chartMargin.left &&
                            item.x0 <= chartWidth - chartMargin.right,
                    ),
            [
                items,
                x,
                y,
                chartHeight,
                chartMargin.bottom,
                chartMargin.left,
                chartWidth,
                chartMargin.right,
            ],
        );
        const getFallbackCenter = () => (Number.isFinite(currentTick) ? currentTick : 0);
        const canPanByDrag = zoom > ZOOM_MIN;
        const hoveredPositionDetails = useMemo(() => {
            if (!hoveredPositionKeys.length) {
                return [];
            }

            const detailsMap = new Map(userPositionDetails.map(item => [item.key, item]));

            return hoveredPositionKeys
                .map(key => detailsMap.get(key))
                .filter(Boolean) as UserDistributionPositionDetail[];
        }, [hoveredPositionKeys, userPositionDetails]);
        const getPlotClientBounds = () => {
            const svgRect = svgRef.current?.getBoundingClientRect();
            if (!svgRect) {
                return null;
            }

            const left = svgRect.left + (chartMargin.left / chartWidth) * svgRect.width;
            const right =
                svgRect.left + ((chartWidth - chartMargin.right) / chartWidth) * svgRect.width;

            return {
                left,
                width: Math.max(1, right - left),
            };
        };

        const panLeft = () => {
            if (zoom <= ZOOM_MIN) return;
            setHasManualViewport(true);
            setViewCenterTick(value => (value ?? getFallbackCenter()) - viewSpan * 0.25);
        };

        const panRight = () => {
            if (zoom <= ZOOM_MIN) return;
            setHasManualViewport(true);
            setViewCenterTick(value => (value ?? getFallbackCenter()) + viewSpan * 0.25);
        };

        const zoomOut = () => {
            setHasManualViewport(true);
            setZoom(value => Math.max(ZOOM_MIN, value / 2));
        };

        const zoomIn = () => {
            setHasManualViewport(true);
            setZoom(value => Math.min(ZOOM_MAX, value * 2));
        };

        const resetView = useCallback(() => {
            setHasManualViewport(false);
            setZoom(initialZoom);
            setViewCenterTick(defaultCenterTick);
        }, [defaultCenterTick, initialZoom]);

        useImperativeHandle(
            ref,
            () => ({
                resetView,
            }),
            [resetView],
        );

        const panChartToClientX = useCallback(
            (clientX: number) => {
                const plotBounds = getPlotClientBounds();
                if (!plotBounds) {
                    return;
                }

                const ticksPerPixel = viewSpan / plotBounds.width;
                const dx = clientX - drag.startX;
                setHasManualViewport(true);
                setViewCenterTick(drag.startCenter - dx * ticksPerPixel);
            },
            [drag.startCenter, drag.startX, viewSpan],
        );

        const dragRangeToClientX = useCallback(
            (clientX: number) => {
                if (!rangeDragHandle || !selectableRange || selectableRange.tickSpacing === null) {
                    return;
                }

                const plotBounds = getPlotClientBounds();
                if (!plotBounds) {
                    return;
                }

                const relativeX = clamp(clientX - plotBounds.left, 0, plotBounds.width);
                const nextTick = viewDomain[0] + (relativeX / plotBounds.width) * viewSpan;

                if (rangeDragHandle === 'lower') {
                    const nextLower = clamp(
                        snapDown(nextTick, selectableRange.tickSpacing),
                        selectableRange.minTickBound,
                        (selectableRange.tickUpper ?? selectableRange.maxTickBound) -
                            selectableRange.tickSpacing,
                    );
                    selectableRange.onChange(
                        nextLower,
                        selectableRange.tickUpper ?? selectableRange.maxTickBound,
                    );
                    return;
                }

                const nextUpper = clamp(
                    snapUp(nextTick, selectableRange.tickSpacing),
                    (selectableRange.tickLower ?? selectableRange.minTickBound) +
                        selectableRange.tickSpacing,
                    selectableRange.maxTickBound,
                );
                selectableRange.onChange(
                    selectableRange.tickLower ?? selectableRange.minTickBound,
                    nextUpper,
                );
            },
            [rangeDragHandle, selectableRange, viewDomain, viewSpan],
        );

        useEffect(() => {
            if (!drag.active || !canPanByDrag || rangeDragHandle) {
                return;
            }

            const onMouseMove = (event: MouseEvent) => {
                panChartToClientX(event.clientX);
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
        }, [drag.active, canPanByDrag, rangeDragHandle, panChartToClientX]);

        useEffect(() => {
            if (!drag.active || !canPanByDrag || rangeDragHandle) {
                return;
            }

            const onTouchMove = (event: TouchEvent) => {
                const touch = event.touches[0];
                if (!touch) {
                    return;
                }

                event.preventDefault();
                panChartToClientX(touch.clientX);
            };

            const onTouchEnd = () => {
                setDrag(prev => ({ ...prev, active: false }));
            };

            window.addEventListener('touchmove', onTouchMove, { passive: false });
            window.addEventListener('touchend', onTouchEnd);
            window.addEventListener('touchcancel', onTouchEnd);

            return () => {
                window.removeEventListener('touchmove', onTouchMove);
                window.removeEventListener('touchend', onTouchEnd);
                window.removeEventListener('touchcancel', onTouchEnd);
            };
        }, [drag.active, canPanByDrag, rangeDragHandle, panChartToClientX]);

        useEffect(() => {
            if (!rangeDragHandle || !selectableRange || selectableRange.tickSpacing === null) {
                return;
            }

            const onMouseMove = (event: MouseEvent) => {
                dragRangeToClientX(event.clientX);
            };

            const onMouseUp = () => {
                setRangeDragHandle(null);
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);

            return () => {
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
            };
        }, [rangeDragHandle, selectableRange, dragRangeToClientX]);

        useEffect(() => {
            if (!rangeDragHandle || !selectableRange || selectableRange.tickSpacing === null) {
                return;
            }

            const onTouchMove = (event: TouchEvent) => {
                const touch = event.touches[0];
                if (!touch) {
                    return;
                }

                event.preventDefault();
                dragRangeToClientX(touch.clientX);
            };

            const onTouchEnd = () => {
                setRangeDragHandle(null);
            };

            window.addEventListener('touchmove', onTouchMove, { passive: false });
            window.addEventListener('touchend', onTouchEnd);
            window.addEventListener('touchcancel', onTouchEnd);

            return () => {
                window.removeEventListener('touchmove', onTouchMove);
                window.removeEventListener('touchend', onTouchEnd);
                window.removeEventListener('touchcancel', onTouchEnd);
            };
        }, [rangeDragHandle, selectableRange, dragRangeToClientX]);

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
                setHasManualViewport(true);
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

            plot.selectAll<SVGRectElement, { x0: number; x1: number }>('rect.selected-range')
                .data(
                    selectableRange &&
                        selectableRange.tickLower !== null &&
                        selectableRange.tickUpper !== null
                        ? [
                              {
                                  x0: x(selectableRange.tickLower),
                                  x1: x(selectableRange.tickUpper),
                              },
                          ]
                        : [],
                )
                .join('rect')
                .attr('class', 'selected-range')
                .attr('x', item => Math.max(chartMargin.left, Math.min(item.x0, item.x1)))
                .attr('y', chartMargin.top)
                .attr('width', item =>
                    Math.max(
                        0,
                        Math.min(chartWidth - chartMargin.right, Math.max(item.x0, item.x1)) -
                            Math.max(chartMargin.left, Math.min(item.x0, item.x1)),
                    ),
                )
                .attr('height', chartHeight - chartMargin.top - chartMargin.bottom)
                .attr('fill', hexWithOpacity(COLORS.purple500, 10))
                .attr('pointer-events', 'none');

            plot.selectAll<SVGRectElement, PositionedDistributionItem>('rect.bar')
                .data(bars, item => `${item.tickLower}-${item.tickUpper}-${item.isPreview ? 1 : 0}`)
                .join('rect')
                .attr('class', 'bar')
                .attr('x', item => Math.max(chartMargin.left, item.x0))
                .attr('y', item => item.y0)
                .attr('width', item =>
                    Math.max(
                        2,
                        Math.min(chartWidth - chartMargin.right, item.x1) -
                            Math.max(chartMargin.left, item.x0),
                    ),
                )
                .attr('height', item => item.y1 - item.y0)
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
                        )} ${pool.tokens[0].code}/${pool.tokens[1].code}`,
                );

            const rangeBoundaries =
                selectableRange &&
                selectableRange.tickLower !== null &&
                selectableRange.tickUpper !== null
                    ? [
                          { kind: 'lower' as const, tick: selectableRange.tickLower },
                          { kind: 'upper' as const, tick: selectableRange.tickUpper },
                      ]
                    : [];
            const currentPriceValue = Number.isFinite(currentTick)
                ? tickToPrice(Number(currentTick), decimalsDiff)
                : null;
            const formatRangeChangeLabel = (percentChange: number) => {
                if (percentChange >= 1000) {
                    return `>1,000%`;
                }

                return `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%`;
            };
            const rangeChangeBadges =
                currentPriceValue && Number.isFinite(currentPriceValue) && currentPriceValue > 0
                    ? rangeBoundaries.map(item => {
                          const tickPrice = tickToPrice(item.tick, decimalsDiff);
                          const percentChange =
                              ((tickPrice - currentPriceValue) / currentPriceValue) * 100;

                          return {
                              ...item,
                              label: formatRangeChangeLabel(percentChange),
                          };
                      })
                    : [];

            const handles = svg
                .selectAll<SVGGElement, (typeof rangeBoundaries)[number]>('g.range-handle')
                .data(rangeBoundaries, item => item.kind)
                .join(enter => {
                    const group = enter.append('g').attr('class', 'range-handle');
                    group.append('rect').attr('class', 'range-handle-hitbox');
                    group.append('path').attr('class', 'range-handle-bg');
                    group.append('line').attr('class', 'range-handle-grip-1');
                    group.append('line').attr('class', 'range-handle-grip-2');
                    return group;
                });

            const handleWidth = 10;
            const handleHeight = 26;
            const handleY = chartMargin.top;
            const handleGripHeight = 12;
            const handleGripTop = handleY + (handleHeight - handleGripHeight) / 2;
            const handleGripBottom = handleGripTop + handleGripHeight;
            const handleGripOffset = 1.5;
            const handleGripCenter = handleWidth / 2;
            const handleGripShift = 0.5;
            const handleRadius = 3;
            const getHandleTranslateX = (kind: 'lower' | 'upper', tick: number) =>
                kind === 'lower' ? x(tick) - handleWidth : x(tick);
            const getHandlePath = (kind: 'lower' | 'upper') => {
                if (kind === 'lower') {
                    return [
                        `M ${handleRadius} ${handleY}`,
                        `L ${handleWidth} ${handleY}`,
                        `L ${handleWidth} ${handleY + handleHeight}`,
                        `L ${handleRadius} ${handleY + handleHeight}`,
                        `Q 0 ${handleY + handleHeight} 0 ${handleY + handleHeight - handleRadius}`,
                        `L 0 ${handleY + handleRadius}`,
                        `Q 0 ${handleY} ${handleRadius} ${handleY}`,
                        'Z',
                    ].join(' ');
                }

                return [
                    `M 0 ${handleY}`,
                    `L ${handleWidth - handleRadius} ${handleY}`,
                    `Q ${handleWidth} ${handleY} ${handleWidth} ${handleY + handleRadius}`,
                    `L ${handleWidth} ${handleY + handleHeight - handleRadius}`,
                    `Q ${handleWidth} ${handleY + handleHeight} ${handleWidth - handleRadius} ${handleY + handleHeight}`,
                    `L 0 ${handleY + handleHeight}`,
                    'Z',
                ].join(' ');
            };

            svg.selectAll<SVGLineElement, (typeof rangeBoundaries)[number]>('line.range-boundary')
                .data(rangeBoundaries, item => item.kind)
                .join('line')
                .attr('class', 'range-boundary')
                .attr('x1', item => x(item.tick))
                .attr('x2', item => x(item.tick))
                .attr('y1', handleY)
                .attr('y2', chartHeight - chartMargin.bottom)
                .attr('stroke', COLORS.purple500)
                .attr('stroke-width', 2)
                .attr('pointer-events', 'none');

            handles
                .attr(
                    'transform',
                    item => `translate(${getHandleTranslateX(item.kind, item.tick)}, 0)`,
                )
                .style(
                    'cursor',
                    selectableRange?.disabled || selectableRange?.tickSpacing === null
                        ? 'default'
                        : 'ew-resize',
                )
                .on('mousedown', (event, item) => {
                    if (selectableRange?.disabled || selectableRange?.tickSpacing === null) {
                        return;
                    }
                    event.preventDefault();
                    event.stopPropagation();
                    setHasManualViewport(true);
                    setRangeDragHandle(item.kind);
                })
                .on('touchstart', (event, item) => {
                    if (selectableRange?.disabled || selectableRange?.tickSpacing === null) {
                        return;
                    }
                    event.preventDefault();
                    event.stopPropagation();
                    setHasManualViewport(true);
                    setRangeDragHandle(item.kind);
                });

            handles
                .select<SVGRectElement>('rect.range-handle-hitbox')
                .attr('x', item => (item.kind === 'lower' ? -10 : -12))
                .attr('y', handleY - 8)
                .attr('width', handleWidth + 24)
                .attr('height', handleHeight + 16)
                .attr('rx', 10)
                .attr('fill', 'rgba(0,0,0,0.001)')
                .attr('pointer-events', 'all');

            handles
                .select<SVGPathElement>('path.range-handle-bg')
                .attr('d', item => getHandlePath(item.kind))
                .attr('fill', COLORS.purple500)
                .attr('pointer-events', 'none');

            handles
                .select<SVGLineElement>('line.range-handle-grip-1')
                .attr('x1', item =>
                    item.kind === 'lower'
                        ? handleGripCenter - handleGripOffset + handleGripShift
                        : handleGripCenter - handleGripOffset - handleGripShift,
                )
                .attr('x2', item =>
                    item.kind === 'lower'
                        ? handleGripCenter - handleGripOffset + handleGripShift
                        : handleGripCenter - handleGripOffset - handleGripShift,
                )
                .attr('y1', handleGripTop)
                .attr('y2', handleGripBottom)
                .attr('stroke', COLORS.white)
                .attr('stroke-width', 1)
                .attr('pointer-events', 'none');

            handles
                .select<SVGLineElement>('line.range-handle-grip-2')
                .attr('x1', item =>
                    item.kind === 'lower'
                        ? handleGripCenter + handleGripOffset + handleGripShift
                        : handleGripCenter + handleGripOffset - handleGripShift,
                )
                .attr('x2', item =>
                    item.kind === 'lower'
                        ? handleGripCenter + handleGripOffset + handleGripShift
                        : handleGripCenter + handleGripOffset - handleGripShift,
                )
                .attr('y1', handleGripTop)
                .attr('y2', handleGripBottom)
                .attr('stroke', COLORS.white)
                .attr('stroke-width', 1)
                .attr('pointer-events', 'none');

            const badgeGap = 8;
            const badgeHeight = 36;
            const badgeRadius = 10;
            const badgeY = handleY + 2;
            const badgeVerticalCenter = badgeY + badgeHeight / 2;

            const changeBadges = svg
                .selectAll<SVGGElement, (typeof rangeChangeBadges)[number]>('g.range-change-badge')
                .data(rangeChangeBadges, item => item.kind)
                .join(enter => {
                    const group = enter.append('g').attr('class', 'range-change-badge');
                    group.append('rect').attr('class', 'range-change-badge-bg');
                    group.append('text').attr('class', 'range-change-badge-text');
                    return group;
                });

            changeBadges.each(function (item) {
                const group = d3.select(this);
                const text = group
                    .select<SVGTextElement>('text.range-change-badge-text')
                    .attr('x', 0)
                    .attr('y', badgeVerticalCenter)
                    .attr('dominant-baseline', 'middle')
                    .attr('text-anchor', 'middle')
                    .attr('fill', COLORS.textPrimary)
                    .attr('font-size', 13)
                    .attr('font-weight', 500)
                    .attr('pointer-events', 'none')
                    .text(item.label);

                const textNode = text.node();
                const textWidth = textNode?.getComputedTextLength() ?? 0;
                const badgeWidth = Math.max(62, Math.ceil(textWidth + 22));
                const centerX =
                    item.kind === 'lower'
                        ? getHandleTranslateX(item.kind, item.tick) - badgeGap - badgeWidth / 2
                        : x(item.tick) + handleWidth + badgeGap + badgeWidth / 2;

                group.attr('transform', `translate(${centerX}, 0)`);

                group
                    .select<SVGRectElement>('rect.range-change-badge-bg')
                    .attr('x', -badgeWidth / 2)
                    .attr('y', badgeY)
                    .attr('width', badgeWidth)
                    .attr('height', badgeHeight)
                    .attr('rx', badgeRadius)
                    .attr('fill', COLORS.gray600)
                    .attr('pointer-events', 'none');

                group.select<SVGTextElement>('text.range-change-badge-text');
            });

            const xAxis = d3
                .axisBottom(x)
                .ticks(5)
                .tickValues(displayedXAxisTickValues)
                .tickFormat(value =>
                    formatBalance(tickToPrice(Number(value), decimalsDiff), true, true),
                );

            svg.selectAll<SVGGElement, null>('g.axis-x')
                .data([null])
                .join('g')
                .attr('class', 'axis-x')
                .attr('transform', `translate(0, ${chartHeight - chartMargin.bottom})`)
                .call(g => g.call(xAxis))
                .call(g => g.select('.domain').attr('stroke', COLORS.gray100))
                .call(g => g.selectAll('line').attr('stroke', COLORS.gray100))
                .call(g => g.selectAll('text').attr('fill', COLORS.textGray).attr('font-size', 12))
                .call(g => g.selectAll('text').attr('text-anchor', 'middle').attr('dx', null))
                .attr('pointer-events', 'none');

            svg.selectAll<SVGGElement, null>('g.axis-y').remove();
        }, [
            bars,
            chartWidth,
            chartHeight,
            chartMargin,
            currentTick,
            decimalsDiff,
            selectableRange,
            rangeDragHandle,
            displayedXAxisTickValues,
            viewDomain,
            x,
            y,
        ]);

        const emptyMessage =
            isUserSource && !account
                ? 'Connect wallet to see your liquidity distribution'
                : isUserSource
                  ? 'No liquidity positions yet'
                  : 'No liquidity data yet';
        const chartTitle =
            title || (isUserSource ? 'My Liquidity Positions' : 'Liquidity Distribution');
        const hasRenderableChart = isUserSource
            ? hasData
            : hasData ||
              Number.isFinite(currentTick) ||
              !!(
                  selectableRange &&
                  selectableRange.tickLower !== null &&
                  selectableRange.tickUpper !== null
              );

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
        const tooltipLeft = useMemo(() => {
            if (!tooltipPosition || !chartBodyRef.current) {
                return 0;
            }

            return clamp(tooltipPosition.x, 8, Math.max(8, chartBodyRef.current.clientWidth - 308));
        }, [tooltipPosition]);
        const tooltipTop = useMemo(() => {
            if (!tooltipPosition || !chartBodyRef.current) {
                return 0;
            }

            return clamp(
                tooltipPosition.y,
                8,
                Math.max(8, chartBodyRef.current.clientHeight - 220),
            );
        }, [tooltipPosition]);

        return (
            <ChartSurface>
                <ChartHeader>
                    <ChartTitle $compact={compact}>{chartTitle}</ChartTitle>
                    {controls}
                </ChartHeader>
                <ChartBody $compact={compact} ref={chartBodyRef}>
                    {loading && !ready ? (
                        <ChartLoader>
                            <PageLoader />
                        </ChartLoader>
                    ) : !hasRenderableChart ? (
                        <EmptyDistribution>{emptyMessage}</EmptyDistribution>
                    ) : (
                        <svg
                            ref={svgRef}
                            width={chartWidth}
                            height={chartHeight}
                            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                            tabIndex={0}
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'block',
                                cursor:
                                    isUserSource && hoveredPositionKeys.length > 0
                                        ? 'help'
                                        : undefined,
                            }}
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
                            onMouseLeave={() => {
                                setDrag(prev => ({ ...prev, active: false }));
                                setRangeDragHandle(null);
                                setHoveredPositionKeys([]);
                                setTooltipPosition(null);
                            }}
                            onMouseMove={event => {
                                if (!isUserSource || !bars.length || !chartBodyRef.current) {
                                    return;
                                }

                                const svgRect = svgRef.current?.getBoundingClientRect();
                                const bodyRect = chartBodyRef.current.getBoundingClientRect();
                                if (!svgRect) {
                                    return;
                                }

                                const scaleX = chartWidth / svgRect.width;
                                const scaleY = chartHeight / svgRect.height;
                                const localX = (event.clientX - svgRect.left) * scaleX;
                                const localY = (event.clientY - svgRect.top) * scaleY;

                                const hoveredBars = bars
                                    .filter(
                                        item =>
                                            !!item.positionKey &&
                                            localX >= Math.max(chartMargin.left, item.x0) &&
                                            localX <=
                                                Math.min(chartWidth - chartMargin.right, item.x1) &&
                                            localY >= item.y0 &&
                                            localY <= item.y1,
                                    )
                                    .sort((a, b) => b.liquidity - a.liquidity);

                                const hoveredKeys = hoveredBars
                                    .map(item => item.positionKey)
                                    .filter(Boolean) as string[];

                                setHoveredPositionKeys(hoveredKeys);

                                if (!hoveredKeys.length) {
                                    setTooltipPosition(null);
                                    return;
                                }

                                setTooltipPosition({
                                    x: event.clientX - bodyRect.left + 14,
                                    y: event.clientY - bodyRect.top + 14,
                                });
                            }}
                        >
                            {canPanByDrag && (
                                <rect
                                    x={chartMargin.left}
                                    y={chartMargin.top}
                                    width={plotWidth}
                                    height={chartHeight - chartMargin.top - chartMargin.bottom}
                                    fill="transparent"
                                    style={{
                                        cursor:
                                            isUserSource && hoveredPositionKeys.length > 0
                                                ? 'help'
                                                : rangeDragHandle
                                                  ? 'ew-resize'
                                                  : zoom <= ZOOM_MIN
                                                    ? 'default'
                                                    : drag.active
                                                      ? 'grabbing'
                                                      : 'grab',
                                    }}
                                    onMouseDown={event => {
                                        if (rangeDragHandle) {
                                            return;
                                        }
                                        setHasManualViewport(true);
                                        setDrag({
                                            active: true,
                                            startX: event.clientX,
                                            startCenter:
                                                viewCenterTick ??
                                                (Number.isFinite(currentTick) ? currentTick : 0),
                                        });
                                    }}
                                    onTouchStart={event => {
                                        if (rangeDragHandle) {
                                            return;
                                        }
                                        const touch = event.touches[0];
                                        if (!touch) {
                                            return;
                                        }
                                        event.preventDefault();
                                        setHasManualViewport(true);
                                        setDrag({
                                            active: true,
                                            startX: touch.clientX,
                                            startCenter:
                                                viewCenterTick ??
                                                (Number.isFinite(currentTick) ? currentTick : 0),
                                        });
                                    }}
                                />
                            )}
                        </svg>
                    )}
                    {isUserSource && hoveredPositionDetails.length > 0 && tooltipPosition && (
                        <ChartTooltip style={{ left: tooltipLeft, top: tooltipTop }}>
                            <ChartTooltipStack>
                                {hoveredPositionDetails.map(position => (
                                    <ConcentratedPositionCard
                                        key={position.key}
                                        pool={pool}
                                        position={position}
                                        compact
                                    />
                                ))}
                            </ChartTooltipStack>
                        </ChartTooltip>
                    )}
                </ChartBody>
            </ChartSurface>
        );
    },
);

LiquidityDistributionChart.displayName = 'LiquidityDistributionChart';

export default LiquidityDistributionChart;
