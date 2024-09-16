import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../styles';
import { useEffect, useRef, useState } from 'react';

const Pillar = styled.div.attrs<{ value: number; disabled?: boolean }>(({ value, disabled }) => ({
    style: {
        background: `linear-gradient(to right, ${
            disabled ? COLORS.gray : COLORS.titleText
        } 0% ${value}%, ${COLORS.gray} ${value}% 100%)`,
    },
}))<{ value: number; disabled?: boolean }>`
    width: calc(100% - 1rem);
    height: 0.2rem;
    position: relative;
    margin: 0.7rem auto;
    pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
    cursor: pointer;

    // increase clickable area
    &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        width: 100%;
        transform: translateY(-50%);
        height: 1.4rem;
    }
`;

const Mark = styled.div.attrs<{ percent: number; value: number; disabled: boolean }>(
    ({ percent, value, disabled }) => ({
        style: {
            background: !disabled && value >= percent ? COLORS.titleText : COLORS.gray,
            border: `0.1rem solid ${
                !disabled && value >= percent ? COLORS.titleText : COLORS.white
            }`,
            left: `${percent}%`,
        },
    }),
)<{ percent: number; value: number; disabled: boolean }>`
    height: 0.8rem;
    width: 0.8rem;
    border-radius: 0.2rem;
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

const Thumb = styled.div.attrs<{ value: number; isDrag: boolean; disabled?: boolean }>(
    ({ value, isDrag }) => ({
        style: {
            cursor: isDrag ? 'grabbing' : 'grab',
            left: `${value}%`,
        },
    }),
)<{ value: number; isDrag: boolean; disabled?: boolean }>`
    height: 1.6rem;
    width: 1.6rem;
    border: 0.2rem solid ${COLORS.white};
    background: ${({ disabled }) => (disabled ? COLORS.gray : COLORS.titleText)};
    pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
    border-radius: 0.5rem;
    transform: translate(-50%, -50%) rotate(45deg);
    position: absolute;
    top: 50%;
    box-sizing: border-box;
    z-index: 2;
`;

const CurrentValue = styled.div.attrs<{ value: number; disabled: boolean }>(({ value }) => ({
    style: {
        left: `${value}%`,
    },
}))<{ value: number; disabled: boolean }>`
    position: absolute;
    top: -2.5rem;
    transform: ${({ value }) => `translateX(-${value < 99 ? 50 : 80}%)`};
    color: ${({ disabled }) => (disabled ? COLORS.placeholder : COLORS.titleText)};
`;

const getClickPosition = (event: TouchEvent | MouseEvent, ref) => {
    const { left, right } = ref.getBoundingClientRect();

    const xPosition = (event as MouseEvent).clientX || (event as TouchEvent).touches[0].clientX;

    const percent = ((xPosition - left) / (right - left)) * 100;

    const roundedPercent = Math.round(percent * 10) / 10;

    if (roundedPercent > 100) {
        return 100;
    }

    if (roundedPercent < 0) {
        return 0;
    }

    return roundedPercent;
};

const RangeInput = ({
    onChange,
    value: valueProps,
    disabled,
    withoutPercent,
}: {
    onChange: (number) => void;
    value: number;
    disabled?: boolean;
    withoutPercent?: boolean;
}) => {
    const [value, setValue] = useState(disabled ? 0 : valueProps);
    const [isMouseDrag, setIsMouseDrag] = useState(false);

    const ref = useRef(null);

    useEffect(() => {
        if (valueProps !== value) {
            setValue(valueProps > 100 ? 100 : valueProps);
        }
    }, [valueProps]);

    const onMouseUp = () => {
        if (isMouseDrag) {
            setIsMouseDrag(false);
        }
    };

    const onMarkClick = (e, value) => {
        e.stopPropagation();
        setValue(value);
        onChange(value);
    };

    const onMouseMove = (e) => {
        if (!isMouseDrag) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        const position = getClickPosition(e, ref.current);

        setValue(position);
        onChange(position);
    };

    useEffect(() => {
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchstart', onMouseUp);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('touchmove', onMouseMove);

        return () => {
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchstart', onMouseUp);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('touchmove', onMouseMove);
        };
    });

    return (
        <Pillar
            value={value}
            onClick={(e) => {
                const position = getClickPosition(e as unknown as MouseEvent, ref.current);
                setValue(position);
                onChange(position);
            }}
            disabled={disabled}
            ref={ref}
        >
            <Mark
                percent={0}
                value={value}
                disabled={disabled}
                onClick={(e) => onMarkClick(e, 0)}
            />
            <Mark
                percent={25}
                value={value}
                disabled={disabled}
                onClick={(e) => onMarkClick(e, 25)}
            />
            <Mark
                percent={50}
                value={value}
                disabled={disabled}
                onClick={(e) => onMarkClick(e, 50)}
            />
            <Mark
                percent={75}
                value={value}
                disabled={disabled}
                onClick={(e) => onMarkClick(e, 75)}
            />
            <Mark
                percent={100}
                value={value}
                disabled={disabled}
                onClick={(e) => onMarkClick(e, 100)}
            />
            <Thumb
                disabled={disabled}
                value={value}
                isDrag={isMouseDrag}
                onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsMouseDrag(true);
                }}
                onTouchStart={(e) => {
                    e.stopPropagation();
                    setIsMouseDrag(true);
                }}
            />
            {!withoutPercent && (
                <CurrentValue value={value} disabled={disabled}>
                    {value}%
                </CurrentValue>
            )}
        </Pillar>
    );
};

export default RangeInput;
