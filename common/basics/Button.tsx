import * as React from 'react';
import styled from 'styled-components';
import { flexAllCenter } from '../mixins';
import { COLORS } from '../styles';

const ButtonBody = styled.button<{ isBig?: boolean; pending?: boolean }>`
    ${flexAllCenter};
    height: ${({ isBig }) => (isBig ? '6.6rem' : '4.8rem')};
    padding: ${({ isBig }) => (isBig ? '2.4rem 6.4rem' : '1.6rem 3.2rem')};
    background-color: ${COLORS.white};
    background-color: ${COLORS.buttonBackground};
    border-radius: 0.5rem;
    border: none;
    font-weight: bold;
    letter-spacing: ${({ isBig }) => (isBig ? '0.2rem' : '0.05rem')};
    text-transform: uppercase;
    cursor: pointer;
    transition: all ease 200ms;
    position: relative;
    pointer-events: ${({ pending }) => (pending ? 'none' : 'auto')};

    &:hover {
        background-color: ${COLORS.purple};
    }

    &:active {
        transform: scale(0.9);
    }

    &:disabled {
        background-color: ${COLORS.gray};
        pointer-events: none;
    }
`;

const ButtonLoader = styled.div<{ pending?: boolean }>`
    ${({ pending }) =>
        pending
            ? `
        background: linear-gradient(
            110deg,
            #fff,
            #fff 33%,
            #442868 33%,
            #442868 66%,
            #fff 66%,
            #fff 100%
        );
        color: transparent;
        -webkit-background-clip: text;
        background-clip: text;
        animation: rainbow_animation 1s ease-in infinite;
        background-size: 400% 100%;
        pointer-events: none;
    `
            : `
        color: ${COLORS.white};
    `}

    @keyframes rainbow_animation {
        0% {
            background-position: 100% 0;
        }

        100% {
            background-position: 0 0;
        }
    }
`;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: string | JSX.Element;
    pending?: boolean;
    isBig?: boolean;
}

const Button = ({ children, pending, isBig, ...props }: ButtonProps): JSX.Element => {
    return (
        <ButtonBody pending={pending} isBig={isBig} {...props}>
            <ButtonLoader pending={pending}>{children}</ButtonLoader>
        </ButtonBody>
    );
};

export default Button;
