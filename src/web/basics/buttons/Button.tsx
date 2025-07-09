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
    $withGradient?: boolean;
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
    background: ${({ $secondary, $isWhite, $tertiary, $withGradient }) => {
        if ($secondary && $withGradient) {
            return 'radial-gradient(100% 158.34% at 0% 0%, rgba(234, 191, 255, 0.2) 0%, rgba(234, 191, 255, 0) 100%)';
        }
        if ($secondary) {
            return COLORS.gray;
        }
        if ($isWhite) {
            return COLORS.white;
        }
        if ($tertiary) {
            return COLORS.lightGray;
        }
        if ($withGradient) {
            return 'radial-gradient(146.92% 150% at 50.22% 0%, #872AB0 0%, #3918AC 100%)';
        }

        return COLORS.buttonBackground;
    }};

    box-shadow: ${({ $withGradient, $secondary, $tertiary }) =>
        $withGradient && !$secondary && !$tertiary
            ? 'inset 0 0 0 4px rgba(255, 255, 255, 0.08), 0 4px 10px rgba(0, 0, 0, 0.2)'
            : 'unset'};
    
    border: ${({ $withGradient, $secondary }) => {
        if ($withGradient && $secondary) {
            return `0.1rem solid ${COLORS.lightPurple};`;
        }

        return `0.1rem solid ${COLORS.transparent};`;
    }}

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
        background: ${({ $secondary, $isWhite, $tertiary, $withGradient }) => {
            if ($secondary && $withGradient) {
                return 'radial-gradient(100% 234.36% at 0% 100%, rgba(234, 191, 255, 0) 0%, rgba(234, 191, 255, 0.2) 100%)';
            }

            if ($secondary) {
                return COLORS.lightGray;
            }

            if ($isWhite) {
                return COLORS.lightGray;
            }

            if ($tertiary) {
                return COLORS.gray;
            }

            if ($withGradient) {
                return 'radial-gradient(146.92% 150% at 50.22% 0%, #AE51D6 0%, #3B17B6 100%);';
            }

            return COLORS.purple;
        }};
    }

    &:active {
        transform: scale(0.9);
    }

    &:focus {
        border: ${({ $withGradient, $secondary }) =>
            $withGradient && $secondary
                ? `0.1rem solid ${COLORS.lightPurple};`
                : `0.2rem solid ${COLORS.transparent}`};
    }

    &:disabled {
        background: ${({ $withGradient }) => {
            if ($withGradient) {
                return 'radial-gradient(146.92% 150% at 50.22% 0%, #E0E0E0 0%, #A0A0A0 100%)';
            }

            return COLORS.gray;
        }};
        cursor: not-allowed;
    }

    &:active,
    &:disabled {
        transform: none;
    }
`;

const ButtonLoader = styled.div<{
    $pending?: boolean;
    $secondary?: boolean;
    $isWhite?: boolean;
    $isPurpleText?: boolean;
    $tertiary?: boolean;
    $withGradient?: boolean;
}>`
    color: ${({ $secondary, $isWhite, $isPurpleText, $tertiary, $withGradient }) => {
        if ($isPurpleText) {
            return COLORS.purple;
        }

        if ($secondary && $withGradient) {
            return COLORS.black;
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

    button:hover > & {
        ${({ $secondary, $withGradient }) => {
            if ($secondary && $withGradient) {
                return `color:  ${COLORS.purple};`;
            }
        }};
    }

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

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
    withGradient?: boolean;
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
    withGradient,
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
        $withGradient={withGradient}
        {...props}
    >
        <ButtonLoader
            $pending={pending}
            $secondary={secondary}
            $tertiary={tertiary}
            $isWhite={isWhite}
            $isPurpleText={isPurpleText}
            $withGradient={withGradient}
        >
            {children}
        </ButtonLoader>
    </ButtonBody>
);

export default Button;
