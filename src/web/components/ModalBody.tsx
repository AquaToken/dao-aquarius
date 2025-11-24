import * as React from 'react';
import {
    DetailedReactHTMLElement,
    HTMLAttributes,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import styled from 'styled-components';

import useAnimationEnd from 'hooks/useAnimationEnd';
import useOnClickOutside from 'hooks/useOutsideClick';

import { ModalProps } from 'types/modal';

import ArrowRight from 'assets/icons/arrows/arrow-alt2-16.svg';
import CloseIcon from 'assets/icons/nav/icon-close-16.svg';

import { cardBoxShadow, flexAllCenter, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS, Z_INDEX } from 'styles/style-constants';

const ModalWrapper = styled.div`
    position: fixed;
    z-index: ${Z_INDEX.modal};
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    ${flexAllCenter};

    &:last-child {
        background: rgba(15, 0, 35, 0.8);
    }

    ${respondDown(Breakpoints.md)`
          &:last-child {
              background: transparent;
          }
    `};
`;

const ModalInner = styled.div<{ $withBackground: boolean; $isShow: boolean }>`
    border-radius: 1rem;
    background: ${COLORS.white};
    ${cardBoxShadow};
    padding: ${({ $withBackground }) => ($withBackground ? '0 0 1rem' : '6.4rem 0 0')};
    animation: ${({ $isShow }) => ($isShow ? 'opening 300ms' : 'closing 300ms')};
    position: relative;

    ${respondDown(Breakpoints.md)`
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        border-radius: 0;
        padding: ${({ $withBackground }) => ($withBackground ? '0 0 1rem' : '3.2rem 0 1rem')};
        overflow-y: auto;
    `};

    @keyframes opening {
        0% {
            transform: translateY(-100vh);
            opacity: 0;
        }
        100% {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @keyframes closing {
        0% {
            transform: translateY(0);
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh);
            opacity: 0;
        }
    }
`;

const ModalContent = styled.div`
    margin: 0 3.8rem 4.8rem;

    ${respondDown(Breakpoints.md)`
        margin: 0 1.6rem 2rem;
    `};
`;

const CloseButton = styled.div<{ $withBackground: boolean }>`
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
    padding: 2.5rem;
    box-sizing: border-box;
    background-color: ${({ $withBackground }) => ($withBackground ? COLORS.white : COLORS.gray50)};
    border-radius: 1rem;

    ${respondDown(Breakpoints.md)`
        padding: 2rem;
    `};
`;

const ArrowLeft = styled(ArrowRight)`
    transform: rotate(180deg);

    path {
        fill: ${COLORS.purple500};
    }
`;

const BackButton = styled(CloseButton)`
    right: 7rem;
`;

const BackgroundBlock = styled.div`
    background-color: ${COLORS.gray50};
    max-height: 28.2rem;
    overflow: hidden;
    margin-bottom: 4rem;
    border-radius: 1rem 1rem 0 0;
`;

export const ModalBody = ({
    resolver,
    children,
    params,
    hideClose,
    triggerClosePromise,
    backgroundImage,
    disableClickOutside,
    backButtonCb,
    state,
}: {
    resolver: (value: unknown) => void;
    children: DetailedReactHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    params: unknown;
    hideClose: boolean;
    triggerClosePromise: Promise<unknown>;
    backgroundImage: React.ReactNode | null;
    disableClickOutside: boolean;
    state: { isActive: boolean };
    backButtonCb: () => void | null;
}): React.ReactNode => {
    const [isShow, setIsShow] = useState(true);
    const [resolvedData, setResolvedData] = useState(null);
    const ref = useRef(null);

    const close = () => {
        setIsShow(false);
        setResolvedData({ isConfirmed: false });
    };

    const transitionHandler = () => {
        if (!isShow) {
            resolver(resolvedData);
        }
    };

    useAnimationEnd(ref, transitionHandler);

    const clickHandler = ({ key }) => {
        if (!hideClose && key === 'Escape') {
            close();
        }
    };

    useLayoutEffect(() => {
        document.addEventListener('keydown', clickHandler, false);

        return () => {
            document.removeEventListener('keydown', clickHandler, false);
        };
    });

    const confirm = (data: object) => {
        setIsShow(false);
        setResolvedData({ ...data, isConfirmed: true });
    };

    useOnClickOutside(ref, () => {
        if (!hideClose && !disableClickOutside && state.isActive) {
            close();
        }
    });

    useEffect(() => {
        triggerClosePromise.then(res => {
            setIsShow(false);
            setResolvedData(res);
        });
    }, []);

    return (
        <ModalWrapper>
            <ModalInner ref={ref} $isShow={isShow} $withBackground={Boolean(backgroundImage)}>
                {backgroundImage && <BackgroundBlock>{backgroundImage}</BackgroundBlock>}
                {Boolean(backButtonCb) && (
                    <BackButton
                        onClick={() => {
                            close();
                            backButtonCb();
                        }}
                        $withBackground={Boolean(backgroundImage)}
                    >
                        <ArrowLeft />
                    </BackButton>
                )}
                {!hideClose && (
                    <CloseButton onClick={() => close()} $withBackground={Boolean(backgroundImage)}>
                        <CloseIcon />
                    </CloseButton>
                )}
                <ModalContent>
                    {React.cloneElement(children, { confirm, close, params } as Partial<
                        HTMLAttributes<HTMLElement>
                    > &
                        ModalProps<unknown>)}
                </ModalContent>
            </ModalInner>
        </ModalWrapper>
    );
};
