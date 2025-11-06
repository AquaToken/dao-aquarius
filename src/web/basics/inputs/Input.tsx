import * as React from 'react';
import { forwardRef, RefObject, useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { textEllipsis } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

const InputWrapper = styled.div`
    position: relative;
    width: 100%;
`;

const StyledInput = styled.input<{
    ref: RefObject<HTMLInputElement>;
    $isMedium?: boolean;
    $isRightAligned?: boolean;
    $isCenterAligned?: boolean;
    $paddingLeft?: string;
}>`
    height: ${({ $isMedium }) => ($isMedium ? '4rem' : '6.6rem')};
    padding: ${({ $isMedium }) => ($isMedium ? `1.1rem 1.6rem` : `2.4rem 6.5rem 2.4rem 2.4rem`)};
    text-align: ${({ $isRightAligned, $isCenterAligned }) =>
        $isRightAligned ? `right` : $isCenterAligned ? 'center' : 'start'};
    width: 100%;
    border: 0.1rem solid ${COLORS.gray100};
    border-radius: 0.5rem;
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.textTertiary};
    box-sizing: border-box;
    ${textEllipsis};
    padding-left: ${({ $paddingLeft }) => $paddingLeft};

    /* Chrome, Safari, Edge, Opera */
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* Firefox */
    &[type='number'] {
        -moz-appearance: textfield;
    }

    &::placeholder {
        color: ${COLORS.gray200};
    }

    &:focus {
        border: 0.2rem solid ${COLORS.purple500};
    }

    &:disabled {
        color: ${COLORS.gray200};
    }
`;

const Postfix = styled.div`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 2.4rem;
`;

const Prefix = styled.div`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 2.4rem;
`;

const Label = styled.div`
    position: absolute;
    bottom: calc(100% + 1.2rem);
    left: 0;
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.textTertiary};
`;

const LabelRight = styled(Label)`
    left: unset;
    right: 0;
`;

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    postfix?: React.ReactNode;
    prefixCustom?: React.ReactNode;
    isMedium?: boolean;
    isRightAligned?: boolean;
    isCenterAligned?: boolean;
    label?: string | React.ReactNode;
    rightLabel?: string | React.ReactNode;
}

const Input = forwardRef(
    (
        {
            postfix,
            prefixCustom,
            className,
            label,
            rightLabel,
            isMedium,
            isRightAligned,
            isCenterAligned,
            ...props
        }: InputProps,
        ref: RefObject<HTMLInputElement>,
    ): React.ReactNode => {
        const prefixRef = useRef(null);
        const [paddingLeft, setPaddingLeft] = useState(isMedium ? '1.6rem' : '2.4rem');

        const updatePaddingLeft = () => {
            if (!prefixRef.current) {
                setPaddingLeft(isMedium ? '1.6rem' : '2.4rem');
            } else {
                const width = prefixRef.current.getBoundingClientRect().width;
                setPaddingLeft(`${width / 10 + 2.4}rem`);
            }
        };

        useLayoutEffect(() => {
            updatePaddingLeft();
        }, [prefixCustom, isMedium]);

        return (
            <InputWrapper className={className}>
                {Boolean(label) && <Label>{label}</Label>}
                {Boolean(rightLabel) && <LabelRight>{rightLabel}</LabelRight>}
                <Prefix ref={prefixRef}>{prefixCustom}</Prefix>
                <StyledInput
                    ref={ref}
                    $isMedium={isMedium}
                    $isRightAligned={isRightAligned}
                    $isCenterAligned={isCenterAligned}
                    $paddingLeft={paddingLeft}
                    {...props}
                    onWheel={(e: React.WheelEvent) => (e.currentTarget as HTMLElement).blur()}
                />
                {postfix && <Postfix>{postfix}</Postfix>}
            </InputWrapper>
        );
    },
);

Input.displayName = 'Input';

export default Input;
