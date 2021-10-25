import * as React from 'react';
import styled, { css } from 'styled-components';
import { COLORS } from '../styles';

export enum TOOLTIP_POSITION {
    top = 'top',
    bottom = 'bottom',
    left = 'left',
    right = 'right',
}

const ChildrenBlock = styled.div`
    position: relative;
    display: inline-block;
`;

const TooltipTop = css`
    bottom: calc(100% + 0.8rem);
    left: 50%;
    transform: translateX(-50%);

    &::after {
        top: 100%;
        border-top: 0.6rem solid ${COLORS.tooltip};
        border-left: 0.6rem solid ${COLORS.transparent};
        border-right: 0.6rem solid ${COLORS.transparent};
    }
`;

const TooltipBottom = css`
    top: calc(100% + 0.8rem);
    left: 50%;
    transform: translateX(-50%);

    &::after {
        bottom: 100%;
        border-bottom: 0.6rem solid ${COLORS.tooltip};
        border-left: 0.6rem solid ${COLORS.transparent};
        border-right: 0.6rem solid ${COLORS.transparent};
    }
`;

const TooltipLeft = css`
    top: 50%;
    right: calc(100% + 0.8rem);
    transform: translateY(-50%);

    &::after {
        left: 100%;
        border-left: 0.6rem solid ${COLORS.tooltip};
        border-top: 0.6rem solid ${COLORS.transparent};
        border-bottom: 0.6rem solid ${COLORS.transparent};
    }
`;

const TooltipRight = css`
    top: 50%;
    left: calc(100% + 0.8rem);
    transform: translateY(-50%);

    &::after {
        right: 100%;
        border-right: 0.6rem solid ${COLORS.tooltip};
        border-top: 0.6rem solid ${COLORS.transparent};
        border-bottom: 0.6rem solid ${COLORS.transparent};
    }
`;

const TooltipBody = styled.div<{ position: TOOLTIP_POSITION }>`
    position: absolute;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0.9rem 1.2rem;
    color: ${COLORS.white};
    background-color: ${COLORS.tooltip};
    border-radius: 0.5rem;
    white-space: nowrap;

    &::after {
        content: '';
        display: block;
        position: absolute;
    }

    ${({ position }) =>
        (position === TOOLTIP_POSITION.top && TooltipTop) ||
        (position === TOOLTIP_POSITION.bottom && TooltipBottom) ||
        (position === TOOLTIP_POSITION.left && TooltipLeft) ||
        (position === TOOLTIP_POSITION.right && TooltipRight)}
`;

const Tooltip = ({
    children,
    content,
    position = TOOLTIP_POSITION.top,
    isShow,
}: {
    children: React.ReactNode;
    content: React.ReactNode;
    position: TOOLTIP_POSITION;
    isShow: boolean;
}): JSX.Element => {
    return (
        <ChildrenBlock>
            {children}
            {isShow && <TooltipBody position={position}>{content}</TooltipBody>}
        </ChildrenBlock>
    );
};

export default Tooltip;
