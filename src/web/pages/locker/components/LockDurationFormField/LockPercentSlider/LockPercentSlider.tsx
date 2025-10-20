import * as React from 'react';

import { formatDuration } from 'helpers/date';

import { COLORS } from 'web/styles';

import { RangeInput } from 'basics/inputs';

interface Props {
    lockPercent: number;
    onChange: (percent: number) => void;
    lockPeriod: number;
}

export const LockPercentSlider: React.FC<Props> = ({ lockPercent, onChange, lockPeriod }) => (
    <RangeInput
        onChange={onChange}
        value={lockPercent}
        marks={5}
        labels="y"
        size="large"
        highlight={{
            range: [60, 100],
            label: 'Max.rewards',
            color: lockPercent >= 60 ? COLORS.purple500 : COLORS.gray200,
        }}
        customCurrentValue={formatDuration(lockPeriod - Date.now())}
    />
);
