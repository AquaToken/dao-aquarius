import styled from 'styled-components';
import { COLORS, Z_INDEX } from '../../styles';
import { flexAllCenter } from '../../mixins';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as React from 'react';
import CloseIcon from '../../assets/img/icon-close.svg';

const ModalWrapper = styled.div`
    position: fixed;
    z-index: ${Z_INDEX.modal};
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    ${flexAllCenter};

    &:first-child {
        background: rgba(15, 0, 35, 0.8);
    }
`;

const ModalInner = styled.div`
    border-radius: 1rem;
    background: #fff;
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    padding: 6.4rem 4.8rem 4.8rem;
    animation: ${({ isShow }: { isShow: boolean }) => (isShow ? 'opening 300ms' : 'closing 300ms')};
    position: relative;

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

const CloseButton = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
    padding: 2.5rem;
    box-sizing: border-box;
    background-color: ${COLORS.lightGray};
    border-radius: 1rem;
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
}: {
    resolver: (unknown) => void;
    children: JSX.Element;
    params: unknown;
    hideClose: boolean;
    triggerClosePromise: Promise<unknown>;
}): JSX.Element => {
    const [isShow, setIsShow] = useState(true);
    const [resolvedData, setResolvedData] = useState(null);
    const ref = useRef(null);

    useLayoutEffect(() => {
        ref.current.addEventListener('animationend', transitionHandler);

        return () => {
            ref.current.removeEventListener('animationend', transitionHandler);
        };
    });

    const transitionHandler = () => {
        if (!isShow) {
            resolver(resolvedData);
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
            <ModalInner ref={ref} isShow={isShow}>
                {!hideClose && (
                    <CloseButton onClick={() => close()}>
                        <CloseIcon />
                    </CloseButton>
                )}
                {React.cloneElement(children, { confirm, close, params })}
            </ModalInner>
        </ModalWrapper>
    );
};

export const ModalTitle = styled.h3`
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.titleText};
    margin-bottom: 0.8rem;
`;

export const ModalDescription = styled.div<{ smallMarginBottom?: boolean }>`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.descriptionText};
    margin-bottom: ${({ smallMarginBottom }) => (smallMarginBottom ? '2.4rem' : '4rem')};
`;
