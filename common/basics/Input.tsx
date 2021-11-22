import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../styles';
import { textEllipsis } from '../mixins';
import { forwardRef, RefObject } from 'react';

const InputWrapper = styled.div`
    position: relative;
    width: 100%;
`;

const StyledInput = styled.input<{ ref: RefObject<HTMLInputElement> }>`
    height: 6.6rem;
    width: 100%;
    border: 0.1rem solid ${COLORS.gray};
    border-radius: 0.5rem;
    padding: 2.4rem 6.5rem 2.4rem 2.4rem;
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

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    postfix?: React.ReactNode;
}

const Input = forwardRef(
    ({ postfix, className, ...props }: InputProps, ref: RefObject<HTMLInputElement>) => {
        return (
            <InputWrapper className={className}>
                <StyledInput ref={ref} {...props} />
                {postfix && <Postfix>{postfix}</Postfix>}
            </InputWrapper>
        );
    },
);

export default Input;
