import * as React from 'react';
import { forwardRef, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import Input, { InputProps } from 'basics/inputs/Input';

import { COLORS } from 'styles/style-constants';

const BlankInputWrapper = styled.div`
    position: relative;
    width: 100%;
`;

const HiddenText = styled.span<{ fontSize: number }>`
    visibility: hidden;
    white-space: pre;
    position: absolute;
    top: 0;
    left: 0;
    font-weight: inherit;
    font-family: inherit;
    font-size: ${({ fontSize }) => fontSize}px;
    padding: 0;
`;

const BlankInputComponent = styled(Input)<{ $fontSize: number }>`
    input {
        background: none;
        border: none;
        padding: 0;
        border-radius: 0;
        width: 100%;
        outline: none;
        font-size: ${({ $fontSize }) => `${$fontSize}px`};
        transition: font-size 0.1s ease;

        &:focus {
            border: none;
        }

        &:disabled {
            color: ${COLORS.textDark};
        }
    }
`;

const BlankInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const { value = '', ...rest } = props;

    const wrapperRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const [fontSize, setFontSize] = useState(36);
    const rafId = useRef<number | null>(null);

    const updateFontSize = React.useCallback(() => {
        if (!textRef.current || !wrapperRef.current) return;

        const wrapperWidth = wrapperRef.current.offsetWidth;
        let size = 36;

        while (size > 12) {
            textRef.current.style.fontSize = `${size}px`;
            const textWidth = textRef.current.offsetWidth;

            if (textWidth <= wrapperWidth) break;
            size -= 1;
        }

        setFontSize(size);
    }, []);

    // Use rAF to throttle updates
    const requestFontSizeUpdate = React.useCallback(() => {
        if (rafId.current !== null) {
            cancelAnimationFrame(rafId.current);
        }
        rafId.current = requestAnimationFrame(updateFontSize);
    }, [updateFontSize]);

    useEffect(() => {
        requestFontSizeUpdate();
    }, [value, requestFontSizeUpdate]);

    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            requestFontSizeUpdate();
        });

        if (wrapperRef.current) {
            resizeObserver.observe(wrapperRef.current);
        }

        return () => {
            resizeObserver.disconnect();
            if (rafId.current !== null) cancelAnimationFrame(rafId.current);
        };
    }, [requestFontSizeUpdate]);

    return (
        <BlankInputWrapper ref={wrapperRef}>
            <HiddenText ref={textRef} fontSize={fontSize}>
                {value || ' '}
            </HiddenText>
            <BlankInputComponent {...rest} value={value} ref={ref} $fontSize={fontSize} />
        </BlankInputWrapper>
    );
});

BlankInput.displayName = 'BlankInput';

export default BlankInput;
