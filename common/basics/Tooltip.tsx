import * as React from 'react';
import styled, { css } from 'styled-components';
import { COLORS, Z_INDEX } from '../styles';

export enum TOOLTIP_POSITION {
    top = 'top',
    bottom = 'bottom',
    left = 'left',
    right = 'right',
}

const ChildrenBlock = styled.div`
    position: relative;
    display: flex;
`;

const TooltipTop = (isError, isSuccess, isWhite) => css`
    bottom: calc(100% + 0.8rem);
    left: 50%;
    transform: translateX(-50%);

    &::after {
        top: 100%;
        border-top: 0.6rem solid
            ${isError
                ? COLORS.pinkRed
                : isSuccess
                ? COLORS.green
                : isWhite
                ? COLORS.white
                : COLORS.tooltip};
        border-left: 0.6rem solid ${COLORS.transparent};
        border-right: 0.6rem solid ${COLORS.transparent};
    }
`;

const TooltipBottom = (isError, isSuccess, isWhite) => css`
    top: calc(100% + 0.8rem);
    left: 50%;
    transform: translateX(-50%);

    &::after {
        bottom: 100%;
        border-bottom: 0.6rem solid
            ${isError
                ? COLORS.pinkRed
                : isSuccess
                ? COLORS.green
                : isWhite
                ? COLORS.white
                : COLORS.tooltip};
        border-left: 0.6rem solid ${COLORS.transparent};
        border-right: 0.6rem solid ${COLORS.transparent};
    }
`;

const TooltipLeft = (isError, isSuccess, isWhite) => css`
    top: 50%;
    right: calc(100% + 0.8rem);
    transform: translateY(-50%);

    &::after {
        left: 100%;
        border-left: 0.6rem solid
            ${isError
                ? COLORS.pinkRed
                : isSuccess
                ? COLORS.green
                : isWhite
                ? COLORS.white
                : COLORS.tooltip};
        border-top: 0.6rem solid ${COLORS.transparent};
        border-bottom: 0.6rem solid ${COLORS.transparent};
    }
`;

const TooltipRight = (isError, isSuccess, isWhite) => css`
    top: 50%;
    left: calc(100% + 0.8rem);
    transform: translateY(-50%);

    &::after {
        right: 100%;
        border-right: 0.6rem solid
            ${isError
                ? COLORS.pinkRed
                : isSuccess
                ? COLORS.green
                : isWhite
                ? COLORS.white
                : COLORS.tooltip};
        border-top: 0.6rem solid ${COLORS.transparent};
        border-bottom: 0.6rem solid ${COLORS.transparent};
    }
`;

const TooltipBody = styled.div<{
    position: TOOLTIP_POSITION;
    isError?: boolean;
    isSuccess?: boolean;
    isWhite?: boolean;
}>`
    position: absolute;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0.9rem 1.2rem;
    color: ${COLORS.white};
    background-color: ${({ isError, isSuccess, isWhite }) => {
        if (isError) {
            return COLORS.pinkRed;
        }
        if (isSuccess) {
            return COLORS.green;
        }
        if (isWhite) {
            return COLORS.white;
        }
        return COLORS.tooltip;
    }};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 0.5rem;
    white-space: nowrap;
    z-index: ${Z_INDEX.tooltip};

    &::after {
        content: '';
        display: block;
        position: absolute;
    }

    ${({ position, isError, isSuccess, isWhite }) =>
        (position === TOOLTIP_POSITION.top && TooltipTop(isError, isSuccess, isWhite)) ||
        (position === TOOLTIP_POSITION.bottom && TooltipBottom(isError, isSuccess, isWhite)) ||
        (position === TOOLTIP_POSITION.left && TooltipLeft(isError, isSuccess, isWhite)) ||
        (position === TOOLTIP_POSITION.right && TooltipRight(isError, isSuccess, isWhite))}
`;

interface TooltipProps extends React.DOMAttributes<HTMLDivElement> {
    children: React.ReactNode;
    content: React.ReactNode;
    position: TOOLTIP_POSITION;
    isShow: boolean;
    isError?: boolean;
    isSuccess?: boolean;
    isWhite?: boolean;
}

const Tooltip = ({
    children,
    content,
    position = TOOLTIP_POSITION.top,
    isShow,
    isError,
    isSuccess,
    isWhite,
    ...props
}: TooltipProps): JSX.Element => {
    return (
        <ChildrenBlock {...props}>
            {children}
            {isShow && (
                <TooltipBody
                    position={position}
                    isError={isError}
                    isSuccess={isSuccess}
                    isWhite={isWhite}
                >
                    {content}
                </TooltipBody>
            )}
        </ChildrenBlock>
    );
};

export default Tooltip;
