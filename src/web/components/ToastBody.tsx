import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import Timer from 'helpers/timer';

import useAnimationEnd from 'hooks/useAnimationEnd';

import { TOAST_TYPE } from 'services/toast.service';

import IconClose from 'assets/icons/nav/icon-close-alt-16.svg';

import { IconFail, IconSuccess } from 'basics/icons';

import { cardBoxShadow, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

const ToastBody = styled.div<{ $isShow: boolean }>`
    width: 36.2rem;
    min-height: 12rem;
    display: flex;
    align-items: center;
    padding: 2rem 4rem;
    background: ${COLORS.white};
    ${cardBoxShadow};
    border-radius: 1rem;
    animation: ${({ $isShow }) =>
        $isShow ? 'openingToast ease-in-out 0.8s' : 'closingToast linear 0.4s'};
    margin-bottom: 2rem;
    margin-right: 2rem;
    position: relative;
    overflow: hidden;

    ${respondDown(Breakpoints.md)`
        max-width: calc(100vw - 4rem);
        animation: ${({ $isShow }) =>
            $isShow ? 'openingToast ease-in-out 0.8s' : 'closingToastBottom linear 0.4s'};
        min-height: 8rem;
        box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.2);
    `};

    @keyframes openingToast {
        0% {
            transform: translateX(100%);
            opacity: 0;
        }

        30% {
            transform: translateX(-3rem);
            opacity: 1;
        }

        50% {
            transform: translateX(1rem);
            opacity: 1;
        }

        70% {
            transform: translateX(-1.5rem);
            opacity: 1;
        }

        100% {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes closingToast {
        0% {
            transform: translateX(0);
            opacity: 1;
        }
        20% {
            transform: translateX(-5rem);
            opacity: 1;
        }
        50% {
            transform: translateX(100%);
            opacity: 0;
            height: 12rem;
            margin-top: 2rem;
        }
        100% {
            transform: translateX(100%);
            opacity: 0;
            height: 0;
            margin-top: 0;
        }
    }

    @keyframes closingToastBottom {
        0% {
            transform: translateX(0);
            opacity: 1;
        }
        20% {
            transform: translateX(-5rem);
            opacity: 1;
        }
        50% {
            transform: translateX(100%);
            opacity: 0;
            height: 8rem;
            margin-bottom: 2rem;
        }
        100% {
            transform: translateX(100%);
            opacity: 0;
            height: 0;
            margin-bottom: 0;
        }
    }
`;

const CloseButton = styled(IconClose)`
    position: absolute;
    right: 1.5rem;
    top: 1.5rem;
    cursor: pointer;
`;

const Loader = styled.div<{ $pause: boolean; $delay: number }>`
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 0.4rem;
    background: ${COLORS.purple500};
    animation: ${({ $delay }) => `load linear ${$delay / 1000}s`};
    animation-play-state: ${({ $pause }) => ($pause ? 'paused' : 'running')};

    @keyframes load {
        0% {
            width: 100%;
        }

        100% {
            width: 0;
        }
    }
`;

const ToastText = styled.span`
    margin-left: 0.8rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textSecondary};
`;

type ToastProps = {
    text: string;
    resolver: (value?: unknown) => void;
    delay: number;
    type: TOAST_TYPE;
};

export const Toast = ({ text, resolver, delay, type }: ToastProps): React.ReactNode => {
    const [isShow, setIsShow] = useState(true);
    const [onHover, setOnHover] = useState(false);
    const ref = useRef(null);

    const transitionHandler = (animationName: string) => {
        if (
            !isShow &&
            (animationName === 'closingToast' || animationName === 'closingToastBottom')
        ) {
            resolver();
        }
    };

    const close = () => {
        setIsShow(false);
    };

    const timer = useRef(new Timer(close, delay));

    useEffect(() => {
        timer.current.start();

        return () => timer.current.clear();
    }, []);

    useAnimationEnd(ref, transitionHandler);

    return (
        <ToastBody
            $isShow={isShow}
            ref={ref}
            onMouseEnter={() => {
                setOnHover(true);
                timer.current.pause();
            }}
            onMouseLeave={() => {
                setOnHover(false);
                timer.current.resume();
            }}
            onTouchStart={() => {
                setOnHover(true);
                timer.current.pause();
            }}
        >
            <CloseButton onClick={() => close()} />

            {type === TOAST_TYPE.success && <IconSuccess />}
            {type === TOAST_TYPE.error && <IconFail />}
            <ToastText>{text}</ToastText>

            <Loader $pause={onHover} $delay={delay} />
        </ToastBody>
    );
};
