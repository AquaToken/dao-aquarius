import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../styles';
import { useEffect, useRef, useState } from 'react';

const Pillar = styled.div.attrs<{ value: number }>(({ value }) => ({
    style: {
        background: `linear-gradient(to right, ${COLORS.titleText} 0% ${value}%, ${COLORS.gray} ${value}% 100%)`,
    },
}))<{ value: number }>`
    width: calc(100% - 1rem);
    height: 0.2rem;
    position: relative;
    margin: 0.7rem auto;

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

const Mark = styled.div.attrs<{ percent: number; value: number }>(({ percent, value }) => ({
    style: {
        background: value >= percent ? COLORS.titleText : COLORS.gray,
        border: `0.1rem solid ${value >= percent ? COLORS.titleText : COLORS.white}`,
        left: `${percent}%`,
    },
}))<{ percent: number; value: number }>`
    height: 0.8rem;
    width: 0.8rem;
    border-radius: 0.2rem;
    transform: translate(-50%, -50%) rotate(45deg);
    position: absolute;
    top: 50%;
    box-sizing: border-box;
    z-index: 1;
`;

const Thumb = styled.div.attrs<{ value: number; isDrag: boolean }>(({ value, isDrag }) => ({
    style: {
        cursor: isDrag ? 'grabbing' : 'grab',
        left: `${value}%`,
    },
}))<{ value: number; isDrag: boolean }>`
    height: 1.6rem;
    width: 1.6rem;
    border: 0.2rem solid ${COLORS.white};
    background: ${COLORS.titleText};
    border-radius: 0.5rem;
    transform: translate(-50%, -50%) rotate(45deg);
    position: absolute;
    top: 50%;
    box-sizing: border-box;
    z-index: 2;
`;

const CurrentValue = styled.div.attrs<{ value: number }>(({ value }) => ({
    style: {
        left: `${value}%`,
    },
}))<{ value: number }>`
    position: absolute;
    top: -2.5rem;
    transform: translateX(-50%);
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
}: {
    onChange: (number) => void;
    value: number;
}) => {
    const [value, setValue] = useState(valueProps);
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
            ref={ref}
        >
            <Mark percent={0} value={value} />
            <Mark percent={25} value={value} />
            <Mark percent={50} value={value} />
            <Mark percent={75} value={value} />
            <Mark percent={100} value={value} />
            <Thumb
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
            <CurrentValue value={value}>{value}%</CurrentValue>
        </Pillar>
    );
};

export default RangeInput;