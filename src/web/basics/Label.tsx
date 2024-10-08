import * as React from 'react';
import { useCallback, useState } from 'react';
import styled from 'styled-components';

import { flexAllCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

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
    $background: string;
    $color: string;
}>`
    ${flexAllCenter};
    height: 1.6rem;
    padding: 0 0.4rem;
    border-radius: 0.3rem;
    background: ${({ $background }) => $background};
    color: ${({ $color }) => $color};
    border: ${({ $color }) => `0.1rem solid ${$color}`};
    text-transform: uppercase;
    font-weight: 700;
    font-size: 0.8rem;
    line-height: 1.8rem;
    cursor: help;
    white-space: nowrap;
`;

const SCROLL_OFFSET = window.navigator.userAgent.indexOf('win') > -1 ? 20 : 0;

interface LabelProps {
    title: string;
    text?: string | React.ReactNode;
    background?: string;
    color?: string;
}

const Label = ({
    title,
    text,
    background = COLORS.purple,
    color = COLORS.white,
    ...props
}: LabelProps): React.ReactNode => {
    const [isEnoughSpaceOnTop, setIsEnoughSpaceOnTop] = useState(true);
    const [isRightOriented, setIsRightOriented] = useState(true);

    const ref = useCallback(
        (node: HTMLDivElement) => {
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
            <LabelInner $background={background} $color={color}>
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
            background={background}
            color={background === COLORS.white ? COLORS.titleText : color}
            showOnHover
        >
            <LabelWrap>
                <LabelInner $background={background} $color={color} {...props}>
                    {title}
                </LabelInner>
            </LabelWrap>
        </Tooltip>
    );
};

export default Label;
