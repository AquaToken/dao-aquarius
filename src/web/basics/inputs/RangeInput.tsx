import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { noSelect } from 'styles/mixins';
import { COLORS, FONT_SIZE, hexWithOpacity } from 'styles/style-constants';

// ---------- Sizes ----------
type Size = 'small' | 'medium' | 'large';

const sizeStyles = {
    small: {
        pillarHeight: '0.1rem',
        markSize: '0.4rem',
        markRadius: '0.1rem',
        markBorder: '0.1rem',
        thumbSize: '1rem',
        thumbBorder: '0.15rem',
        thumbRadius: '0.3rem',
        labelSize: '0.9rem',
    },
    medium: {
        pillarHeight: '0.2rem',
        markSize: '0.8rem',
        markRadius: '0.2rem',
        markBorder: '0.1rem',
        thumbSize: '1.6rem',
        thumbBorder: '0.2rem',
        thumbRadius: '0.5rem',
        labelSize: '1rem',
    },
    large: {
        pillarHeight: '0.4rem',
        markSize: '1rem',
        markRadius: '0.3rem',
        markBorder: '0.2rem',
        thumbSize: '1.6rem',
        thumbBorder: '0.2rem',
        thumbRadius: '0.5rem',
        labelSize: '1.2rem',
    },
};

// ---------- Utils ----------
const clamp01 = (n: number) => Math.min(100, Math.max(0, n));

const normalizeRange = (range?: [number, number]) => {
    if (!range) return undefined;
    let [a, b] = range;
    a = clamp01(a);
    b = clamp01(b);
    if (a > b) [a, b] = [b, a];
    return [a, b] as [number, number];
};

/**
 * Build a piecewise constant linear-gradient where:
 * - "fill" wins left of `value`
 * - "highlightColor" wins in [from, to] right of `value`
 * - "base" everywhere else
 * The function produces monotonic, merged segments so the CSS gradient is valid for all edge cases:
 *   - from = 0 or to = 100
 *   - value exactly equals from/to
 *   - value anywhere relative to [from, to]
 */
const buildPillarGradient = ({
    value,
    disabled,
    highlightRange,
    highlightColor,
}: {
    value: number;
    disabled?: boolean;
    highlightRange?: [number, number];
    highlightColor?: string;
}) => {
    const base = COLORS.gray100;
    const fill = disabled ? COLORS.gray100 : COLORS.textPrimary;
    const hColor = highlightColor || COLORS.gray400;

    const v = clamp01(value);
    const from = highlightRange?.[0];
    const to = highlightRange?.[1];

    // Collect breakpoints and ensure monotonic order
    const points = new Set<number>([0, v, 100]);
    if (from !== undefined && to !== undefined) {
        points.add(from);
        points.add(to);
    }
    const stops = Array.from(points).sort((a, b) => a - b);

    // Build segments between consecutive stops
    type Seg = { start: number; end: number; color: string };
    const segments: Seg[] = [];
    for (let i = 0; i < stops.length - 1; i++) {
        const start = stops[i];
        const end = stops[i + 1];
        if (end <= start) continue; // skip zero/invalid spans

        // Choose a mid point strictly inside [start, end) to classify the segment
        const mid = (start + end) / 2;

        let color = base;
        if (mid <= v) {
            color = fill;
        } else if (highlightRange && mid >= highlightRange[0] && mid <= highlightRange[1]) {
            color = hColor;
        } else {
            color = base;
        }

        segments.push({ start, end, color });
    }

    // Merge adjacent segments with the same color to keep the gradient compact
    const merged: Seg[] = [];
    for (const seg of segments) {
        const last = merged[merged.length - 1];
        if (last && last.color === seg.color && Math.abs(last.end - seg.start) < 1e-6) {
            last.end = seg.end;
        } else {
            merged.push({ ...seg });
        }
    }

    // Compose CSS gradient with explicit start/end for each piece
    const parts = merged.map(s => `${s.color} ${s.start}% ${s.end}%`);
    return `linear-gradient(to right, ${parts.join(', ')})`;
};

const getClickPosition = (
    event: React.TouchEvent | React.MouseEvent | MouseEvent | TouchEvent,
    ref: HTMLDivElement,
) => {
    const { left, right } = ref.getBoundingClientRect();
    const x =
        (event as React.MouseEvent).clientX ||
        (event as React.TouchEvent).touches?.[0]?.clientX ||
        0;
    const percent = ((x - left) / (right - left)) * 100;
    const rounded = Math.round(percent * 10) / 10;
    return clamp01(rounded);
};

// ---------- Styled ----------
const Pillar = styled.div.attrs<{
    $value: number;
    $disabled?: boolean;
    $size: Size;
    $highlightRange?: [number, number];
    $highlightColor?: string;
}>(({ $value, $disabled, $highlightRange, $highlightColor }) => ({
    style: {
        background: buildPillarGradient({
            value: $value,
            disabled: $disabled,
            highlightRange: $highlightRange,
            highlightColor: $highlightColor,
        }),
    },
}))<{
    $value: number;
    $disabled?: boolean;
    $size: Size;
    $highlightRange?: [number, number];
    $highlightColor?: string;
}>`
    width: calc(100% - 1rem);
    height: ${({ $size }) => sizeStyles[$size].pillarHeight};
    position: relative;
    margin: 0.7rem auto 2rem auto;
    pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
    cursor: pointer;

    &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        width: 100%;
        transform: translateY(-50%);
        height: 1.4rem;
    }

    & > * {
        ${noSelect};
    }
`;

const HighlightLabel = styled.div<{
    $from: number;
    $to: number;
    $color: string;
}>`
    position: absolute;
    bottom: 100%;
    left: ${({ $from }) => `${$from}%`};
    width: ${({ $from, $to }) => `${$to - $from}%`};
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;

    // background gradient overlay
    background: linear-gradient(
        to top,
        ${({ $color }) => hexWithOpacity($color, 20)} 0%,
        transparent 100%
    );

    font-size: 1rem;
    font-weight: 700;
    color: ${({ $color }) => $color ?? COLORS.gray400};
    white-space: nowrap;
    pointer-events: none; // not clickable
    z-index: 0;
`;

const Mark = styled.div.attrs<{
    $percent: number;
    $value: number;
    $disabled: boolean;
    $size: Size;
    $highlightRange?: [number, number];
    $highlightColor?: string;
}>(({ $percent, $value, $disabled, $highlightRange, $highlightColor }) => {
    const base = COLORS.gray100;
    const fill = $disabled ? COLORS.gray100 : COLORS.textPrimary;
    const hColor = $highlightColor || COLORS.gray400;

    let bg = base;
    if ($percent <= $value) {
        bg = fill;
    } else if ($highlightRange) {
        const [from, to] = $highlightRange;
        if ($percent >= from && $percent <= to) {
            bg = hColor;
        }
    }

    return {
        style: {
            background: bg,
            left: `${$percent}%`,
        },
    };
})<{
    $percent: number;
    $value: number;
    $disabled: boolean;
    $size: Size;
    $highlightRange?: [number, number];
    $highlightColor?: string;
}>`
    height: ${({ $size }) => sizeStyles[$size].markSize};
    width: ${({ $size }) => sizeStyles[$size].markSize};
    border: ${({ $size }) => sizeStyles[$size].markBorder} solid ${COLORS.white};
    border-radius: ${({ $size }) => sizeStyles[$size].markRadius};
    transform: translate(-50%, -50%) rotate(45deg);
    position: absolute;
    top: 50%;
    box-sizing: border-box;
    z-index: 1;
    transition: transform 0.1s ease-in;

    &:hover {
        transform: scale(2) translate(-25%, -25%) rotate(45deg);
    }
`;

const Label = styled.div<{ $percent: number; $size: Size }>`
    position: absolute;
    top: 1.2rem;
    left: ${({ $percent }) => `${$percent}%`};
    transform: translateX(-50%);
    font-size: ${({ $size }) => sizeStyles[$size].labelSize};
    color: ${COLORS.gray400};
    white-space: nowrap;
`;

const Thumb = styled.div.attrs<{
    $value: number;
    $isDrag: boolean;
    $disabled?: boolean;
    $size: Size;
}>(({ $value, $isDrag }) => ({
    style: {
        cursor: $isDrag ? 'grabbing' : 'grab',
        left: `${$value}%`,
    },
}))<{ $value: number; $isDrag: boolean; $disabled?: boolean; $size: Size }>`
    height: ${({ $size }) => sizeStyles[$size].thumbSize};
    width: ${({ $size }) => sizeStyles[$size].thumbSize};
    border: ${({ $size }) => sizeStyles[$size].thumbBorder} solid ${COLORS.white};
    background: ${({ $disabled }) => ($disabled ? COLORS.gray100 : COLORS.textPrimary)};
    pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
    border-radius: ${({ $size }) => sizeStyles[$size].thumbRadius};
    transform: translate(-50%, -50%) rotate(45deg);
    position: absolute;
    top: 50%;
    box-sizing: border-box;
    z-index: 2;
`;

const CurrentValue = styled.div.attrs<{ $value: number; $disabled: boolean; $size: Size }>(
    ({ $value }) => {
        // clamp transform depending on position
        let translateX = '-50%';
        if ($value <= 1) {
            translateX = '-20%'; // shift right edge inside
        } else if ($value >= 99) {
            translateX = '-80%'; // shift left edge inside
        }
        return {
            style: {
                left: `${$value}%`,
                transform: `translateX(${translateX})`,
            },
        };
    },
)<{ $value: number; $disabled: boolean; $size: Size }>`
    position: absolute;
    top: ${({ $size }) => `calc(${sizeStyles[$size].thumbSize} / 2)`};
    color: ${COLORS.white};
    padding: 0.2rem 0.8rem;
    border-radius: 0.8rem;
    ${FONT_SIZE.xs};
    background-color: ${({ $disabled }) => ($disabled ? COLORS.gray200 : COLORS.textPrimary)};
    white-space: nowrap;
`;

// ---------- Component ----------
const RangeInput = ({
    onChange,
    value: valueProps,
    disabled,
    withoutCurrentValue,
    marks,
    labels,
    size = 'medium',
    highlight,
    customCurrentValue,
    ...props
}: {
    onChange: (value: number) => void;
    value: number;
    disabled?: boolean;
    marks?: number[] | number;
    labels?: boolean | string | ((ind: number) => string); // false/undefined: no labels; true: % labels; string: index + suffix (e.g. "y")
    size?: Size;
    highlight?: { range: [number, number]; color?: string; label?: string };
    withoutCurrentValue?: boolean;
    customCurrentValue?: string;
}) => {
    const [value, setValue] = useState(disabled ? 0 : valueProps);
    const [isMouseDrag, setIsMouseDrag] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const normalizedHighlight = normalizeRange(highlight?.range);

    useEffect(() => {
        if (valueProps !== value) {
            setValue(valueProps > 100 ? 100 : valueProps);
        }
    }, [valueProps]);

    const onMouseUp = () => isMouseDrag && setIsMouseDrag(false);

    const onMarkClick = (e: React.MouseEvent | React.TouchEvent, v: number) => {
        e.stopPropagation();
        setValue(v);
        onChange(v);
    };

    const onMouseMove = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        if (!isMouseDrag) return;
        e.preventDefault();
        e.stopPropagation();
        const position = getClickPosition(e, ref.current!);
        setValue(position);
        onChange(position);
    };

    useEffect(() => {
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchend', onMouseUp);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('touchmove', onMouseMove);
        return () => {
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchend', onMouseUp);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('touchmove', onMouseMove);
        };
    });

    // Build marks
    let markList: number[];
    if (Array.isArray(marks)) {
        markList = marks.map(clamp01);
    } else if (typeof marks === 'number' && marks > 0) {
        const step = 100 / marks;
        markList = Array.from({ length: marks + 1 }, (_, i) => Math.round(i * step));
    } else {
        markList = [0, 25, 50, 75, 100];
    }

    return (
        <Pillar
            $value={value}
            $size={size}
            $disabled={disabled}
            $highlightRange={normalizedHighlight}
            $highlightColor={highlight?.color}
            ref={ref}
            onClick={(e: React.MouseEvent) => {
                const position = getClickPosition(e, ref.current!);
                setValue(position);
                onChange(position);
            }}
            {...props}
        >
            {normalizedHighlight && highlight?.label && (
                <HighlightLabel
                    $from={normalizedHighlight[0]}
                    $to={normalizedHighlight[1]}
                    $color={highlight?.color || COLORS.gray400}
                >
                    {highlight.label}
                </HighlightLabel>
            )}

            {markList.map((p, i) => (
                <React.Fragment key={p}>
                    <Mark
                        $percent={p}
                        $value={value}
                        $disabled={!!disabled}
                        $size={size}
                        $highlightRange={normalizedHighlight}
                        $highlightColor={highlight?.color}
                        onClick={(e: React.MouseEvent) => onMarkClick(e, p)}
                    />
                    {labels && (
                        <Label $percent={p} $size={size}>
                            {typeof labels === 'function'
                                ? labels(i)
                                : typeof labels === 'string'
                                  ? `${i}${labels}`
                                  : `${p}%`}
                        </Label>
                    )}
                </React.Fragment>
            ))}

            <Thumb
                $disabled={disabled}
                $value={value}
                $isDrag={isMouseDrag}
                $size={size}
                onMouseDown={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setIsMouseDrag(true);
                }}
                onTouchStart={(e: React.TouchEvent) => {
                    e.stopPropagation();
                    setIsMouseDrag(true);
                }}
            />

            {!withoutCurrentValue && (
                <CurrentValue $value={value} $disabled={!!disabled} $size={size}>
                    {customCurrentValue ?? `${value}%`}
                </CurrentValue>
            )}
        </Pillar>
    );
};

export default RangeInput;
