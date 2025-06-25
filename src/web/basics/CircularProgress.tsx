import * as React from 'react';

import { COLORS } from '../styles';

interface Props {
    percentage: number;
    size?: number;
    strokeWidth?: number;
}

const CircularProgress = ({ percentage, size = 16, strokeWidth = 2 }: Props) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <svg width={size} height={size} style={{ minWidth: size, minHeight: size }}>
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={COLORS.deepPurple}
                strokeOpacity="0.2"
                strokeWidth={strokeWidth}
                fill="none"
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={COLORS.deepPurple}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
        </svg>
    );
};

export default CircularProgress;
