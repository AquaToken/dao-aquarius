import * as React from 'react';
import { useCallback, useState } from 'react';
import styled from 'styled-components';

import { flexAllCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

const TooltipWrapper = styled.div`
    max-width: 28.8rem;
    white-space: pre-line;
    width: max-content;
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

const LabelWrapper = styled.div<{
    $background: string;
    $color: string;
    $cursor?: string;
    $padding: string;
    $innerBorderRadius: string;
    $innerFontSize: string;
    $innerLineHeight: string;
    $withoutBorder?: boolean;
    $withoutUppercase?: boolean;
    $fontWeight?: string | number;
}>`
    ${flexAllCenter};
    width: max-content;
    padding: ${({ $padding }) => $padding};
    background: ${({ $background }) => $background};
    color: ${({ $color }) => $color};
    border: ${({ $color, $withoutBorder }) => ($withoutBorder ? 'none' : `0.1rem solid ${$color}`)};
    text-transform: ${({ $withoutUppercase }) => ($withoutUppercase ? 'none' : 'uppercase')};
    font-weight: ${({ $fontWeight }) => $fontWeight ?? 700};
    border-radius: ${({ $innerBorderRadius }) => $innerBorderRadius};
    font-size: ${({ $innerFontSize }) => $innerFontSize};
    line-height: ${({ $innerLineHeight }) => $innerLineHeight};
    cursor: ${({ $cursor }) => $cursor};
    white-space: nowrap;
`;

const SCROLL_OFFSET = window.navigator.userAgent.indexOf('win') > -1 ? 20 : 0;

const LABEL_STYLES = {
    default: {
        $padding: '0 0.4rem',
        $innerBorderRadius: '0.3rem',
        $innerFontSize: '0.8rem',
        $innerLineHeight: '1.4rem',
        $cursor: 'help',
    },
    medium: {
        $padding: '0 0.4rem',
        $innerBorderRadius: '0.3rem',
        $innerFontSize: '1.4rem',
        $innerLineHeight: '2rem',
        $cursor: 'help',
    },
    big: {
        $padding: '0.5rem 0.4rem',
        $innerBorderRadius: '0.4rem',
        $innerFontSize: '1.6rem',
        $innerLineHeight: '1.6rem',
        $cursor: 'help',
    },

    extraLarge: {
        $padding: '0.4rem 0.8rem',
        $innerBorderRadius: '0.8rem',
        $innerFontSize: '1.6rem',
        $innerLineHeight: '2.8rem',
        $cursor: 'help',
    },
};

type LabelSize = 'default' | 'medium' | 'big' | 'extraLarge';

interface LabelProps {
    labelText: string | React.ReactNode;
    labelSize?: LabelSize;
    tooltipText?: string | React.ReactNode;
    background?: string;
    color?: string;
    tooltipColor?: string;
    tooltipBackground?: string;
    withoutBorder?: boolean;
    withoutUppercase?: boolean;
    fontWeight?: string | number;
}

const Label = ({
    labelText,
    tooltipText,
    labelSize = 'default',
    background = COLORS.purple500,
    color = COLORS.white,
    tooltipColor,
    tooltipBackground,
    withoutBorder,
    withoutUppercase,
    fontWeight,
    ...props
}: LabelProps): React.ReactNode => {
    const [isEnoughSpaceOnTop, setIsEnoughSpaceOnTop] = useState(true);
    const [isRightOriented, setIsRightOriented] = useState(true);
    const labelStyles = LABEL_STYLES[labelSize];

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

    if (!tooltipText) {
        return (
            <LabelWrapper
                {...labelStyles}
                {...props}
                $cursor="default"
                $background={background}
                $color={color}
                $withoutBorder={withoutBorder}
                $withoutUppercase={withoutUppercase}
                $fontWeight={fontWeight}
            >
                {labelText}
            </LabelWrapper>
        );
    }

    return (
        <Tooltip
            content={<TooltipWrapper ref={ref}>{tooltipText}</TooltipWrapper>}
            position={
                isEnoughSpaceOnTop
                    ? TOOLTIP_POSITION.top
                    : isRightOriented
                    ? TOOLTIP_POSITION.right
                    : TOOLTIP_POSITION.left
            }
            background={tooltipBackground ?? background}
            color={tooltipColor ?? color}
            showOnHover
        >
            <LabelWrap>
                <LabelWrapper
                    {...labelStyles}
                    $background={background}
                    $color={color}
                    $withoutBorder={withoutBorder}
                    $withoutUppercase={withoutUppercase}
                    {...props}
                >
                    {labelText}
                </LabelWrapper>
            </LabelWrap>
        </Tooltip>
    );
};

export default Label;
