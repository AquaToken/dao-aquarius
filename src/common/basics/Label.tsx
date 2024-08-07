import styled from 'styled-components';
import { flexAllCenter, respondDown } from '../mixins';
import { Breakpoints, COLORS } from '../styles';
import * as React from 'react';
import { useCallback, useState } from 'react';
import Tooltip, { TOOLTIP_POSITION } from './Tooltip';

const TooltipInner = styled.div`
    width: 28.8rem;
    white-space: pre-line;
    font-size: 1.4rem;
    line-height: 2rem;
    font-weight: normal;

    a {
        margin-left: 0.5rem;
    }

    ${respondDown(Breakpoints.md)`
        width: 15rem;
    `}
`;

const LabelWrap = styled.div`
    padding-top: 1rem;
    margin-top: -1rem;
`;

const LabelInner = styled.div<{
    isRed?: boolean;
    isGreen?: boolean;
    isDark?: boolean;
    isBlue?: boolean;
    isWhite?: boolean;
}>`
    ${flexAllCenter};
    height: 1.6rem;
    padding: 0 0.4rem;
    border-radius: 0.3rem;
    background: ${({ isRed, isGreen, isDark, isBlue, isWhite }) => {
        if (isRed) {
            return COLORS.pinkRed;
        }
        if (isGreen) {
            return COLORS.green;
        }
        if (isDark) {
            return COLORS.titleText;
        }
        if (isBlue) {
            return COLORS.blue;
        }
        if (isWhite) {
            return COLORS.white;
        }
        return COLORS.purple;
    }};
    color: ${({ isWhite }) => (isWhite ? COLORS.purple : COLORS.white)};
    border: ${({ isWhite }) => (isWhite ? `0.1rem solid ${COLORS.purple}` : 'none')};
    text-transform: uppercase;
    font-weight: 500;
    font-size: 0.8rem;
    line-height: 1.8rem;
    cursor: help;
    white-space: nowrap;
`;

const SCROLL_OFFSET = window.navigator.userAgent.indexOf('win') > -1 ? 20 : 0;

const Label = ({
    title,
    text,
    isGreen,
    isRed,
    isDark,
    isBlue,
    isWhite,
    ...props
}: {
    title: string;
    text?: string | React.ReactNode;
    isGreen?: boolean;
    isRed?: boolean;
    isDark?: boolean;
    isBlue?: boolean;
    isWhite?: boolean;
}) => {
    const [isEnoughSpaceOnTop, setIsEnoughSpaceOnTop] = useState(true);
    const [isRightOriented, setIsRightOriented] = useState(true);

    const ref = useCallback(
        (node) => {
            if (node !== null && isEnoughSpaceOnTop) {
                setIsEnoughSpaceOnTop(
                    node.getBoundingClientRect().left > 0 &&
                        node.getBoundingClientRect().right < window.innerWidth - SCROLL_OFFSET,
                );

                setIsRightOriented(
                    node.getBoundingClientRect().right < window.innerWidth - SCROLL_OFFSET,
                );
            }
        },
        [isEnoughSpaceOnTop],
    );

    if (!text) {
        return (
            <LabelInner
                isGreen={isGreen}
                isRed={isRed}
                isDark={isDark}
                isBlue={isBlue}
                isWhite={isWhite}
            >
                {title}
            </LabelInner>
        );
    }

    return (
        <Tooltip
            content={<TooltipInner ref={ref}>{text}</TooltipInner>}
            position={
                isEnoughSpaceOnTop
                    ? TOOLTIP_POSITION.top
                    : isRightOriented
                    ? TOOLTIP_POSITION.right
                    : TOOLTIP_POSITION.left
            }
            isSuccess={isGreen}
            isError={isRed}
            isDark={isDark}
            isBlue={isBlue}
            showOnHover
        >
            <LabelWrap>
                <LabelInner
                    isGreen={isGreen}
                    isRed={isRed}
                    isDark={isDark}
                    isBlue={isBlue}
                    isWhite={isWhite}
                    {...props}
                >
                    {title}
                </LabelInner>
            </LabelWrap>
        </Tooltip>
    );
};

export default Label;
