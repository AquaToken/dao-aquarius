import * as React from 'react';
import { forwardRef, RefObject } from 'react';
import styled from 'styled-components';

import { textEllipsis } from 'web/mixins';
import { COLORS } from 'web/styles';

const InputWrapper = styled.div`
    position: relative;
    width: 100%;
`;

const StyledInput = styled.input<{
    ref: RefObject<HTMLInputElement>;
    $isMedium?: boolean;
    $isRightAligned?: boolean;
    $isCenterAligned?: boolean;
}>`
    height: ${({ $isMedium }) => ($isMedium ? '4rem' : '6.6rem')};
    padding: ${({ $isMedium }) => ($isMedium ? `1.1rem 1.6rem` : `2.4rem 6.5rem 2.4rem 2.4rem`)};
    text-align: ${({ $isRightAligned, $isCenterAligned }) =>
        $isRightAligned ? `right` : $isCenterAligned ? 'center' : 'start'};
    width: 100%;
    border: 0.1rem solid ${COLORS.gray};
    border-radius: 0.5rem;
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.paragraphText};
    box-sizing: border-box;
    ${textEllipsis};

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
        color: ${COLORS.placeholder};
    }

    &:focus {
        border: 0.2rem solid ${COLORS.purple};
    }

    &:disabled {
        color: ${COLORS.placeholder};
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
    color: ${COLORS.paragraphText};
`;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    postfix?: React.ReactNode;
    prefixCustom?: React.ReactNode;
    isMedium?: boolean;
    isRightAligned?: boolean;
    isCenterAligned?: boolean;
    label?: string | React.ReactNode;
}

const Input = forwardRef(
    (
        {
            postfix,
            prefixCustom,
            className,
            label,
            isMedium,
            isRightAligned,
            isCenterAligned,
            ...props
        }: InputProps,
        ref: RefObject<HTMLInputElement>,
    ): React.ReactNode => (
        <InputWrapper className={className}>
            {Boolean(label) && <Label>{label}</Label>}
            {prefixCustom && <Prefix>{prefixCustom}</Prefix>}
            <StyledInput
                ref={ref}
                $isMedium={isMedium}
                $isRightAligned={isRightAligned}
                $isCenterAligned={isCenterAligned}
                {...props}
                onWheel={(e: React.WheelEvent) => (e.currentTarget as HTMLElement).blur()}
            />
            {postfix && <Postfix>{postfix}</Postfix>}
        </InputWrapper>
    ),
);

Input.displayName = 'Input';

export default Input;
