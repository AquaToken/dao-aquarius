import * as React from 'react';
import { useState } from 'react';
import styled, { css } from 'styled-components';

import { COLORS, Z_INDEX } from 'web/styles';

export enum TOOLTIP_POSITION {
    top = 'top',
    bottom = 'bottom',
    left = 'left',
    right = 'right',
}

const ChildrenBlock = styled.div`
    position: relative;
    display: flex;
    width: fit-content;
    height: fit-content;
`;

const TooltipTop = (background: string) => css`
    bottom: calc(100% + 0.8rem);
    left: 50%;
    transform: translateX(-50%);

    &::after {
        top: 100%;
        border-top: 0.6rem solid ${background};
        border-left: 0.6rem solid ${COLORS.transparent};
        border-right: 0.6rem solid ${COLORS.transparent};
    }
`;

const TooltipBottom = (background: string) => css`
    top: calc(100% + 0.8rem);
    left: 50%;
    transform: translateX(-50%);

    &::after {
        bottom: 100%;
        border-bottom: 0.6rem solid ${background};
        border-left: 0.6rem solid ${COLORS.transparent};
        border-right: 0.6rem solid ${COLORS.transparent};
    }
`;

const TooltipLeft = (background: string) => css`
    top: 50%;
    right: calc(100% + 0.8rem);
    transform: translateY(-50%);

    &::after {
        left: 100%;
        border-left: 0.6rem solid ${background};
        border-top: 0.6rem solid ${COLORS.transparent};
        border-bottom: 0.6rem solid ${COLORS.transparent};
    }
`;

const TooltipRight = (background: string) => css`
    top: 50%;
    left: calc(100% + 0.8rem);
    transform: translateY(-50%);

    &::after {
        right: 100%;
        border-right: 0.6rem solid ${background};
        border-top: 0.6rem solid ${COLORS.transparent};
        border-bottom: 0.6rem solid ${COLORS.transparent};
    }
`;

const TooltipBody = styled.div<{
    $position: TOOLTIP_POSITION;
    $background: string;
    $color: string;
}>`
    position: absolute;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0.9rem 1.2rem;
    color: ${({ $color }) => $color};
    background-color: ${({ $background }) => $background};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 0.5rem;
    white-space: nowrap;
    z-index: ${Z_INDEX.tooltip};

    &::after {
        content: '';
        display: block;
        position: absolute;
    }

    ${({ $position, $background }) =>
        ($position === TOOLTIP_POSITION.top && TooltipTop($background)) ||
        ($position === TOOLTIP_POSITION.bottom && TooltipBottom($background)) ||
        ($position === TOOLTIP_POSITION.left && TooltipLeft($background)) ||
        ($position === TOOLTIP_POSITION.right && TooltipRight($background))}
`;

interface TooltipProps extends React.DOMAttributes<HTMLDivElement> {
    children: React.ReactNode;
    content: React.ReactNode;
    position: TOOLTIP_POSITION;
    isShow?: boolean;
    showOnHover?: boolean;
    background?: string;
    color?: string;
}

const Tooltip = ({
    children,
    content,
    position = TOOLTIP_POSITION.top,
    isShow,
    showOnHover,
    background = COLORS.tooltip,
    color = COLORS.white,
    ...props
}: TooltipProps): React.ReactNode => {
    const [onHover, setOnHover] = useState(false);

    return (
        <ChildrenBlock
            {...props}
            onMouseEnter={(e: React.MouseEvent) => {
                e.stopPropagation();
                setOnHover(true);
            }}
            onMouseLeave={(e: React.MouseEvent) => {
                e.stopPropagation();
                setOnHover(false);
            }}
            onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                setOnHover(value => !value);
            }}
        >
            {children}
            {(showOnHover ? onHover && isShow !== false : isShow) && (
                <TooltipBody $position={position} $background={background} $color={color}>
                    {content}
                </TooltipBody>
            )}
        </ChildrenBlock>
    );
};

export default Tooltip;
