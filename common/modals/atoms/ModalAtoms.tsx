import styled from 'styled-components';
import { Breakpoints, COLORS, Z_INDEX } from '../../styles';
import { flexAllCenter, respondDown } from '../../mixins';
import * as React from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import CloseIcon from '../../assets/img/icon-close.svg';
import useOnClickOutside from '../../hooks/useOutsideClick';

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

const ModalInner = styled.div<{ withBackground: boolean; isShow: boolean }>`
    border-radius: 1rem;
    background: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    padding: ${({ withBackground }) => (withBackground ? '0 0 1rem' : '6.4rem 0 1rem')};
    animation: ${({ isShow }) => (isShow ? 'opening 300ms' : 'closing 300ms')};
    position: relative;

    ${respondDown(Breakpoints.md)`
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        border-radius: 0;
        padding: ${({ withBackground }) => (withBackground ? '0 0 1rem' : '3.2rem 0 1rem')};
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
    padding: 0 4.8rem 3.8rem;

    ${respondDown(Breakpoints.md)`
        padding: 0 1.6rem 2rem;
    `};
`;

const CloseButton = styled.div<{ withBackground: boolean }>`
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
    padding: 2.5rem;
    box-sizing: border-box;
    background-color: ${({ withBackground }) => (withBackground ? COLORS.white : COLORS.lightGray)};
    border-radius: 1rem;

    ${respondDown(Breakpoints.md)`
        padding: 2rem;
    `};
`;

const BackgroundBlock = styled.div`
    background-color: ${COLORS.lightGray};
    max-height: 28.2rem;
    overflow: hidden;
    margin-bottom: 4rem;
    border-radius: 1rem 1rem 0 0;
`;

type ModalClose = () => void;
type ModalConfirm = (unknown) => void;

export interface ModalProps<T> {
    confirm: ModalConfirm;
    close: ModalClose;
    params?: T;
}

export const ModalBody = ({
    resolver,
    children,
    params,
    hideClose,
    triggerClosePromise,
    backgroundImage,
}: {
    resolver: (unknown) => void;
    children: JSX.Element;
    params: unknown;
    hideClose: boolean;
    triggerClosePromise: Promise<unknown>;
    backgroundImage: JSX.Element | null;
}): JSX.Element => {
    const [isShow, setIsShow] = useState(true);
    const [resolvedData, setResolvedData] = useState(null);
    const ref = useRef(null);

    useLayoutEffect(() => {
        ref.current.addEventListener('animationend', transitionHandler);
        document.addEventListener('keydown', clickHandler, false);

        return () => {
            ref.current.removeEventListener('animationend', transitionHandler);
            document.removeEventListener('keydown', clickHandler, false);
        };
    });

    useOnClickOutside(ref, () => {
        if (!hideClose) {
            close();
        }
    });

    const transitionHandler = () => {
        if (!isShow) {
            resolver(resolvedData);
        }
    };

    const clickHandler = ({ key }) => {
        if (!hideClose && key === 'Escape') {
            close();
        }
    };

    const confirm = (data) => {
        setIsShow(false);
        setResolvedData({ ...data, isConfirmed: true });
    };

    const close = () => {
        setIsShow(false);
        setResolvedData({ isConfirmed: false });
    };

    useEffect(() => {
        triggerClosePromise.then((res) => {
            setIsShow(false);
            setResolvedData(res);
        });
    }, []);

    return (
        <ModalWrapper>
            <ModalInner ref={ref} isShow={isShow} withBackground={Boolean(backgroundImage)}>
                {backgroundImage && <BackgroundBlock>{backgroundImage}</BackgroundBlock>}
                {!hideClose && (
                    <CloseButton onClick={() => close()} withBackground={Boolean(backgroundImage)}>
                        <CloseIcon />
                    </CloseButton>
                )}
                <ModalContent>
                    {React.cloneElement(children, { confirm, close, params })}
                </ModalContent>
            </ModalInner>
        </ModalWrapper>
    );
};

export const ModalTitle = styled.h3`
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.titleText};
    margin-bottom: 0.8rem;
    font-weight: normal;

    ${respondDown(Breakpoints.md)`
        font-size: 2rem;
        line-height: 2.6rem;
    `};
`;

export const ModalDescription = styled.div<{ smallMarginBottom?: boolean }>`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.descriptionText};
    margin-bottom: ${({ smallMarginBottom }) => (smallMarginBottom ? '2.4rem' : '4rem')};

    ${respondDown(Breakpoints.md)`
         margin-bottom: 2.4rem;
    `};
`;
