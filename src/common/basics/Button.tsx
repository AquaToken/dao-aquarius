import * as React from 'react';
import styled from 'styled-components';
import { flexAllCenter } from '../mixins';
import { COLORS } from '../styles';

const ButtonBody = styled.button<{
    isBig?: boolean;
    pending?: boolean;
    fullWidth?: boolean;
    likeDisabled?: boolean;
    isSquare?: boolean;
    isSmall?: boolean;
    isWhite?: boolean;
    isPurpleText?: boolean;
}>`
    ${flexAllCenter};
    width: ${({ fullWidth, isSquare, isBig }) => {
        if (fullWidth) {
            return '100%';
        }
        if (isSquare) {
            return isBig ? '6.6rem' : '4.8rem';
        }

        return 'unset';
    }};
    height: ${({ isBig, isSmall }) => {
        if (isBig) {
            return '6.6rem';
        }

        if (isSmall) {
            return '2.8rem';
        }

        return '4.8rem';
    }};
    padding: ${({ isBig, isSquare, isSmall }) => {
        if (isSquare) {
            return 'unset';
        }

        if (isSmall) {
            return '0 1.8rem';
        }

        return isBig ? '0 6.4rem' : '0 3.2rem';
    }};
    background-color: ${COLORS.white};
    background-color: ${({ likeDisabled, isWhite }) => {
        if (likeDisabled) {
            return COLORS.gray;
        }
        if (isWhite) {
            return COLORS.white;
        }
        return COLORS.buttonBackground;
    }};
    border-radius: 0.5rem;
    border: none;
    font-weight: bold;
    letter-spacing: ${({ isBig }) => (isBig ? '0.2rem' : '0.05rem')};
    text-transform: uppercase;
    cursor: pointer;
    transition: all ease 200ms;
    position: relative;
    pointer-events: ${({ pending }) => (pending ? 'none' : 'auto')};
    white-space: nowrap;

    &:hover {
        background-color: ${({ likeDisabled, isWhite }) => {
            if (likeDisabled) {
                return COLORS.lightGray;
            }

            if (isWhite) {
                return COLORS.lightGray;
            }

            return COLORS.purple;
        }};
    }

    &:active {
        transform: scale(0.9);
    }

    &:disabled {
        background-color: ${COLORS.gray};
        pointer-events: none;
    }
`;

const ButtonLoader = styled.div<{
    pending?: boolean;
    likeDisabled?: boolean;
    isWhite?: boolean;
    isPurpleText?: boolean;
}>`
    color: ${({ likeDisabled, isWhite, isPurpleText }) => {
        if (isPurpleText) {
            return COLORS.purple;
        }

        if (likeDisabled) {
            return COLORS.titleText;
        }

        if (isWhite) {
            return COLORS.blue;
        }

        return COLORS.white;
    }}}

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
        ${flexAllCenter};
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
    children: React.ReactNode;
    pending?: boolean;
    isBig?: boolean;
    fullWidth?: boolean;
    likeDisabled?: boolean;
    isSquare?: boolean;
    isSmall?: boolean;
    isWhite?: boolean;
    isPurpleText?: boolean;
}

const Button = ({
    children,
    pending,
    isBig,
    isSmall,
    fullWidth,
    likeDisabled,
    isSquare,
    isWhite,
    isPurpleText,
    ...props
}: ButtonProps): JSX.Element => {
    return (
        <ButtonBody
            pending={pending}
            isBig={isBig}
            fullWidth={fullWidth}
            likeDisabled={likeDisabled}
            isSquare={isSquare}
            isSmall={isSmall}
            isWhite={isWhite}
            {...props}
        >
            <ButtonLoader
                pending={pending}
                likeDisabled={likeDisabled}
                isWhite={isWhite}
                isPurpleText={isPurpleText}
            >
                {children}
            </ButtonLoader>
        </ButtonBody>
    );
};

export default Button;
