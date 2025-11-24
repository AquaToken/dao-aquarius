import styled, { keyframes, css } from 'styled-components';

import { COLORS } from 'styles/style-constants';

type LiveIndicatorProps = {
    size?: number;
    color?: string;
    active?: boolean;
    periodSec?: number;
    ariaLabel?: string;
    className?: string;
};

const pulse = keyframes`
  0%   { transform: scale(0.8); opacity: 0.6; }
  100% { transform: scale(1.6); opacity: 0.0; }
`;

const Root = styled.span<{
    $size: number;
    $active: boolean;
    $periodSec: number;
}>`
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: ${({ $size }) => $size}px;
    height: ${({ $size }) => $size}px;
    margin: ${({ $size }) => `0 ${Math.round($size * 0.2)}px`};
`;

const Dot = styled.span<{
    $size: number;
    $color: string;
}>`
    width: ${({ $size }) => Math.round($size * 0.45)}px;
    height: ${({ $size }) => Math.round($size * 0.45)}px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
`;

const Halo = styled.span<{
    $size: number;
    $color: string;
    $active: boolean;
    $periodSec: number;
}>`
    position: absolute;
    width: ${({ $size }) => Math.round($size * 0.9)}px;
    height: ${({ $size }) => Math.round($size * 0.9)}px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
    opacity: 0.25;

    ${({ $active, $periodSec }) =>
        $active
            ? css`
                  @media (prefers-reduced-motion: no-preference) {
                      animation: ${pulse} ${$periodSec}s linear infinite;
                  }
              `
            : css`
                  opacity: 0.15;
                  transform: scale(1);
              `}
`;

const LiveIndicator = ({
    size = 20,
    color = COLORS.green500,
    active = true,
    periodSec = 1.5,
    ariaLabel = 'Live',
    className,
}: LiveIndicatorProps) => (
    <Root
        className={className}
        $size={size}
        $active={active}
        $periodSec={periodSec}
        role="status"
        aria-live="polite"
        aria-label={active ? ariaLabel : `${ariaLabel} paused`}
        title={active ? ariaLabel : `${ariaLabel} paused`}
    >
        <Halo $size={size} $color={color} $active={active} $periodSec={periodSec} />
        <Dot $size={size} $color={color} />
    </Root>
);

export default LiveIndicator;
