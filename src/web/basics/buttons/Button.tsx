import * as React from 'react';
import styled from 'styled-components';

import { flexAllCenter } from 'web/mixins';
import { COLORS } from 'web/styles';

import BlankButton from './BlankButton';

const ButtonBody = styled(BlankButton)<{
    $isBig?: boolean;
    $pending?: boolean;
    $fullWidth?: boolean;
    $secondary?: boolean;
    $isSquare?: boolean;
    $isSmall?: boolean;
    $isWhite?: boolean;
    $isPurpleText?: boolean;
    $isRounded?: boolean;
    $tertiary?: boolean;
}>`
    ${flexAllCenter};
    width: ${({ $fullWidth, $isSquare, $isBig }) => {
        if ($fullWidth) {
            return '100%';
        }
        if ($isSquare) {
            return $isBig ? '6.6rem' : '4.8rem';
        }

        return 'unset';
    }};
    height: ${({ $isBig, $isSmall }) => {
        if ($isBig) {
            return '6.6rem';
        }

        if ($isSmall) {
            return '2.8rem';
        }

        return '4.8rem';
    }};
    padding: ${({ $isBig, $isSquare, $isSmall }) => {
        if ($isSquare) {
            return 'unset';
        }

        if ($isSmall) {
            return '0 1.8rem';
        }

        return $isBig ? '0 6.4rem' : '0 3.2rem';
    }};
    background-color: ${COLORS.white};
    background-color: ${({ $secondary, $isWhite, $tertiary }) => {
        if ($secondary) {
            return COLORS.gray;
        }
        if ($isWhite) {
            return COLORS.white;
        }
        if ($tertiary) {
            return COLORS.lightGray;
        }
        return COLORS.buttonBackground;
    }};
    border-radius: ${({ $isRounded, $isBig, $isSmall }) => {
        if (!$isRounded) {
            return '0.5rem';
        }
        if ($isBig) {
            return '2.4rem';
        }
        if ($isSmall) {
            return '0.8rem';
        }
        return '1.6rem';
    }};
    font-weight: bold;
    letter-spacing: ${({ $isBig }) => ($isBig ? '0.2rem' : '0.05rem')};
    text-transform: uppercase;
    //TODO: remove
    cursor: pointer;
    transition: all ease 200ms;
    position: relative;
    pointer-events: ${({ $pending }) => ($pending ? 'none' : 'auto')};
    white-space: nowrap;

    &:hover {
        background-color: ${({ $secondary, $isWhite, $tertiary }) => {
            if ($secondary) {
                return COLORS.lightGray;
            }

            if ($isWhite) {
                return COLORS.lightGray;
            }

            if ($tertiary) {
                return COLORS.gray;
            }

            return COLORS.purple;
        }};
    }

    &:active {
        transform: scale(0.9);
    }

    &:disabled {
        background-color: ${COLORS.gray};
        //TODO: remove
        pointer-events: none;
    }
`;

const ButtonLoader = styled.div<{
    $pending?: boolean;
    $secondary?: boolean;
    $isWhite?: boolean;
    $isPurpleText?: boolean;
    $tertiary?: boolean;
}>`
    color: ${({ $secondary, $isWhite, $isPurpleText, $tertiary }) => {
        if ($isPurpleText) {
            return COLORS.purple;
        }

        if ($secondary) {
            return COLORS.grayText;
        }

        if ($isWhite) {
            return COLORS.blue;
        }

        if ($tertiary) {
            return COLORS.titleText;
        }

        return COLORS.white;
    }};

    button:disabled > & {
        color: ${COLORS.grayText};
    }

    ${({ $pending }) =>
        $pending
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
    `};

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
    secondary?: boolean;
    tertiary?: boolean;
    isSquare?: boolean;
    isSmall?: boolean;
    isWhite?: boolean;
    isPurpleText?: boolean;
    isRounded?: boolean;
}

const Button = ({
    children,
    pending,
    isBig,
    isSmall,
    fullWidth,
    secondary,
    tertiary,
    isSquare,
    isWhite,
    isPurpleText,
    isRounded,
    ...props
}: ButtonProps): JSX.Element => (
    <ButtonBody
        $pending={pending}
        $isBig={isBig}
        $fullWidth={fullWidth}
        $secondary={secondary}
        $isSquare={isSquare}
        $isSmall={isSmall}
        $isWhite={isWhite}
        $isRounded={isRounded}
        $tertiary={tertiary}
        {...props}
    >
        <ButtonLoader
            $pending={pending}
            $secondary={secondary}
            $tertiary={tertiary}
            $isWhite={isWhite}
            $isPurpleText={isPurpleText}
        >
            {children}
        </ButtonLoader>
    </ButtonBody>
);

export default Button;
