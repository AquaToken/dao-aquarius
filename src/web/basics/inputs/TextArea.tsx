import * as React from 'react';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';

import { COLORS } from 'styles/style-constants';

const StyledArea = styled.textarea<{ rows?: number }>`
    width: 100%;
    border: 0.1rem solid ${COLORS.gray100};
    border-radius: 0.5rem;
    padding: 2.4rem 6.5rem 2.4rem 2.4rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textTertiary};
    box-sizing: border-box;

    ${({ rows }) =>
        rows &&
        `
        min-height: ${rows * 6}rem;
    `}

    resize: none;

    /* Chrome, Safari, Edge, Opera */
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    &::placeholder {
        color: ${COLORS.gray200};
    }

    &:focus {
        border: 0.2rem solid ${COLORS.purple500};
    }
`;

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    autosize?: boolean;
}

const TextArea = ({ autosize, ...props }: Props): React.ReactNode => {
    const ref = useRef<HTMLTextAreaElement>(null);

    const resize = () => {
        const el = ref.current;
        if (autosize && el) {
            el.style.height = '5px';
            el.style.height = `${el.scrollHeight}px`;
        }
    };

    useEffect(() => {
        resize();
    }, [props.value]);

    return (
        <StyledArea
            {...props}
            ref={ref}
            onInput={e => {
                props?.onInput?.(e);
                resize();
            }}
        />
    );
};

export default TextArea;
