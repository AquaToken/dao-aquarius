import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
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

    &::before {
        height: 1rem;
        top: 100%;
        width: 100%;
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

    &::before {
        height: 1rem;
        bottom: 100%;
        width: 100%;
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

    &::before {
        width: 1.5rem;
        left: 100%;
        height: 100%;
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
    &::before {
        width: 1.5rem;
        right: 100%;
        height: 100%;
    }
`;

const TooltipBody = styled.div<{
    $position: TOOLTIP_POSITION;
    $background: string;
    $color: string;
    $isHidden: boolean;
    $withoutPadding: boolean;
}>`
    position: absolute;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: ${({ $withoutPadding }) => ($withoutPadding ? '0' : '0.9rem 1.2rem')};
    color: ${({ $color }) => $color};
    background-color: ${({ $background }) => $background};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 0.5rem;
    white-space: nowrap;
    z-index: ${Z_INDEX.tooltip};
    visibility: ${({ $isHidden }) => ($isHidden ? 'hidden' : 'visible')};

    // triangle
    &::after {
        content: '';
        display: block;
        position: absolute;
    }

    // hover layout
    &::before {
        position: absolute;
        content: '';
        background: ${COLORS.transparent};
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
    position?: TOOLTIP_POSITION;
    isShow?: boolean;
    showOnHover?: boolean;
    background?: string;
    color?: string;
    withoutPadding?: boolean;
}

const Tooltip = ({
    children,
    content,
    position,
    isShow,
    showOnHover,
    background = COLORS.tooltip,
    color = COLORS.white,
    withoutPadding = false,
    ...props
}: TooltipProps): React.ReactNode => {
    const [isTooltipVisible, setIsTooltipVisible] = useState(isShow);
    const [isFirstClick, setIsFirstClick] = useState(true);
    const [currentPosition, setCurrentPosition] = useState(position ?? TOOLTIP_POSITION.top);
    const [positionInProgress, setPositionInProgress] = useState(true);
    const [replaceCount, setReplacementCount] = useState(0);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (isFirstClick) {
            setIsTooltipVisible(true);
            setIsFirstClick(false);
        } else {
            setIsTooltipVisible(prev => !prev);
        }
    };

    const handleMouseEnter = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (showOnHover) {
            setIsTooltipVisible(true);
        }
    };

    const handleMouseLeave = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (showOnHover) {
            setIsTooltipVisible(false);
        }
    };

    const tooltipRef = useRef(null);

    const validateAllDimensions = () => {
        if (!tooltipRef.current) {
            return false;
        }
        const OFFSET = 5; // 0.5rem
        const { top, left, right, bottom } = tooltipRef.current.getBoundingClientRect();

        const spaceAbove = top > OFFSET;
        const spaceBelow = bottom < window.innerHeight - OFFSET;
        const spaceLeft = left > OFFSET;
        const spaceRight = right < window.innerWidth - OFFSET;

        return spaceAbove && spaceBelow && spaceLeft && spaceRight;
    };

    useEffect(() => {
        if (!isTooltipVisible || !tooltipRef.current) {
            return;
        }

        if (replaceCount === 4) {
            setCurrentPosition(position || TOOLTIP_POSITION.top);
            setPositionInProgress(false);
            return;
        }
        const validPosition = validateAllDimensions();

        if (validPosition) {
            setPositionInProgress(false);
        } else {
            setReplacementCount(prev => prev + 1);

            switch (currentPosition) {
                case TOOLTIP_POSITION.top:
                    setCurrentPosition(TOOLTIP_POSITION.bottom);
                    break;
                case TOOLTIP_POSITION.bottom:
                    setCurrentPosition(TOOLTIP_POSITION.left);
                    break;
                case TOOLTIP_POSITION.left:
                    setCurrentPosition(TOOLTIP_POSITION.right);
                    break;
                case TOOLTIP_POSITION.right:
                    setCurrentPosition(TOOLTIP_POSITION.top);
                    break;
            }
        }
    }, [currentPosition, isTooltipVisible]);

    return (
        <ChildrenBlock
            {...props}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {(showOnHover ? isTooltipVisible && isShow !== false : isShow) && (
                <TooltipBody
                    $position={currentPosition}
                    $background={background}
                    $color={color}
                    $isHidden={positionInProgress}
                    $withoutPadding={withoutPadding}
                    ref={tooltipRef}
                >
                    {content}
                </TooltipBody>
            )}
        </ChildrenBlock>
    );
};

export default Tooltip;
